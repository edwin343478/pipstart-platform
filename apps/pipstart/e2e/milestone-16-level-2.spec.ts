import { expect, test } from "@playwright/test";
const routes = [
  "/learn/crypto/level-2",
  "/learn/crypto/level-2/protect-recovery-material-and-accounts",
  "/learn/crypto/level-2/check-a-crypto-transfer",
  "/learn/crypto/level-2/connections-signatures-and-token-permissions",
  "/learn/crypto/level-2/respond-to-a-crypto-compromise",
];
for (const width of [1440, 390, 320]) {
  test(`Crypto lessons retain stepped reading and fit at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("tab").first()).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await page.getByRole("button", { name: /^Next:/ }).click();
      await expect(page.getByRole("tab").nth(1)).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await page.getByRole("tab").last().click();
      const tick = page.getByRole("tabpanel").getByRole("checkbox").first();
      await tick.check();
      await page.reload();
      await expect(tick).toBeChecked();
      await page
        .getByRole("checkbox", { name: "Show all sections at once" })
        .check();
      await expect(page.getByRole("button", { name: /^Next:/ })).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Back", exact: true }),
      ).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
      ).toBe(true);
    }
    await expect(
      page.getByRole("link", {
        name: "Take the Wallets and Personal Security quiz",
        exact: true,
      }),
    ).toBeVisible();
  });
  test(`Crypto quiz fits and retains the approved footer layout at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/learn/crypto/level-2/quiz");
    await expect(
      page.getByRole("link", { name: "← All Crypto levels" }),
    ).toBeVisible();
    const submit = page.getByRole("button", {
      name: "Submit quiz",
      exact: true,
    });
    await expect(submit).toBeEnabled();
    const boxes = await page.locator("fieldset").evaluateAll((nodes) =>
      nodes.map((n) => {
        const b = n.getBoundingClientRect();
        return { right: b.right, bottom: b.bottom };
      }),
    );
    expect(boxes.length).toBe(15);
    const box = await submit.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThan(Math.max(...boxes.map((x) => x.bottom)));
    const bottomCard = await submit.evaluate((el) => {
      let node = el.parentElement;
      while (node && !node.className.includes("actionCard"))
        node = node.parentElement;
      return node ? getComputedStyle(node).position : "static";
    });
    expect(bottomCard).not.toBe("fixed");
    expect(bottomCard).not.toBe("sticky");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
  });
}
test("Crypto late content is available without JavaScript and unknown routes stay unavailable", async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 900 },
  });
  const page = await context.newPage();
  for (const route of routes) {
    const response = await page.goto(route, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    expect(response?.status()).toBe(200);
    const answers = page.locator("details").filter({
      has: page.getByText("Compare with the worked answers", { exact: true }),
    });
    await expect(answers).toHaveCount(2);
    await expect(answers.first()).not.toHaveAttribute("open", "");
    await answers.first().locator("summary").click();
    await expect(
      answers
        .first()
        .getByRole("heading", { name: "Worked answers", exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("heading", {
          name: "References and further reading",
          exact: true,
        })
        .first(),
    ).toBeVisible();
  }
  await context.close();
  expect(
    (
      await request.get("/learn/crypto/level-2/not-a-published-lesson")
    ).status(),
  ).toBe(404);
});

for (const width of [1440, 390]) {
  test(`lesson-card clicks restart at section one and preserve ticks at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/learn/crypto/level-2");
    await page.getByRole("tab").last().click();
    await page.getByRole("tabpanel").getByRole("checkbox").first().check();
    await page
      .getByRole("checkbox", { name: "Show all sections at once" })
      .check();
    async function choose(title: string) {
      if (width < 1000) {
        const menu = page
          .locator("details")
          .filter({ has: page.locator("nav") })
          .first();
        if (!(await menu.evaluate((e) => (e as HTMLDetailsElement).open)))
          await menu.locator("summary").click();
        await menu.getByRole("link", { name: title, exact: true }).click();
      } else
        await page
          .locator("aside nav")
          .getByRole("link", { name: title, exact: true })
          .click();
      await expect(page.getByRole("tab").first()).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(
        page.getByRole("checkbox", { name: "Show all sections at once" }),
      ).not.toBeChecked();
    }
    await choose("Protect Recovery Material and Secure Accounts");
    await page.getByRole("tab").nth(2).click();
    await choose("What a Wallet Controls and Who Holds the Keys");
    await page.getByRole("tab").last().click();
    await expect(
      page.getByRole("tabpanel").getByRole("checkbox").first(),
    ).toBeChecked();
    await choose("What a Wallet Controls and Who Holds the Keys");
  });
}

test("worked answers stay closed until comparison and remain available in print", async ({
  page,
}) => {
  await page.goto("/learn/crypto/level-2");
  await page.getByRole("tab").last().click();
  const answers = page
    .locator("details")
    .filter({
      has: page.getByText("Compare with the worked answers", { exact: true }),
    })
    .first();
  const heading = answers.getByRole("heading", {
    name: "Worked answers",
    exact: true,
  });
  await expect(heading).not.toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(heading).toBeVisible();
  await page.emulateMedia({ media: "screen" });
  await expect(heading).not.toBeVisible();
  await answers.locator("summary").click();
  await expect(heading).toBeVisible();
});

test("Level 2 grades all fifteen approved answers on the server and reveals explanations after submission", async ({
  page,
}) => {
  await page.goto("/learn/crypto/level-2/quiz");
  await expect(page.locator("fieldset")).toHaveCount(15);
  await expect(page.getByText("Needs review", { exact: true })).toHaveCount(0);
  const answers = [
    "c",
    "d",
    "d",
    "b",
    "b",
    "d",
    "b",
    "d",
    "c",
    "b",
    "c",
    "a",
    "b",
    "c",
    "d",
  ];
  for (const [index, choice] of answers.entries())
    await page
      .locator(
        `input[name="crypto-wallet-security-${index + 1}"][value="${choice}"]`,
      )
      .check();
  await page.getByRole("button", { name: "Submit quiz", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /15 of 15 correct.*100%/ }),
  ).toBeVisible();
  await expect(page.getByText("Passed", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText(
      "The visible balance does not establish Marco's right or ability to spend.",
      { exact: false },
    ),
  ).toBeVisible();
});

test("the curriculum opens Level 2 and both hierarchy pages expose all five lessons and the quiz", async ({
  page,
}) => {
  await page.goto("/learn/crypto");
  const entry = page.getByRole("link", {
    name: "Start Level 2: Wallets and Personal Security",
    exact: true,
  });
  await expect(entry).toBeVisible();
  await expect(entry).toContainText("Available");
  await entry.click();
  await expect(
    page.getByRole("heading", {
      name: "What a Wallet Controls and Who Holds the Keys",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/learn/crypto/level-2/wallets-and-security");
  const moduleLink = page
    .locator(
      'a[href="/learn/crypto/level-2/wallets-and-security/wallet-and-personal-security"]',
    )
    .first();
  await expect(moduleLink).toBeVisible();
  await moduleLink.click();
  await expect(
    page
      .locator('a[href="/learn/crypto/level-2/respond-to-a-crypto-compromise"]')
      .first(),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/learn/crypto/level-2/quiz"]').first(),
  ).toBeVisible();
});
