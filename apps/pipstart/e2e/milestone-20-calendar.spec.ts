import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import {
  calendarFallbackText,
  calendarScriptUrl,
  fullCalendarUrl,
} from "../src/lib/economic-calendar";

test("calendar descriptions use international coverage wording", async ({
  page,
}) => {
  await mockWidget(page);
  await page.goto("/economic-calendar");
  const headingNote = page.getByText(
    "Medium and high importance · G20, euro area",
    { exact: true },
  );
  await expect(headingNote).toBeAttached();
  const coverage = page
    .locator("p")
    .filter({ hasText: "Event times are displayed by TradingView" });
  await expect(coverage).toContainText("Coverage varies by country");
  await expect(coverage).not.toContainText("Kenya");
  await expect(coverage).not.toContainText("Tanzania");
  await expect(coverage.locator("a")).toHaveAttribute(
    "href",
    "/legal/privacy-policy",
  );
});

test("mobile calendar and explanations scroll independently in both directions", async ({
  browser,
}) => {
  const viewport = test.info().project.use.viewport!;
  test.skip(viewport.width >= 768, "phone scrolling only");
  const context = await browser.newContext({
    baseURL: test.info().project.use.baseURL,
    viewport,
    hasTouch: true,
    isMobile: true,
  });
  try {
    const page = await context.newPage();
    await mockWidget(page);
    await page.route("https://www.tradingview-widget.com/**", (route) =>
      route.fulfill({
        contentType: "text/html",
        body:
          "<!doctype html><html lang='en'><title>Scroll fixture, not live data</title><style>html,body{margin:0}#fixture-events{height:100vh;overflow-y:auto;overscroll-behavior:contain}p{height:44px;margin:0;border-bottom:1px solid #ddd}</style><body><div id='fixture-events' tabindex='0'>" +
          Array.from(
            { length: 80 },
            (_, index) => "<p>Sample event " + (index + 1) + "</p>",
          ).join("") +
          "</div></body></html>",
      }),
    );
    await page.goto("/economic-calendar");
    const host = page.getByTestId("calendar-host");
    await host.scrollIntoViewIfNeeded();
    await expect(page.locator("[data-calendar-state]")).toHaveAttribute(
      "data-calendar-state",
      "embedded",
    );
    const events = page.frameLocator("iframe").locator("#fixture-events");
    const explanations = page.getByRole("region", {
      name: "Key event explanations",
      exact: true,
    });
    const protocol = await context.newCDPSession(page);
    const swipe = async (
      box: { x: number; y: number; width: number; height: number },
      direction: -1 | 1,
    ) => {
      const x = Math.round(box.x + box.width / 2);
      const y = Math.round(box.y + box.height / 2 - direction * 60);
      await protocol.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
      });
      for (let step = 1; step <= 6; step++) {
        await protocol.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x, y: y + direction * step * 20 }],
        });
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      // Hold the finger still before release so inertia cannot race a later
      // check that the other panel/page stayed at its original position.
      await new Promise((resolve) => setTimeout(resolve, 200));
      await protocol.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
    };
    const pageBeforeCalendar = await page.evaluate(() => scrollY);
    const explanationsBefore = await explanations.evaluate(
      (element) => element.scrollTop,
    );
    await swipe((await page.locator("iframe").boundingBox())!, -1);
    await expect
      .poll(() => events.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(60);
    const later = await events.evaluate((element) => element.scrollTop);
    await swipe((await page.locator("iframe").boundingBox())!, 1);
    await expect
      .poll(() => events.evaluate((element) => element.scrollTop))
      .toBeLessThan(later);
    expect(
      Math.abs((await page.evaluate(() => scrollY)) - pageBeforeCalendar),
    ).toBeLessThanOrEqual(1);
    expect(await explanations.evaluate((element) => element.scrollTop)).toBe(
      explanationsBefore,
    );

    await explanations.scrollIntoViewIfNeeded();
    await explanations.focus();
    const pageBeforeExplanations = await page.evaluate(() => scrollY);
    const calendarBefore = await events.evaluate(
      (element) => element.scrollTop,
    );
    expect(
      await explanations.evaluate(
        (element) => element.scrollHeight > element.clientHeight,
      ),
    ).toBe(true);
    expect(
      await explanations.evaluate((element) => element.clientHeight),
    ).toBeLessThanOrEqual(520);
    await swipe((await explanations.boundingBox())!, -1);
    await expect
      .poll(() => explanations.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(60);
    const explanationLater = await explanations.evaluate(
      (element) => element.scrollTop,
    );
    await swipe((await explanations.boundingBox())!, 1);
    await expect
      .poll(() => explanations.evaluate((element) => element.scrollTop))
      .toBeLessThan(explanationLater);
    expect(
      Math.abs((await page.evaluate(() => scrollY)) - pageBeforeExplanations),
    ).toBeLessThanOrEqual(1);
    expect(await events.evaluate((element) => element.scrollTop)).toBe(
      calendarBefore,
    );
    await explanations.evaluate((element) => {
      element.scrollTop = 0;
    });
    await explanations.press("ArrowDown");
    await expect
      .poll(() => explanations.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
  } finally {
    await context.close();
  }
});

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
      observe(target: Element) {
        window.addEventListener("m20-enter", this.enter);
        // Next.js link prefetching also uses IntersectionObserver; flag only
        // the calendar host so the test waits for the widget's observer.
        if ((target as HTMLElement).dataset?.testid === "calendar-host")
          (window as unknown as { m20Observed?: boolean }).m20Observed = true;
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
  // Hydration registers the observer after first paint; wait so the
  // simulated intersection is not dispatched before anyone listens.
  await page.waitForFunction(
    () => (window as unknown as { m20Observed?: boolean }).m20Observed === true,
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
  // Desktop leaves through the header brand link; phones through the tab bar.
  const mobile = page.viewportSize()!.width < 768;
  const exitPath = mobile ? "/analysis" : "/";
  const exit = page.waitForResponse(
    (response) =>
      response.request().isNavigationRequest() &&
      response.request().frame() === page.mainFrame() &&
      new URL(response.url()).pathname === exitPath,
  );
  if (mobile)
    await page
      .getByRole("navigation", { name: "Mobile primary navigation" })
      .getByRole("link", { name: "Analysis" })
      .click();
  else await page.getByRole("link", { name: "PipStart home" }).click();
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

// ── Approved design (M20 visual integration) ─────────────────────────────

test.describe("approved calendar design", () => {
  test.use({ timezoneId: "Africa/Nairobi" });

  test("intro, chips, full-calendar button and notice cards", async ({
    page,
  }) => {
    await mockWidget(page);
    await page.goto("/economic-calendar");
    await expect(
      page.getByRole("heading", { level: 1, name: "Economic Calendar" }),
    ).toBeVisible();
    await expect(page.locator("[data-calendar-timezone]")).toHaveText(
      "Times shown by TradingView",
    );
    await expect(page.getByText(/Your time zone:/)).toHaveCount(0);
    await expect(page.getByText("Nairobi", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Data may be delayed")).toBeVisible();
    for (const name of [
      "Upcoming events",
      "Key events explained",
      "Delayed-data notice",
      "If the calendar doesn’t load",
      "Reading it safely",
    ])
      await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
    const cards = page.locator("#key-events article");
    await expect(cards.first().locator("text=Why it matters:")).toBeVisible();
    await expect(
      cards.first().getByText("CENTRAL BANK", { exact: true }),
    ).toBeVisible();
    const fullLink = page.getByRole("link", {
      name: "Open full calendar ↗",
      exact: true,
    });
    const linkBox = (await fullLink.boundingBox())!;
    if (page.viewportSize()!.width < 768) {
      // Full-width button on phones, above the widget.
      expect(linkBox.width).toBeGreaterThan(page.viewportSize()!.width - 48);
    } else {
      // Right-aligned on desktop, in line with the chips.
      expect(linkBox.x + linkBox.width).toBeGreaterThan(
        page.viewportSize()!.width - 80,
      );
    }
  });

  test("desktop panels line up and explanations scroll inside", async ({
    page,
  }) => {
    test.skip(page.viewportSize()!.width < 1101, "desktop two-column only");
    await mockWidget(page);
    await page.goto("/economic-calendar");
    const widgetPanel = page
      .locator("section")
      .filter({ has: page.locator("#events-heading") });
    const explainPanel = page.locator("#key-events");
    // Wait for streaming and hydration to settle before measuring.
    await page.getByTestId("calendar-host").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-calendar-state]")).toHaveAttribute(
      "data-calendar-state",
      "embedded",
    );
    await expect(explainPanel).toBeVisible();
    const left = (await widgetPanel.boundingBox())!;
    const right = (await explainPanel.boundingBox())!;
    expect(Math.abs(left.y - right.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(left.height - right.height)).toBeLessThanOrEqual(1);
    expect(right.x).toBeGreaterThan(left.x + left.width);
    const scrolls = await explainPanel.locator("ol").evaluate((list) => {
      const body = list.parentElement!;
      return body.scrollHeight > body.clientHeight;
    });
    expect(scrolls).toBe(true);
  });

  test("phones stack the panels and show the tab bar with Analysis active", async ({
    page,
  }) => {
    test.skip(page.viewportSize()!.width >= 768, "phone layout only");
    await mockWidget(page);
    await page.goto("/economic-calendar");
    const tabBar = page.getByRole("navigation", {
      name: "Mobile primary navigation",
    });
    await expect(tabBar).toBeVisible();
    await expect(
      tabBar.getByRole("link", { name: "Analysis" }),
    ).toHaveAttribute("aria-current", "page");
    const host = page.getByTestId("calendar-host");
    const explain = page.locator("#key-events");
    // Wait for streaming and hydration to settle before measuring.
    await page.getByTestId("calendar-host").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-calendar-state]")).toHaveAttribute(
      "data-calendar-state",
      "embedded",
    );
    await expect(explain).toBeVisible();
    expect((await explain.boundingBox())!.y).toBeGreaterThan(
      (await host.boundingBox())!.y,
    );
    // The page clears the fixed tab bar.
    const footer = page.locator("footer").last();
    await footer.scrollIntoViewIfNeeded();
    const footerBox = (await footer.boundingBox())!;
    const barBox = (await tabBar.boundingBox())!;
    expect(footerBox.y + footerBox.height).toBeLessThanOrEqual(barBox.y + 1);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  });

  test("calendar page has no serious accessibility violations", async ({
    page,
  }) => {
    await mockWidget(page);
    await page.goto("/economic-calendar");
    await page.getByTestId("calendar-host").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-calendar-state]")).toHaveAttribute(
      "data-calendar-state",
      "embedded",
    );
    const results = await new AxeBuilder({ page }).exclude("iframe").analyze();
    const serious = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});

test.describe("menu integration", () => {
  test("Calendar follows Analysis and opens as a fresh document", async ({
    page,
  }) => {
    await mockWidget(page);
    await page.goto("/");
    const mobileMenu = page.viewportSize()!.width <= 900;
    if (mobileMenu) await page.getByRole("button", { name: "Menu" }).click();
    const navigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });
    const labels = (await navigation.getByRole("link").allInnerTexts()).map(
      (label) => label.trim(),
    );
    expect(labels.indexOf("Calendar")).toBe(labels.indexOf("Analysis") + 1);
    expect(labels.slice(0, 9)).toEqual([
      "Start Here",
      "Learn Forex",
      "Learn Crypto",
      "Analysis",
      "Calendar",
      "Glossary",
      "Tools",
      "Brokers",
      "FAQ",
    ]);
    const calendarLink = navigation.getByRole("link", {
      name: "Calendar",
      exact: true,
    });
    await expect(calendarLink).toBeVisible();
    await expect(calendarLink).toHaveAttribute("href", "/economic-calendar");
    const entry = page.waitForResponse(
      (response) =>
        response.request().isNavigationRequest() &&
        response.request().frame() === page.mainFrame() &&
        new URL(response.url()).pathname === "/economic-calendar",
    );
    await calendarLink.click();
    expect((await entry).headers()["content-security-policy"]).toContain(
      calendarScriptUrl,
    );
    await page.getByTestId("calendar-host").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-calendar-state]")).toHaveAttribute(
      "data-calendar-state",
      "embedded",
    );
  });

  test("desktop navigation fits on one row from 901px", async ({ page }) => {
    test.skip(page.viewportSize()!.width < 901, "desktop navigation only");
    for (const width of [901, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const centres = await page
        .getByRole("navigation", { name: "Primary navigation" })
        .getByRole("link")
        .evaluateAll((links) =>
          links.map((link) => {
            const box = link.getBoundingClientRect();
            return Math.round(box.top + box.height / 2);
          }),
        );
      expect(new Set(centres).size, `row count at ${width}px`).toBe(1);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width + 1);
    }
  });
});
