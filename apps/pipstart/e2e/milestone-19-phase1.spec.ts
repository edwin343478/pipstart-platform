import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("directory preserves responsive styling and honest per-card disclosure", async ({
  page,
}, info) => {
  await page.goto("/brokers");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Forex Broker Directory",
  );
  const card = page.getByRole("article");
  await expect(card).toHaveCount(1);
  await expect(card.getByRole("heading", { level: 2 })).toHaveText("Deriv.com");
  await expect(card).toContainText("Recommended broker");
  await expect(card).toContainText("Verified listing details:");
  await expect(card).toContainText(
    "Forex CFDs, Synthetic Indices, Binary Options and Crypto Exchange",
  );
  await expect(card).toContainText(
    "MT5, cTrader, TradingView and Deriv Trader",
  );
  await expect(card).toContainText("Availability depends on your country");
  await expect(card).toContainText(
    "opening or funding a live account is optional",
  );
  await expect(card).not.toContainText("verification pending");
  await expect(card).not.toContainText("not reverified");
  await expect(card).not.toContainText("Previous listing date:");
  await expect(
    card
      .locator("dl div")
      .filter({ has: page.locator("dt", { hasText: /^Demo account$/ }) })
      .locator("dd"),
  ).toHaveText("Available");
  await expect(
    card
      .locator("dl div")
      .filter({ has: page.locator("dt", { hasText: /^Availability$/ }) })
      .locator("dd"),
  ).toHaveText("Available");
  await expect(
    page.getByText("Affiliate commissions help cover", { exact: false }),
  ).toBeVisible();
  await expect(
    card.getByRole("note", { name: "Affiliate disclosure" }),
  ).toContainText("The Deriv visit link is an affiliate link");
  const visit = card.getByRole("link", {
    name: "Visit Deriv (affiliate link)",
    exact: true,
  });
  await expect(visit).toHaveAttribute("href", "/go/deriv");
  await expect(visit).toHaveAttribute("rel", "sponsored noopener noreferrer");
  await expect(card.locator("a")).toHaveCount(1);
  expect(
    await card
      .getByText("Risk notice:", { exact: true })
      .evaluate(
        (el) =>
          !!(
            el.compareDocumentPosition(
              document.querySelector('a[href="/go/deriv"]')!,
            ) & Node.DOCUMENT_POSITION_FOLLOWING
          ),
      ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  await page.screenshot({
    path: info.outputPath("brokers-phase1.png"),
    fullPage: true,
  });
});
test("registered redirects ignore URL injection without contacting the broker", async ({
  request,
}) => {
  const response = await request.get(
    "/go/deriv?url=https://evil.test&next=https://evil.test",
    { maxRedirects: 0 },
  );
  expect(response.status()).toBe(302);
  expect(response.headers()["location"]).toBe(
    "https://t.deriv.link?t=QLBEVQ6ZWEHK&custom2=845cb31d-0dee-467c-bc18-9faa34f26a32",
  );
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["x-robots-tag"]).toContain("noindex");
  expect(response.headers()["referrer-policy"]).toBe(
    "strict-origin-when-cross-origin",
  );
  expect(response.headers()["set-cookie"]).toBeUndefined();
});
test("unknown and malicious ids fail closed with a working directory return", async ({
  page,
  request,
}) => {
  const response = await request.get("/go/unknown?url=https://evil.test", {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(404);
  expect(response.headers()["location"]).toBeUndefined();
  expect(await response.text()).toContain("Provider link unavailable");
  await page.goto("/go/unknown");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Provider link unavailable",
  );
  await page
    .getByRole("link", { name: "Return to the broker directory" })
    .click();
  await expect(page).toHaveURL(/\/brokers$/);
});
test("keyboard visit action follows only a mocked external destination", async ({
  page,
  context,
}) => {
  // Intercept the FIRST request: browser routing does not intercept each redirect hop.
  // The real HTTP redirect is tested separately with maxRedirects:0.
  await context.route("**/go/deriv", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html><body><h1>Mock provider destination</h1></body></html>",
    }),
  );
  await page.goto("/brokers");
  const link = page.getByRole("link", {
    name: "Visit Deriv (affiliate link)",
    exact: true,
  });
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    if (await link.evaluate((el) => el === document.activeElement)) break;
  }
  await expect(link).toBeFocused();
  const popupPromise = context.waitForEvent("page");
  await page.keyboard.press("Enter");
  const popup = await popupPromise;
  await expect(popup.getByRole("heading")).toHaveText(
    "Mock provider destination",
  );
  await popup.close();
});
test("directory and visit affordance render without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto(baseURL! + "/brokers");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Forex Broker Directory",
    );
    await expect(
      page.getByRole("link", {
        name: "Visit Deriv (affiliate link)",
        exact: true,
      }),
    ).toHaveAttribute("href", "/go/deriv");
    await expect(page.getByRole("article")).toContainText(
      "Verified listing details:",
    );
  } finally {
    await context.close();
  }
});
test("custom spacing and 200 percent text enlargement retain readable card actions", async ({
  page,
}) => {
  await page.goto("/brokers");
  await page.addStyleTag({
    content:
      "* {line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important;} p {margin-bottom:2em !important;}",
  });
  await page.evaluate(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("main *"),
    );
    const sizes = elements.map((el) =>
      parseFloat(getComputedStyle(el).fontSize),
    );
    elements.forEach((el, index) => {
      el.style.fontSize = sizes[index]! * 2 + "px";
    });
  });
  await expect(
    page.getByRole("link", {
      name: "Visit Deriv (affiliate link)",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
});
test("metadata describes a directory rather than a nonexistent comparison", async ({
  page,
  request,
}) => {
  await page.goto("/brokers");
  await expect(page).toHaveTitle(/Forex Broker Directory/);
  const head = await request.head("/go/deriv", { maxRedirects: 0 });
  expect(head.status()).toBe(302);
  const post = await request.post("/go/deriv", { maxRedirects: 0 });
  expect(post.status()).toBe(405);
});
