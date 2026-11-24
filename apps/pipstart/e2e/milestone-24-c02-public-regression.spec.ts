import { expect, test, type Page } from "@playwright/test";

// M24 audit C02: regression coverage for public behaviour changed in M24
// (skip links 5c570bd, reduced motion and password toggle 8a4bd92, diagram
// alternatives 0354fef, calculator filter group 0cad162, protected redirect
// caching 032bd5f). Runs against the production build; no account or data.

async function watchCsp(page: Page) {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (/Content Security Policy/i.test(message.text()))
      violations.push(message.text());
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      console.error(
        `Content Security Policy violation: ${event.violatedDirective} ${event.blockedURI}`,
      );
    });
  });
  return violations;
}

async function lessonUrls(page: Page) {
  const response = await page.request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const urls = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => new URL(match[1]).pathname)
    .filter((path) => /^\/learn\/(forex|crypto)\/[^/]+\/[^/]+$/.test(path));
  expect(urls.length).toBeGreaterThan(0);
  return urls;
}

async function expectSkipLinkMovesFocus(page: Page) {
  // Wait for the resolved page: a streamed lesson first shows its loading state.
  const heading = page.locator("h1#pipstart-skip-heading");
  await expect(heading).toBeVisible();
  await page.keyboard.press("Tab");
  const link = page.locator("a.pipstart-skip-link");
  await expect(link).toBeFocused();
  await expect(link).toHaveText("Skip to content");
  await expect(link).toHaveAttribute("href", "#pipstart-skip-heading");
  const box = await link.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(40);
  await page.keyboard.press("Enter");
  await expect(heading).toHaveCount(1);
  await expect(heading).toBeFocused();
}

test("the home page skip link is the first stop and focuses the main heading", async ({
  page,
}) => {
  const violations = await watchCsp(page);
  await page.goto("/");
  await expectSkipLinkMovesFocus(page);
  expect(violations).toEqual([]);
});

test("a lesson skip link is the first stop and focuses the lesson title", async ({
  page,
}) => {
  const violations = await watchCsp(page);
  const [lesson] = await lessonUrls(page);
  await page.goto(lesson);
  await expectSkipLinkMovesFocus(page);
  expect(violations).toEqual([]);
});

test("reduced motion turns off smooth scrolling", async ({ page }) => {
  const scrollBehavior = () =>
    page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
  await page.goto("/");
  expect(await scrollBehavior()).toBe("smooth");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await scrollBehavior()).toBe("auto");
});

test("the password visibility toggle is at least 24px tall", async ({
  page,
}) => {
  const violations = await watchCsp(page);
  await page.goto("/login");
  const toggle = page.locator("span[class*='passwordControl'] button").first();
  await expect(toggle).toBeVisible();
  const box = await toggle.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
  expect(violations).toEqual([]);
});

test("lesson diagrams never announce the same description twice", async ({
  page,
}) => {
  const urls = await lessonUrls(page);
  let figures = 0;
  for (const url of urls.slice(0, 40)) {
    await page.goto(url);
    const found = await page
      .locator("main figure:has(img)")
      .evaluateAll((nodes) =>
        nodes.map((figure) => ({
          alt: figure.querySelector("img")?.getAttribute("alt") ?? null,
          caption:
            figure.querySelector("figcaption")?.textContent?.trim() ?? "",
          label: figure.getAttribute("aria-label"),
        })),
      );
    for (const figure of found) {
      expect(figure.alt, url).not.toBeNull();
      if (figure.alt === "") {
        // A caption that equals the alternative is shown once, as the caption.
        expect(figure.label, url).toBe("Lesson diagram");
        expect(figure.caption, url).not.toBe("");
      } else {
        expect(figure.alt, url).not.toBe(figure.caption);
      }
    }
    figures += found.length;
    if (figures >= 3) break;
  }
  expect(
    figures,
    "no lesson diagram found in the sampled lessons",
  ).toBeGreaterThan(0);
});

test("the mobile calculator filters are exposed as a named group", async ({
  page,
}) => {
  const violations = await watchCsp(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tools");
  const group = page.getByRole("group", { name: "Calculator categories" });
  await expect(group).toBeVisible();
  expect(await group.getByRole("button").count()).toBeGreaterThan(1);
  expect(violations).toEqual([]);
});

for (const path of ["/dashboard", "/account", "/admin/staff/content"]) {
  test(`anonymous ${path} redirects to login without a shareable cache entry`, async ({
    request,
  }) => {
    const response = await request.get(path, { maxRedirects: 0 });
    expect([302, 303, 307, 308]).toContain(response.status());
    const location = new URL(response.headers().location ?? "", "http://x");
    expect(location.pathname).toBe("/login");
    const cacheControl = response.headers()["cache-control"] ?? "";
    expect(cacheControl).toContain("private");
    expect(cacheControl).toContain("no-store");
    expect(response.headers().vary ?? "").toMatch(/Cookie/i);
  });
}
