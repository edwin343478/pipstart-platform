import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const representativeRoutes = [
  "/",
  "/start-here",
  "/tools",
  "/learn/forex",
  "/learn/forex/level-1/pips-and-lots",
  "/learn/crypto/level-1",
  "/analysis/central-bank-rate-hold-signal",
  "/legal/privacy-policy",
];

test.describe("Milestone 7 production hardening", () => {
  test("serves the project security headers without framework disclosure", async ({
    page,
  }) => {
    const response = await page.goto("/");
    const headers = response?.headers() ?? {};

    expect(headers["x-powered-by"]).toBeUndefined();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["content-security-policy-report-only"]).toContain(
      "frame-ancestors 'none'",
    );
  });

  test("serves rendered canonical and social-image metadata", async ({
    page,
  }) => {
    await page.goto("/analysis/central-bank-rate-hold-signal");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/analysis\/central-bank-rate-hold-signal$/,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /\/analysis\/central-bank-rate-hold-signal\/opengraph-image/,
    );
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      "content",
      /\/analysis\/central-bank-rate-hold-signal\/opengraph-image/,
    );
  });

  test("keeps the permanent risk-disclosure redirect", async ({ request }) => {
    const response = await request.get("/legal/risk-disclaimer", {
      maxRedirects: 0,
    });

    expect([307, 308]).toContain(response.status());
    expect(response.headers().location).toBe("/legal/risk-disclosure");
  });

  test("supports keyboard menu operation and focus return", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Menu" });

    await menuButton.focus();
    await page.keyboard.press("Enter");
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(menuButton).toBeFocused();
  });

  test("operates View more and Tools filtering from the keyboard", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/learn/forex");
    const viewMore = page.locator('button[aria-controls="forex-levels"]');
    await viewMore.focus();
    await page.keyboard.press("Space");
    await expect(viewMore).toHaveAttribute("aria-expanded", "true");

    await page.goto("/tools");
    await page
      .getByRole("searchbox", { name: "Search calculators" })
      .fill("margin");
    await expect(
      page.getByRole("heading", { name: "Margin Calculator" }),
    ).toBeVisible();
    await expect(page.getByText("1 calculators found")).toBeAttached();
  });

  test("collapses and restores both desktop lesson sidebars", async ({
    page,
  }) => {
    for (const route of [
      "/learn/forex/level-1/pips-and-lots",
      "/learn/crypto/level-1",
    ]) {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(route);
      const lessonSidebar = page
        .locator("aside[aria-label$='lessons']")
        .first();
      const toggle = lessonSidebar.getByRole("button", {
        name: "Collapse lesson sidebar",
      });

      await toggle.click();
      await expect(lessonSidebar.locator("nav")).toBeHidden();
      await lessonSidebar
        .getByRole("button", { name: "Expand lesson sidebar" })
        .click();
      await expect(lessonSidebar.locator("nav")).toBeVisible();
    }
  });

  for (const width of [320, 360]) {
    test(`retains content without horizontal overflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 640 });
      for (const route of representativeRoutes) {
        await page.goto(route);
        const dimensions = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        expect(dimensions.scrollWidth, route).toBeLessThanOrEqual(
          dimensions.clientWidth,
        );
      }
    });
  }

  for (const route of representativeRoutes) {
    test(`has no serious or critical axe violations on ${route}`, async ({
      page,
    }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const severeViolations = results.violations.filter(
        ({ impact }) => impact === "serious" || impact === "critical",
      );

      expect(severeViolations).toEqual([]);
    });
  }
});
