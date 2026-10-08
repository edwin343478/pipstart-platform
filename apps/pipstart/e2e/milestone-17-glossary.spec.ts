import reviewed from "../src/content/glossary-catalogue.draft.json";
const reviewMode = process.env.PIPSTART_M17_GLOSSARY_REVIEW === "1";
const counts = { both: 378, forex: 242, crypto: 136 };
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
const cards = (page: Page) => page.locator("[data-glossary-term]:visible");
const grouping = (page: Page) =>
  page.getByRole("navigation", { name: "Terminology grouping" });
async function open(page: Page, href: string) {
  expect((await page.goto(href))?.status()).toBe(200);
  await expect(grouping(page)).toBeVisible();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
}
test("default grouping and bounded scrolling", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await open(page, "/glossary");
  await expect(
    grouping(page).getByRole("link", { name: "Both", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 2 })).toContainText(
    `${counts.both} terms available`,
  );
  await expect(cards(page)).toHaveCount(12);
  for (const name of ["Forex", "Crypto", "Both"])
    await expect(
      grouping(page).getByRole("link", { name, exact: true }),
    ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Search Forex and Crypto", exact: true }),
  ).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(cards(page)).toHaveCount(12);
  await noOverflow(page);
  expect(errors).toEqual([]);
});
test("View more, focus and the final group", async ({ page }) => {
  await open(page, "/glossary");
  await page.getByRole("link", { name: "View more", exact: true }).click();
  await expect(cards(page)).toHaveCount(24);
  await expect(cards(page).nth(12)).toBeFocused();
  await expect(page.getByRole("status")).toHaveText(
    `Showing 24 of ${counts.both} matching terms`,
  );
  await grouping(page)
    .getByRole("link", { name: "Forex", exact: true })
    .click();
  await expect(cards(page)).toHaveCount(12);
  await expect(page.getByRole("heading", { level: 2 })).toContainText(
    `${counts.forex} terms available`,
  );
  await page.getByRole("link", { name: "View more", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(cards(page)).toHaveCount(24);
  await expect(cards(page).nth(12)).toBeFocused();
  {
    await open(page, "/glossary?course=forex&limit=500");
    await expect(cards(page)).toHaveCount(counts.forex);
  }
  await expect(
    page.getByRole("link", { name: "View more", exact: true }),
  ).toHaveCount(0);
});
test("alphabet and grouping resets", async ({ page }) => {
  await open(page, "/glossary");
  const alphabet = page.getByRole("navigation", {
    name: "Filter glossary by letter",
  });
  await alphabet.getByRole("button", { name: "P", exact: true }).click();
  await expect(page).toHaveURL(/letter=P/);
  await expect(cards(page).first()).toBeVisible();
  const names = await cards(page).locator("h3").allTextContents();
  expect(names.every((name) => name.toUpperCase().startsWith("P"))).toBe(true);
  await alphabet.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2 })).toContainText(
    `${counts.both} terms available`,
  );
  await expect(cards(page)).toHaveCount(12);
  await grouping(page)
    .getByRole("link", { name: "Crypto", exact: true })
    .click();
  await expect(page).toHaveURL(/\/glossary\/crypto$/);
  await expect(page.getByRole("heading", { level: 2 })).toContainText(
    `${counts.crypto} terms available`,
  );
  await expect(
    grouping(page).getByRole("link", { name: "Crypto", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page
      .getByRole("navigation", { name: "Filter glossary by letter" })
      .getByRole("link", { name: "All", exact: true }),
  ).toBeVisible();
});
test("separate meanings, typo fallback, empty results and safe query text", async ({
  page,
}) => {
  await open(page, "/glossary?q=spread");
  const forex = page.locator("article#spread"),
    crypto = page.locator("article#crypto-spread");
  await expect(forex).toBeVisible();
  await expect(crypto).toBeVisible();
  expect(await forex.locator("p").first().textContent()).not.toBe(
    await crypto.locator("p").first().textContent(),
  );
  await open(page, "/glossary?q=bitcion");
  await expect(page.locator("article#crypto-bitcoin")).toBeVisible();
  await expect(
    page.getByText("No direct match. Showing closely matching term names.", {
      exact: true,
    }),
  ).toBeVisible();
  await open(page, "/glossary?course=forex&q=RSI");
  await expect(page.locator("article#relative-strength-index")).toBeVisible();
  await open(page, "/glossary?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E");
  await expect(page.getByRole("searchbox")).toHaveValue(
    "<script>alert(1)</script>",
  );
  await expect(page.getByText(/No terms match this filter/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View more", exact: true }),
  ).toHaveCount(0);
  await open(page, "/glossary?category=missing-category");
  await expect(page.getByText(/No terms match this filter/)).toBeVisible();
  await grouping(page).getByRole("link", { name: "Both", exact: true }).click();
  await expect(cards(page)).toHaveCount(12);
});
test("all current canonical anchors and lesson contexts", async ({ page }) => {
  test.setTimeout(300_000);
  for (const [href, total, course] of [
    ["/glossary?course=forex", counts.forex, "forex"],
    ["/glossary/crypto", counts.crypto, "crypto"],
  ] as const) {
    await open(page, href);
    const anchors = await page
      .locator("[data-glossary-term]")
      .evaluateAll((nodes) => nodes.map((node) => node.id));
    expect(anchors).toHaveLength(total);
    expect(new Set(anchors).size).toBe(total);
    const lessonLinks = await page
      .locator('[data-glossary-term] a[href^="/learn/"]')
      .evaluateAll((nodes) => [
        ...new Set(
          nodes.map((node) =>
            (node as HTMLAnchorElement).getAttribute("href")!,
          ),
        ),
      ]);
    if (course === "forex") await open(page, "/glossary");
    const pageAnchors = await page
      .locator("[data-glossary-term]")
      .evaluateAll((nodes) => nodes.map((node) => node.id));
    for (const id of anchors) {
      const index = pageAnchors.indexOf(id);
      expect(index).toBeGreaterThanOrEqual(0);
      await page.evaluate((id) => {
        window.location.hash = encodeURIComponent(id);
      }, id);
      await expect(page.locator('article[id="' + id + '"]')).toBeVisible();
      await expect
        .poll(() => cards(page).count())
        .toBeGreaterThanOrEqual(index + 1);
    }
    expect(lessonLinks.length).toBeGreaterThan(0);
    for (const target of lessonLinks) {
      expect(target.startsWith("/learn/" + course + "/")).toBe(true);
      expect((await page.request.get(target)).status()).toBe(200);
    }
  }
});
test("accessible controls and narrow-screen overflow", async ({ page }) => {
  for (const href of [
    "/glossary",
    "/glossary?course=forex",
    "/glossary/crypto",
    "/glossary/search",
  ]) {
    await open(page, href);
    await noOverflow(page);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
});
test.describe("native no-JavaScript fallback", () => {
  test.use({ javaScriptEnabled: false });
  test("native grouping, search and View more", async ({ page }) => {
    await open(page, "/glossary");
    await expect(cards(page)).toHaveCount(12);
    await page.getByRole("link", { name: "View more", exact: true }).click();
    await expect(page).toHaveURL(/limit=24/);
    await expect(cards(page)).toHaveCount(24);
    await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
    await grouping(page)
      .getByRole("link", { name: "Forex", exact: true })
      .click();
    await expect(cards(page)).toHaveCount(12);
    await page.getByRole("searchbox").fill("spread");
    await page.getByRole("searchbox").press("Enter");
    await expect(page.locator("article#spread")).toBeVisible();
    await noOverflow(page);
  });
  test("later canonical targets stay reachable without JavaScript", async ({
    page,
  }) => {
    for (const [href, id] of [
      ["/glossary#position-size", "position-size"],
      ["/glossary/crypto#gas", "gas"],
    ]) {
      await open(page, href);
      await expect(page.locator('article[id="' + id + '"]')).toBeVisible();
      await noOverflow(page);
    }
  });
});

{
  test("reviewed definitions examples and cautions match every approved meaning", async ({
    page,
  }) => {
    await open(page, "/glossary?limit=500");
    const rendered = await page
      .locator("[data-glossary-term]")
      .evaluateAll((nodes) =>
        nodes.map((node) => ({
          id: node.id,
          meanings: [...node.querySelectorAll(":scope > div")].map((div) =>
            [...div.querySelectorAll("p")].map((p) => p.textContent),
          ),
        })),
      );
    expect(rendered).toHaveLength(378);
    let meanings = 0;
    for (const entry of reviewed.entries) {
      const id =
        entry.course === "crypto" ? "crypto-" + entry.slug : entry.slug;
      const card = rendered.find((x) => x.id === id);
      expect(card, entry.id).toBeDefined();
      expect(card!.meanings).toEqual(
        entry.meanings.map((m) =>
          [
            m.definition,
            m.example ? "Example: " + m.example : undefined,
            "confusionNote" in m && m.confusionNote
              ? "Keep in mind: " + m.confusionNote
              : undefined,
          ].filter((v) => v !== undefined),
        ),
      );
      meanings += card!.meanings.length;
    }
    expect(meanings).toBe(380);
    await noOverflow(page);
  });
  test("approved aliases categories and mode-specific indexing metadata", async ({
    page,
  }) => {
    await open(page, "/glossary?course=forex&q=RSI");
    await expect(page.locator("article#relative-strength-index")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      reviewMode ? /noindex/ : /^index, follow$/,
    );
    const category = reviewed.entries.find(
      (e) => e.id === "forex:relative-strength-index",
    )!.category;
    await page
      .getByRole("combobox", { name: "Category", exact: true })
      .selectOption(category);
    await page.getByRole("searchbox").fill("");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page).toHaveURL(/category=/);
    await expect(cards(page).first()).toBeVisible();
    await noOverflow(page);
    for (const href of ["/glossary/crypto", "/glossary/search"]) {
      await open(page, href);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        reviewMode ? /noindex/ : /^index, follow$/,
      );
    }
  });
}
