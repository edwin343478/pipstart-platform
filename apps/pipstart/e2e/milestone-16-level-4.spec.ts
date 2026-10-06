import { expect, test } from "@playwright/test";
const routes = [
  "/learn/crypto/level-4",
  "/learn/crypto/level-4/smart-contracts-applications-and-outside-data",
  "/learn/crypto/level-4/gas-transactions-and-failed-attempts",
  "/learn/crypto/level-4/tokens-standards-nfts-and-asset-identity",
  "/learn/crypto/level-4/layer-one-layer-two-and-bridges",
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
        name: "Take the Ethereum Contracts and Connected Networks quiz",
        exact: true,
      }),
    ).toBeVisible();
  });
  test(`Crypto quiz fits and retains the approved footer layout at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/learn/crypto/level-4/quiz");
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
      await request.get("/learn/crypto/level-4/not-a-published-lesson")
    ).status(),
  ).toBe(404);
});

for (const width of [1440, 390]) {
  test(`lesson-card clicks restart at section one and preserve ticks at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/learn/crypto/level-4");
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
    await choose("Smart Contracts Applications and Outside Data");
    await page.getByRole("tab").nth(2).click();
    await choose("Ethereum Ether and Proof of Stake");
    await page.getByRole("tab").last().click();
    await expect(
      page.getByRole("tabpanel").getByRole("checkbox").first(),
    ).toBeChecked();
    await choose("Ethereum Ether and Proof of Stake");
  });
}

test("worked answers stay closed until comparison and remain available in print", async ({
  page,
}) => {
  await page.goto("/learn/crypto/level-4");
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

test("Level 4 grades all fifteen approved answers on the server and reveals explanations after submission", async ({
  page,
}) => {
  await page.goto("/learn/crypto/level-4/quiz");
  await expect(page.locator("fieldset")).toHaveCount(15);
  await expect(page.getByText("Needs review", { exact: true })).toHaveCount(0);
  const answers = [
    "c",
    "b",
    "d",
    "c",
    "a",
    "d",
    "b",
    "d",
    "a",
    "c",
    "b",
    "a",
    "c",
    "a",
    "c",
  ];
  for (const [index, choice] of answers.entries())
    await page
      .locator(
        `input[name="crypto-ethereum-networks-${index + 1}"][value="${choice}"]`,
      )
      .check();
  await page.getByRole("button", { name: "Submit quiz", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /15 of 15 correct.*100%/ }),
  ).toBeVisible();
  await expect(page.getByText("Passed", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText(
      "50,000 × (30 + 2) = 1,600,000 gwei, and dividing by 1,000,000,000 gives 0.0016 ETH. Option A counts only the base fee and forgets the tip.",
      { exact: false },
    ),
  ).toBeVisible();
});

test("the curriculum opens Level 4 and both hierarchy pages expose all five lessons and the quiz", async ({
  page,
}) => {
  await page.goto("/learn/crypto");
  const entry = page.getByRole("link", {
    name: "Start Level 4: Ethereum Contracts and Connected Networks",
    exact: true,
  });
  await expect(entry).toBeVisible();
  await expect(entry).toContainText("Available");
  await entry.click();
  await expect(
    page.getByRole("heading", {
      name: "Ethereum Ether and Proof of Stake",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/learn/crypto/level-4/crypto-ethereum-and-networks");
  const moduleLink = page
    .locator(
      'a[href="/learn/crypto/level-4/crypto-ethereum-and-networks/ethereum-contracts-and-connected-networks"]',
    )
    .first();
  await expect(moduleLink).toBeVisible();
  await moduleLink.click();
  await expect(
    page
      .locator(
        'a[href="/learn/crypto/level-4/layer-one-layer-two-and-bridges"]',
      )
      .first(),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/learn/crypto/level-4/quiz"]').first(),
  ).toBeVisible();
});

for (const asset of [
  "lessons/crypto/level-4/lesson-2-rId33.png",
  "lessons/crypto/level-4/lesson-3-rId34.png",
  "lessons/crypto/level-4/lesson-5-rId35.png",
]) {
  test(`Crypto diagram resource and image processing respond: ${asset}`, async ({
    request,
  }) => {
    const source = await request.get(`/${asset}`, { timeout: 15_000 });
    expect(source.status(), asset).toBe(200);
    expect(source.headers()["content-type"], asset).toContain("image/png");
    expect((await source.body()).byteLength, asset).toBeGreaterThan(100);
    const imageUrl = `/_next/image?url=${encodeURIComponent(`/${asset}`)}&w=1080&q=75`;
    const processed = await request.get(imageUrl, { timeout: 15_000 });
    expect(processed.status(), imageUrl).toBe(200);
    expect(processed.headers()["content-type"], imageUrl).toContain("image/");
    expect((await processed.body()).byteLength, imageUrl).toBeGreaterThan(100);
  });
}
