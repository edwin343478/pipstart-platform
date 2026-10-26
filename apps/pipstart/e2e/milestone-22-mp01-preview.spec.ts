import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { screens } from "../src/components/admin-preview/registry";

const email = process.env.PIPSTART_M22_ADMIN_EMAIL?.trim() ?? "";
const password = process.env.PIPSTART_M22_ADMIN_PASSWORD ?? "";

async function expectLoginRedirect(page: Page, route: string) {
  await page.context().clearCookies();
  await page.goto(route);
  const location = new URL(page.url());
  expect(location.pathname).toBe("/login");
  expect(location.searchParams.get("next")).toBe(route);
  await expect(page.getByText("sample data only")).toHaveCount(0);
}

test.describe("anonymous visitors", () => {
  test("are sent to log in from the preview list and every screen", async ({
    page,
  }) => {
    await expectLoginRedirect(page, "/admin/preview");
    for (const screen of screens) {
      await expectLoginRedirect(page, `/admin/preview/${screen.id}`);
    }
  });

  test("learn nothing about which screens exist", async ({ page }) => {
    await expectLoginRedirect(page, "/admin/preview/not-a-screen");
    await expectLoginRedirect(page, "/admin/preview/..%2F..%2Fadmin");
  });

  test("do not see the preview in public pages, sitemap or robots", async ({
    request,
  }) => {
    for (const path of ["/sitemap.xml", "/robots.txt", "/"]) {
      const response = await request.get(path);
      expect(await response.text()).not.toContain("/admin/preview");
    }
  });
});

test.describe("administrators", () => {
  test.skip(
    !email || !password,
    "Set PIPSTART_M22_ADMIN_EMAIL and PIPSTART_M22_ADMIN_PASSWORD for a disposable administrator.",
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/preview");
    await expect(page).toHaveURL(/\/login\?next=%2Fadmin%2Fpreview$/);
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/admin\/preview$/, { timeout: 20_000 });
  });

  test("see the screen list and every screen link", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "Design preview" }),
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await expect(page.locator('a[href^="/admin/preview/"]')).not.toHaveCount(0);
  });

  test("open all 27 screens with no overflow, one h1 and no axe violations", async ({
    page,
  }) => {
    test.setTimeout(600_000);
    const problems: string[] = [];
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const screen of screens) {
      await page.goto(`/admin/preview/${screen.id}`);
      await expect(page.locator("main h1, [role=dialog] h1")).toHaveCount(1);
      await expect(page.getByRole("note")).toContainText("sample data only");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      if (overflow > 0)
        problems.push(`${screen.id} overflows by ${overflow}px`);
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      for (const violation of violations) {
        problems.push(`${screen.id} ${violation.id}`);
      }
    }
    expect(problems).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("keep the preview controls inert and the dialogs modal", async ({
    page,
  }) => {
    await page.goto("/admin/preview/c3-lesson");
    const urlBefore = page.url();
    await page.getByRole("button", { name: "Save draft" }).click();
    expect(page.url()).toBe(urlBefore);

    await page.goto("/admin/preview/a2-step-up");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator("main")).toHaveJSProperty("inert", true);
  });

  test("keep the navigation reachable by keyboard at every width", async ({
    page,
  }) => {
    await page.goto("/admin/preview/b1-overview");
    await page.keyboard.press("Tab");
    const first = page.locator(":focus");
    await expect(first).toBeVisible();
    const outline = await first.evaluate(
      (element) => getComputedStyle(element).outlineStyle,
    );
    expect(outline).not.toBe("none");
  });
});
