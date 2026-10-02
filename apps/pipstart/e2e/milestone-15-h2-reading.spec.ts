import { expect, test } from "@playwright/test";

for (const width of [1440, 390, 320]) {
  test(`reading resumes and checklist ticks persist at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/learn/forex/level-10");
    const tabs = page.getByRole("tab");
    await tabs.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(1)).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(2)).toBeFocused();
    await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("End");
    await expect(tabs.last()).toBeFocused();
    const panel = page.getByRole("tabpanel");
    const ticks = panel.getByRole("checkbox");
    expect(await ticks.count()).toBeGreaterThan(0);
    await ticks.first().check();
    const sectionUrl = page.url();
    await tabs.first().click();
    await tabs.last().click();
    await expect(ticks.first()).toBeChecked();
    await page.reload();
    await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
    await expect(ticks.first()).toBeChecked();
    await page.goto("/learn/forex/level-10");
    await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
    await expect(ticks.first()).toBeChecked();
    await page
      .getByRole("checkbox", { name: "Show all sections at once" })
      .check();
    await page.reload();
    await expect(
      page.getByRole("checkbox", { name: "Show all sections at once" }),
    ).toBeChecked();
    await page
      .getByRole("checkbox", { name: "Show all sections at once" })
      .uncheck();
    // A URL explicitly selects its section even when a different one was saved.
    await tabs.first().click();
    await page.goto(sectionUrl);
    await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
    await expect(ticks.first()).toBeChecked();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
  });
}

test("reduced motion and blocked storage keep navigation usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, "setItem", {
      value: () => {
        throw new Error("Storage unavailable");
      },
    });
    const original = window.scrollTo.bind(window);
    window.scrollTo = ((options: ScrollToOptions) => {
      (
        window as unknown as { lastScrollBehavior?: string }
      ).lastScrollBehavior = options.behavior;
      original(options);
    }) as typeof window.scrollTo;
  });
  await page.goto("/learn/forex/level-4");
  await page.getByRole("button", { name: /^Next:/ }).click();
  await expect(
    page.getByRole("tabpanel").getByRole("heading", { level: 2 }).first(),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { lastScrollBehavior?: string })
          .lastScrollBehavior,
    ),
  ).toBe("auto");
  await page.getByRole("tab").last().click();
  const tick = page.getByRole("tabpanel").getByRole("checkbox").first();
  await tick.check();
  await page.getByRole("tab").first().click();
  await page.getByRole("tab").last().click();
  await expect(tick).toBeChecked();
});
