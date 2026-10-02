import { expect, test } from "@playwright/test";

test("full lesson HTML is present in production responses", async ({
  request,
}) => {
  for (const href of [
    ...Array.from({ length: 11 }, (_, level) => `/learn/forex/level-${level}`),
    "/learn/crypto/level-1",
  ]) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
    const html = await response.text();
    expect(html, href).toContain("<noscript><style>");
    expect(html, href).toContain(
      '[hidden]:has(article[data-enhanced="false"])',
    );
    const panels = html.split(/<div[^>]*role="tabpanel"[^>]*>/).slice(1);
    expect(panels.length, href).toBeGreaterThan(
      href.includes("/crypto/") ? 0 : 1,
    );
    for (const panel of panels) {
      expect(panel, href).toContain("<h2");
      expect(panel, href).toContain("<p");
      expect(panel.length, href).toBeGreaterThan(500);
    }
  }
});

for (const width of [1440, 390, 320]) {
  test(`complete no-JavaScript lessons remain readable at ${width}px`, async ({
    browser,
  }) => {
    test.setTimeout(120_000);
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();
    try {
      for (const href of [
        ...Array.from(
          { length: 11 },
          (_, level) => `/learn/forex/level-${level}`,
        ),
        "/learn/crypto/level-1",
      ]) {
        await page.goto(href);
        const panels = page.locator("article [data-section-index]");
        expect(await panels.count(), href).toBeGreaterThan(
          href.includes("/crypto/") ? 0 : 1,
        );
        for (const panel of await panels.all()) {
          await expect(panel).toBeVisible();
          await expect(
            panel.getByRole("heading", { level: 2 }).first(),
          ).toBeVisible();
          expect((await panel.textContent())?.length, href).toBeGreaterThan(
            100,
          );
        }
        await expect(page.getByRole("tab")).toHaveCount(0);
        await expect(
          page.getByRole("checkbox", { name: "Show all sections at once" }),
        ).toHaveCount(0);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          href,
        ).toBe(true);
      }
    } finally {
      await context.close();
    }
  });
}

for (const width of [1440, 390]) {
  test(`native fragment reveal updates the stepper without losing ticks at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/learn/forex/level-10");
    const tabs = page.getByRole("tab");
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
    const last = page.locator("article [data-section-index]").last();
    await expect(last).toHaveAttribute("hidden", "until-found");
    // Fragment navigation uses the browser's native reveal algorithm, the same
    // beforematch path used by Find. Do not fake a beforematch event.
    const headingId = await last.locator("h2").first().getAttribute("id");
    await page.evaluate((id) => {
      window.location.hash = id!;
    }, headingId);
    await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
    await expect(last).not.toHaveAttribute("hidden");
    await expect(last.locator("h2").first()).toBeVisible();
    const tick = last.getByRole("checkbox").first();
    await tick.check();
    await tabs.first().click();
    await expect(last).toHaveAttribute("hidden", "until-found");
    await tabs.last().click();
    await expect(tick).toBeChecked();
    await page.reload();
    await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
    await expect(tick).toBeChecked();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  });
}

test("printing exposes every section and preserves the reading record", async ({
  page,
}) => {
  await page.goto("/learn/forex/level-5");
  const tabs = page.getByRole("tab");
  await tabs.last().click();
  const tick = page.getByRole("tabpanel").getByRole("checkbox").first();
  await tick.check();
  await tabs.first().click();
  const saved = await page.evaluate(() => JSON.stringify(localStorage));
  const panels = page.locator("article [data-section-index]");
  await expect(panels.last()).toHaveAttribute("hidden", "until-found");
  await page.emulateMedia({ media: "print" });
  for (const panel of await panels.all()) {
    expect(
      await panel.evaluate(
        (element) => getComputedStyle(element).contentVisibility,
      ),
    ).toBe("visible");
    await expect(panel.locator("h2").first()).toBeVisible();
    expect(
      await panel.evaluate((element) => element.getBoundingClientRect().height),
    ).toBeGreaterThan(100);
  }
  await expect(page.getByRole("tab")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Next:/ })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Collapse lesson list" }),
  ).toHaveCount(0);
  await page.pdf({
    path: test.info().outputPath("level-5-full-lesson.pdf"),
    format: "A4",
    printBackground: true,
  });
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(saved);
  await page.emulateMedia({ media: "screen" });
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await expect(panels.last()).toHaveAttribute("hidden", "until-found");
  await tabs.last().click();
  await expect(tick).toBeChecked();
});
