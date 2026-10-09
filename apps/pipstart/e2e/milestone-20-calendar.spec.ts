import { expect, test, type Page } from "@playwright/test";
import {
  calendarFallbackText,
  calendarScriptUrl,
  fullCalendarUrl,
} from "../src/lib/economic-calendar";

async function mockWidget(page: Page) {
  await page.route(calendarScriptUrl, (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body:
        "const script = document.currentScript; const parent = script.parentElement;" +
        "parent.dataset.testWidgetSettings = script.textContent;" +
        "const frame = document.createElement('iframe');" +
        "frame.src = 'https://www.tradingview-widget.com/embed-widget/events/?fixture=1';" +
        "frame.style.cssText = 'display:block;width:100%;height:calc(100% - 32px);border:0';" +
        "parent.prepend(frame);",
    }),
  );
  await page.route("https://www.tradingview-widget.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html lang='en'><title>Deterministic provider fixture</title><body><p>Calendar test fixture — not live data</p></body></html>",
    }),
  );
}

test("page, attribution, fixed height, metadata and teaching links", async ({
  page,
}) => {
  await mockWidget(page);
  await page.goto("/economic-calendar");
  const host = page.getByTestId("calendar-host");
  await host.scrollIntoViewIfNeeded();
  await expect(host.locator("iframe")).toHaveAttribute(
    "title",
    "Economic calendar by TradingView",
  );
  const state = page.locator("[data-calendar-state]");
  await expect(state).toHaveAttribute("data-calendar-state", "embedded");
  expect((await state.boundingBox())!.height).toBe(
    page.viewportSize()!.width < 768 ? 520 : 640,
  );
  const fullLink = page.getByRole("link", {
    name: "Open full calendar ↗",
    exact: true,
  });
  expect((await fullLink.boundingBox())!.y).toBeLessThan(
    (await host.boundingBox())!.y,
  );
  await expect(fullLink).toHaveAttribute("href", fullCalendarUrl);
  await expect(host.getByText("by TradingView")).toBeVisible();
  const config = JSON.parse(
    (await host
      .locator("[data-test-widget-settings]")
      .getAttribute("data-test-widget-settings")) ?? "{}",
  );
  expect(config.importanceFilter).toBe("0,1");
  expect(config.countryFilter.split(",")).toEqual(
    expect.arrayContaining(["ke", "tz"]),
  );
  await expect(page.locator("#key-events article")).toHaveCount(10);
  await expect(page.locator("#key-events a[href='/glossary']")).toHaveCount(10);
  await expect(
    page.locator(
      "#key-events a[href='/learn/forex/level-7/use-an-economic-calendar-safely']",
    ),
  ).toHaveCount(10);
  await expect(page).toHaveTitle(/Economic Calendar/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://pipstart.net/economic-calendar",
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
});

test("blocked script shows a fallback without breaking static content", async ({
  page,
}) => {
  await page.route(calendarScriptUrl, (route) =>
    route.abort("blockedbyclient"),
  );
  await page.goto("/economic-calendar");
  await page.getByTestId("calendar-host").scrollIntoViewIfNeeded();
  await expect(page.getByRole("status")).toContainText(calendarFallbackText);
  await expect(page.locator("#key-events article")).toHaveCount(10);
  await expect(
    page.getByRole("link", { name: "Open full calendar ↗", exact: true }),
  ).toBeAttached();
  await expect(page.locator("[data-calendar-state]")).toHaveAttribute(
    "data-calendar-state",
    "unavailable",
  );
});

test("silent no-frame script times out after loading begins", async ({
  page,
}) => {
  await page.route(calendarScriptUrl, (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: "/* no frame */",
    }),
  );
  await page.goto("/economic-calendar");
  await page.getByTestId("calendar-host").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-calendar-state]")).toHaveAttribute(
    "data-calendar-state",
    "loading",
  );
  await expect(page.getByRole("status")).toContainText(calendarFallbackText, {
    timeout: 12000,
  });
});

test("loads only after intersection, with no premature timeout", async ({
  page,
}) => {
  await mockWidget(page);
  await page.addInitScript(() => {
    class ManualObserver {
      callback: IntersectionObserverCallback;
      enter = () =>
        this.callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }
      observe() {
        window.addEventListener("m20-enter", this.enter);
      }
      disconnect() {
        window.removeEventListener("m20-enter", this.enter);
      }
      unobserve() {}
    }
    window.IntersectionObserver =
      ManualObserver as unknown as typeof IntersectionObserver;
  });
  await page.goto("/economic-calendar");
  await expect(page.locator("[data-calendar-state]")).toHaveAttribute(
    "data-calendar-state",
    "idle",
  );
  await page.clock.install();
  await page.clock.fastForward(9000);
  await expect(page.getByTestId("calendar-host").locator("script")).toHaveCount(
    0,
  );
  await expect(page.locator("[data-calendar-state]")).toHaveAttribute(
    "data-calendar-state",
    "idle",
  );
  await page.evaluate(() => window.dispatchEvent(new Event("m20-enter")));
  await expect(page.locator("[data-calendar-state]")).toHaveAttribute(
    "data-calendar-state",
    "embedded",
  );
  await expect(page.getByTestId("calendar-host").locator("script")).toHaveCount(
    1,
  );
});

