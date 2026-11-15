import {
  test,
  expect,
  type Page,
  type APIRequestContext,
} from "@playwright/test";
const password = "Long-test-password-2026!";
async function account(request: APIRequestContext, page?: Page) {
  const response = await request.post("/api/auth/signup", {
    data: {
      email: `workspace-${crypto.randomUUID()}@example.test`,
      password,
      displayName: "Workspace Creator",
    },
    headers: {
      "CF-Connecting-IP": `2001:db8::${Math.floor(Math.random() * 65535).toString(16)}`,
    },
  });
  expect(response.status()).toBe(201);
  const body = await response.json(),
    token = response.headers()["set-cookie"].match(/cs_session=([^;]+)/)![1];
  if (page)
    await page
      .context()
      .addCookies([
        { name: "cs_session", value: token, domain: "localhost", path: "/" },
      ]);
  return { ...body, headers: { Cookie: `cs_session=${token}` } };
}
async function project(
  request: APIRequestContext,
  headers: Record<string, string>,
  title: string,
) {
  const response = await request.post("/api/projects", {
    headers,
    data: { title, kind: "notes", content: "Private editable source" },
  });
  expect(response.status()).toBe(201);
  return response.json();
}

test("workspace index isolates owners, omits documents, and public portfolio pages include only public work", async ({
  request,
}) => {
  const a = await account(request),
    b = await account(request);
  const privateProject = await project(request, a.headers, "Hidden project");
  const unlisted = await project(request, a.headers, "Unlisted project");
  await request.patch(`/api/projects/${unlisted.id}`, {
    headers: a.headers,
    data: { version: 1, status: "published", visibility: "unlisted" },
  });
  for (let i = 0; i < 25; i++) {
    const p = await project(request, a.headers, `Public ${i}`);
    expect(
      (
        await request.patch(`/api/projects/${p.id}`, {
          headers: a.headers,
          data: { version: 1, status: "published", visibility: "public" },
        })
      ).status(),
    ).toBe(200);
  }
  const own = await (
    await request.get("/api/workspace-index", { headers: a.headers })
  ).json();
  expect(own.projects).toHaveLength(27);
  expect(own.userId).toBe(a.user.id);
  expect(JSON.stringify(own)).not.toContain("Private editable source");
  expect(own.projects.every((p: any) => !Object.hasOwn(p, "content"))).toBe(
    true,
  );
  const other = await (
    await request.get(`/api/workspace-index?userId=${a.user.id}`, {
      headers: b.headers,
    })
  ).json();
  expect(other.projects).toEqual([]);
  const guest = await (
    await request.get("/api/workspace-index", { headers: { Cookie: "" } })
  ).json();
  expect(guest).toMatchObject({
    userId: null,
    projects: [],
    profile: null,
    done: [],
    incomingRequests: 0,
  });
  const first = await (
    await request.get(`/api/public/profiles/${a.user.id}`)
  ).json();
  const second = await (
    await request.get(`/api/public/profiles/${a.user.id}?offset=24`)
  ).json();
  expect(first.total).toBe(25);
  expect(first.projects).toHaveLength(24);
  expect(second.projects).toHaveLength(1);
  const ids = [...first.projects, ...second.projects].map((p: any) => p.id);
  expect(new Set(ids).size).toBe(25);
  expect(ids).not.toContain(privateProject.id);
  expect(ids).not.toContain(unlisted.id);
});

test("project actions duplicate real content privately, rename, archive, restore and publish to portfolio", async ({
  page,
  request,
}) => {
  const a = await account(request, page),
    p = await project(request, a.headers, "Original notes");
  await page.goto("/projects");
  const tile = page.locator(`[data-project-id="${p.id}"]`);
  const action = async (name: string) => {
    await tile.locator("summary").click();
    await tile.getByRole("button", { name, exact: true }).click();
  };
  await action("Создать копию");
  await expect(
    page.getByRole("heading", { name: "Original notes — копия", exact: true }),
  ).toBeVisible();
  const copies = await (
    await request.get("/api/projects", { headers: a.headers })
  ).json();
  const copy = copies.find((x: any) => x.id !== p.id);
  expect(copy).toMatchObject({
    content: p.content,
    status: "draft",
    visibility: "private",
  });
  await action("Название и описание");
  const edit = page.getByRole("dialog", {
    name: "Изменить проект",
    exact: true,
  });
  await edit.getByLabel("Название проекта").fill("Renamed notes");
  await edit.getByLabel("Краткое описание").fill("Updated description");
  await edit.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(tile.getByRole("heading")).toHaveText("Renamed notes");
  await action("В архив");
  await expect(tile).toHaveCount(0);
  await page.getByRole("button", { name: "Архив", exact: true }).click();
  await expect(tile).toBeVisible();
  await action("Восстановить");
  await expect(tile).toHaveCount(0);
  await page.getByRole("button", { name: "Все работы", exact: true }).click();
  page.once("dialog", (d) => d.accept());
  await action("Опубликовать проект");
  await expect(tile).toContainText("Опубликован");
  await page.locator('a[href="/portfolio"]').first().click();
  await expect(
    page.getByRole("heading", { name: "Renamed notes", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Original notes — копия", exact: true }),
  ).toHaveCount(0);
});

test("search opens by keyboard, finds owned work, and SPA navigation reuses the account check", async ({
  page,
  request,
}) => {
  const a = await account(request, page),
    p = await project(request, a.headers, "Unique constellation");
  let checks = 0;
  page.on("request", (r) => {
    if (new URL(r.url()).pathname === "/api/me") checks++;
  });
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Unique constellation", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Control+k");
  const search = page.getByRole("combobox", {
    name: "Поиск по сайту",
    exact: true,
  });
  await search.fill("Unique constellation");
  await expect(page.getByRole("option")).toHaveCount(1);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`/studio/notes\\?project=${p.id}`));
  await expect(
    page.getByRole("dialog", { name: "Поиск по сайту", exact: true }),
  ).toHaveCount(0);
  await page.locator('a[href="/projects"]').first().click();
  await expect(
    page.getByRole("heading", { name: "Unique constellation", exact: true }),
  ).toBeVisible();
  expect(checks).toBe(1);
});

test("failed account loading shows retry and preserves the requested page", async ({
  page,
  request,
}) => {
  await account(request, page);
  let fail = true;
  await page.route("**/api/me", (route) =>
    fail ? route.abort("failed") : route.continue(),
  );
  await page.goto("/projects?kind=video");
  await expect(page.getByRole("alert")).toContainText("Нет связи с сервером");
  await expect(page).toHaveURL(/\/projects\?kind=video$/);
  fail = false;
  await page.getByRole("button", { name: "Повторить", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Проекты.", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Тип проекта")).toHaveValue("video");
});

test("mobile navigation traps focus and inline languages and fonts need no external service", async ({
  page,
  request,
}) => {
  await account(request, page);
  await page.setViewportSize({ width: 390, height: 844 });
  const external: string[] = [];
  page.on("request", (r) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url()))
      external.push(r.url());
  });
  await page.goto("/dashboard");
  const open = page.getByRole("button", { name: "Открыть меню", exact: true });
  await open.click();
  const menu = page.getByRole("dialog", { name: "Навигация", exact: true });
  await expect(menu).toBeVisible();
  await expect(page.locator("#workspace-content")).toHaveAttribute("inert", "");
  await page.keyboard.press("Shift+Tab");
  expect(await menu.evaluate((e) => e.contains(document.activeElement))).toBe(
    true,
  );
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(open).toBeFocused();
  await page.getByRole("button", { name: "ҚАЗ", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "kk");
  expect(
    await page
      .locator(".language")
      .evaluate((e) => getComputedStyle(e).position),
  ).toBe("static");
  await page.evaluate(() => document.fonts.ready);
  expect(external).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "work/workspace-mobile.png", fullPage: true });
});

test("compact assistant keeps formatted replies readable and composer visible on mobile", async ({
  page,
  request,
}) => {
  await account(request, page);
  await page.route("**/api/assistant", (route) =>
    route.fulfill({
      json:
        route.request().method() === "GET"
          ? { available: true, dailyLimit: 20 }
          : {
              reply:
                "## План\n1. **Выберите** слой.\n2. Укажите `X` и `Y`.\n\n" +
                "Проверяйте отступы. ".repeat(100),
              truncated: false,
            },
    }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/studio/design");
  await page.getByRole("button", { name: "ИИ-помощник", exact: true }).click();
  const panel = page.getByRole("complementary", {
    name: "ИИ-помощник",
    exact: true,
  });
  await panel
    .getByLabel("Вопрос помощнику", { exact: true })
    .fill("План действий");
  await panel.getByRole("button", { name: "Отправить", exact: true }).click();
  await expect(panel.locator(".sa-reply ol li")).toHaveCount(2);
  await expect(panel.locator(".sa-reply strong")).toHaveText("Выберите");
  const dimensions = await panel.evaluate((e) => {
    const box = e.getBoundingClientRect(),
      log = e.querySelector(".sa-log")!,
      input = e.querySelector("textarea")!.getBoundingClientRect();
    return {
      width: box.width,
      height: box.height,
      font: parseFloat(getComputedStyle(log).fontSize),
      line: parseFloat(getComputedStyle(log).lineHeight),
      inputBottom: input.bottom,
      panelBottom: box.bottom,
      scrollable: log.scrollHeight > log.clientHeight,
    };
  });
  expect(dimensions.width).toBeLessThanOrEqual(390);
  expect(dimensions.height).toBeLessThanOrEqual(410);
  expect(dimensions.font).toBeGreaterThanOrEqual(14);
  expect(dimensions.line).toBeGreaterThanOrEqual(21);
  expect(dimensions.inputBottom).toBeLessThanOrEqual(dimensions.panelBottom);
  expect(dimensions.scrollable).toBe(true);
  await panel.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "work/compact-ai-mobile.png" });
});