test("no JavaScript still offers the calendar and official sources", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: test.info().project.use.baseURL,
    viewport: test.info().project.use.viewport,
  });
  try {
    const page = await context.newPage();
    await page.goto("/economic-calendar");
    await expect(
      page.getByRole("heading", { name: "Economic Calendar", exact: true }),
    ).toBeVisible();
    const fallback = page.locator("noscript[data-calendar-fallback]");
    await expect(fallback.locator("p").first()).toBeVisible();
    await expect(fallback.locator("p").first()).toContainText(
      calendarFallbackText,
    );
    await expect(fallback.locator("a").first()).toHaveAttribute(
      "href",
      fullCalendarUrl,
    );
    await expect(fallback.locator("a").first()).toBeVisible();
    await expect(page.locator("[data-route-loading]")).toBeHidden();
    await expect(page.locator("[data-calendar-state]")).toBeHidden();
    const cards = page.locator("#key-events article");
    await expect(cards).toHaveCount(10);
    for (const card of await cards.all()) await expect(card).toBeVisible();
    await expect(page.locator("#official-sources h2")).toBeVisible();
    const sources = page.locator("#official-sources li a");
    await expect(sources).toHaveCount(5);
    for (const source of await sources.all())
      await expect(source).toBeVisible();
  } finally {
    await context.close();
  }
});

test("only the calendar route gains third-party CSP allowances", async ({
  request,
}) => {
  for (const route of ["/economic-calendar", "/analysis", "/tools", "/login"]) {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    const csp = response.headers()["content-security-policy"];
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    if (route === "/economic-calendar") {
      expect(csp).toContain("frame-src https://www.tradingview-widget.com");
      expect(csp).toContain(calendarScriptUrl);
    } else {
      expect(csp).toContain("frame-src 'none'");
      expect(csp).not.toContain("tradingview");
    }
  }
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
  expect(await (await request.get("/sitemap.xml")).text()).toContain(
    "https://pipstart.net/economic-calendar",
  );
});

test("privacy disclosures and analysis discovery link", async ({ page }) => {
  await page.goto("/legal/privacy-policy");
  await expect(
    page.getByRole("heading", { name: "Third-party economic calendar" }),
  ).toBeVisible();
  await expect(page.getByText(/TradingView receives your IP/)).toBeVisible();
  await page.goto("/analysis");
  await expect(page.locator("a[href='/economic-calendar']")).toBeVisible();
});

test("calendar entry and exit request fresh documents with the correct CSP", async ({
  page,
}) => {
  await mockWidget(page);
  await page.goto("/analysis");
  const entry = page.waitForResponse(
    (response) =>
      response.request().isNavigationRequest() &&
      response.request().frame() === page.mainFrame() &&
      new URL(response.url()).pathname === "/economic-calendar",
  );
  await page.locator("a[href='/economic-calendar']").click();
  expect((await entry).headers()["content-security-policy"]).toContain(
    calendarScriptUrl,
  );
  await page.getByTestId("calendar-host").scrollIntoViewIfNeeded();
  await expect(
    page.getByTestId("calendar-host").locator("iframe"),
  ).toBeVisible();
  const exit = page.waitForResponse(
    (response) =>
      response.request().isNavigationRequest() &&
      response.request().frame() === page.mainFrame() &&
      new URL(response.url()).pathname === "/analysis",
  );
  await page
    .getByRole("navigation", { name: "Breadcrumb" })
    .getByRole("link", { name: "Analysis" })
    .click();
  const exitPolicy = (await exit).headers()["content-security-policy"];
  expect(exitPolicy).toContain("frame-src 'none'");
  expect(exitPolicy).not.toContain("tradingview");
});

test("iframe presence does not remove permanent blank-frame guidance", async ({
  page,
}) => {
  await mockWidget(page);
  await page.goto("/economic-calendar");
  await page.getByTestId("calendar-host").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-calendar-state]")).toHaveAttribute(
    "data-calendar-state",
    "embedded",
  );
  await expect(
    page.getByText(/A visible calendar frame does not confirm data freshness/),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open full calendar ↗", exact: true }),
  ).toBeAttached();
});
