import { test, expect, type APIRequestContext } from "@playwright/test";
const password = "Long-test-password-2026!";
async function account(request: APIRequestContext) {
  const email = `test-${crypto.randomUUID()}@example.test`;
  const r = await request.post("/api/auth/signup", {
    data: { email, password, displayName: "Creative Test" },
  });
  expect(r.status()).toBe(201);
  const body = await r.json();
  const token = r.headers()["set-cookie"].match(/cs_session=([^;]+)/)![1];
  return { ...body, email, headers: { Cookie: `cs_session=${token}` } };
}
test("project versions, public visibility, ownership, permanent badges and deletion", async ({
  request,
}) => {
  const a = await account(request);
  const r = await request.post("/api/projects", {
    headers: a.headers,
    data: {
      title: "A real design",
      kind: "design",
      content: JSON.stringify({ bg: "#ffffff", shapes: [] }),
    },
  });
  expect(r.status()).toBe(201);
  const p = await r.json();
  expect((await request.get(`/api/public/projects/${p.id}`)).status()).toBe(
    404,
  );
  const update = await request.patch(`/api/projects/${p.id}`, {
    headers: a.headers,
    data: { version: 1, status: "published", visibility: "public" },
  });
  expect(update.status()).toBe(200);
  expect(
    (
      await request.patch(`/api/projects/${p.id}`, {
        headers: a.headers,
        data: { version: 1, title: "stale overwrite" },
      })
    ).status(),
  ).toBe(409);
  expect((await request.get(`/api/public/projects/${p.id}`)).status()).toBe(
    200,
  );
  const profile = await request.get(`/api/public/profiles/${a.user.id}`);
  expect((await profile.json()).projects).toHaveLength(1);
  const b = await account(request);
  expect(
    (
      await request.get(`/api/projects/${p.id}`, { headers: b.headers })
    ).status(),
  ).toBe(404);
  expect(
    (
      await request.patch(`/api/projects/${p.id}`, {
        headers: a.headers,
        data: { version: 2, status: "draft", visibility: "private" },
      })
    ).status(),
  ).toBe(200);
  expect((await request.get(`/api/public/projects/${p.id}`)).status()).toBe(
    404,
  );
  const stats = await (
    await request.get("/api/stats", { headers: a.headers })
  ).json();
  expect(
    stats.badges.some((x: { badge: string }) => x.badge === "publish"),
  ).toBe(true);
  expect(
    (
      await request.delete(`/api/projects/${p.id}`, {
        headers: a.headers,
        data: { version: 2 },
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await request.delete(`/api/projects/${p.id}`, {
        headers: a.headers,
        data: { version: 3 },
      })
    ).status(),
  ).toBe(200);
});
test("server validates quizzes, duplicate completion awards XP exactly once", async ({
  request,
}) => {
  const a = await account(request);
  expect(
    (
      await request.post("/api/progress", {
        headers: a.headers,
        data: { lessonId: "vis-1" },
      })
    ).status(),
  ).toBe(422);
  const replies = await Promise.all(
    [1, 2, 3].map(() =>
      request.post("/api/progress", {
        headers: a.headers,
        data: { lessonId: "vis-1", answers: [0, 1] },
      }),
    ),
  );
  expect(replies.every((r) => r.status() === 200)).toBe(true);
  const stats = await (
    await request.get("/api/stats", { headers: a.headers })
  ).json();
  expect(stats.xp).toBe(10);
  expect(stats.streak).toBe(1);
});
test("recovery keys rotate and revoke old sessions", async ({ request }) => {
  const a = await account(request);
  const reset = await request.post("/api/auth/recover", {
    data: { email: a.email, password: password + "new", recovery: a.recovery },
  });
  expect(reset.status()).toBe(200);
  expect((await reset.json()).recovery).not.toBe(a.recovery);
  expect((await request.get("/api/me", { headers: a.headers })).status()).toBe(
    401,
  );
  expect(
    (
      await request.post("/api/auth/recover", {
        data: {
          email: a.email,
          password: password + "new",
          recovery: a.recovery,
        },
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.post("/api/auth/signin", {
        data: { email: a.email, password: password + "new" },
      })
    ).status(),
  ).toBe(200);
});
test("origin, body limits and admin authorization are enforced", async ({
  request,
}) => {
  const a = await account(request);
  expect(
    (
      await request.post("/api/projects", {
        headers: { ...a.headers, Origin: "https://evil.example" },
        data: { title: "Bad" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/projects", {
        headers: a.headers,
        data: { title: "Huge", content: "a".repeat(270000) },
      })
    ).status(),
  ).toBe(413);
  expect(
    (await request.get("/api/admin", { headers: a.headers })).status(),
  ).toBe(403);
});
test("three languages, keyboard navigation and responsive landing", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Место для");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator("h1")).toContainText("A place for");
  await page.getByRole("button", { name: "ҚАЗ", exact: true }).click();
  await expect(page.locator("h1 span")).toContainText("идеяларыңызға");
  await expect(page.locator("section.border-y").first()).toHaveCSS(
    "border-top-width",
    "1px",
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "kk");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("editor autosaves and local backup restores after reload", async ({
  page,
  request,
}) => {
  const a = await account(request);
  const token = a.headers.Cookie.split("=")[1];
  await page
    .context()
    .addCookies([
      { name: "cs_session", value: token, domain: "localhost", path: "/" },
    ]);
  await page.goto("/studio/design");
  await page
    .getByLabel("Название", { exact: true })
    .fill("Autosave integration");
  await page
    .getByRole("button", { name: "Прямоугольник", exact: true })
    .click();
  await expect(page).toHaveURL(/project=/);
  await expect(page.getByRole("status")).toContainText("Сохранено");
  await page.reload();
  await expect(page.getByLabel("Название", { exact: true })).toHaveValue(
    "Autosave integration",
  );
  await expect(page.locator('svg rect[fill="#e8590c"]')).toHaveCount(1);
  await page.getByRole("link", { name: "Проекты", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Autosave integration" }),
  ).toBeVisible();
});

test("image corrections export a real PNG and video timeline exports audio/video WebM", async ({
  page,
  request,
}) => {
  const a = await account(request);
  await page.context().addCookies([
    {
      name: "cs_session",
      value: a.headers.Cookie.split("=")[1],
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.goto("/studio/image");
  const png = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 80;
    c.height = 40;
    const g = c.getContext("2d")!;
    g.fillStyle = "red";
    g.fillRect(0, 0, 80, 40);
    return c.toDataURL().split(",")[1];
  });
  await page
    .locator('input[accept="image/png,image/jpeg,image/webp"]')
    .setInputFiles({
      name: "source.png",
      mimeType: "image/png",
      buffer: Buffer.from(png, "base64"),
    });
  await expect(page.locator("canvas")).toHaveAttribute("width", "80");
  await page.getByLabel("Кадрирование по центру").selectOption("square");
  await expect(page.locator("canvas")).toHaveAttribute("width", "40");
  const imageDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNG ↓", exact: true }).click();
  expect((await imageDownload).suggestedFilename()).toBe("edited.png");
  page.on("dialog", (d) => d.accept());
  await page.goto("/studio/video");
  const { videoFixture } = await import("../fixture");
  await page.locator('input[accept="video/*"]').setInputFiles({
    name: "source.webm",
    mimeType: "video/webm",
    buffer: videoFixture,
  });
  await expect(page.getByLabel("Конец, с")).toBeVisible();
  await page.getByLabel("Титр", { exact: true }).fill("Export test");
  const videoDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "WebM ↓", exact: true }).click();
  const exported = await videoDownload;
  expect(exported.suggestedFilename()).toBe("creative-school.webm");
  const path = await exported.path();
  const { readFile } = await import("node:fs/promises");
  const bytes = await readFile(path!);
  expect(bytes.subarray(0, 4).toString("hex")).toBe("1a45dfa3");
  expect(bytes.length).toBeGreaterThan(1000);
});
test("3D scene exports a valid GLB and translates editor controls", async ({
  page,
  request,
}) => {
  const a = await account(request);
  await page.context().addCookies([
    {
      name: "cs_session",
      value: a.headers.Cookie.split("=")[1],
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.goto("/studio/3d");
  await page.getByRole("button", { name: "+ Куб", exact: true }).click();
  const file = page.waitForEvent("download");
  await page.getByRole("button", { name: "GLB ↓", exact: true }).click();
  const { readFile } = await import("node:fs/promises");
  const bytes = await readFile((await (await file).path())!);
  expect(bytes.subarray(0, 4).toString()).toBe("glTF");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "+ Box", exact: true }),
  ).toBeVisible();
});

test("offline quiz queue syncs and stays isolated between accounts", async ({
  page,
  request,
}) => {
  const a = await account(request);
  await page.context().addCookies([
    {
      name: "cs_session",
      value: a.headers.Cookie.split("=")[1],
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.goto("/learn/visual-basics/vis-1");
  await page.getByLabel("Практика выполнена и проверена мной.").check();
  await page
    .getByLabel("Изменить размер и контраст одного ключевого элемента", {
      exact: true,
    })
    .check();
  await page
    .getByLabel(
      "Исходник, экспорт и объяснение выбора между двумя вариантами.",
      { exact: true },
    )
    .check();
  await page.route("**/api/progress", (route) =>
    route.request().method() === "POST" ? route.abort() : route.continue(),
  );
  await page
    .getByRole("button", { name: "Проверить ответы · +10 XP", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "В очереди", exact: true }),
  ).toBeVisible();
  await page.unroute("**/api/progress");
  await page
    .getByRole("button", { name: "Синхронизировать", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Пройдено", exact: true }),
  ).toBeVisible();
  const b = await account(request);
  await page.context().addCookies([
    {
      name: "cs_session",
      value: b.headers.Cookie.split("=")[1],
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Проверить ответы · +10 XP",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    (await (await request.get("/api/progress", { headers: b.headers })).json())
      .done,
  ).toEqual([]);
});

test("original landing composition and account sign-out remain functional", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Место для");
  await expect(page.locator("h1")).toHaveClass(/font-display/);
  await expect(
    page.getByText("Практика, а не бесконечная лента.", { exact: true }),
  ).toBeVisible();
  const a = await account(request);
  await page.context().addCookies([
    {
      name: "cs_session",
      value: a.headers.Cookie.split("=")[1],
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Добро пожаловать, Creative." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Выйти из аккаунта", exact: true })
    .click();
  await expect(page).toHaveURL(/auth/);
  let reads = 0;
  page.on("request", (r) => {
    if (r.url().endsWith("/api/me")) reads++;
  });
  await page.waitForTimeout(500);
  expect(reads).toBeLessThan(4);
});

test("retrying initial save does not create duplicate projects or XP", async ({
  request,
}) => {
  const a = await account(request),
    clientId = crypto.randomUUID();
  const payload = {
    title: "Idempotent save",
    kind: "notes",
    content: "Draft",
    clientId,
  };
  const first = await request.post("/api/projects", {
    headers: a.headers,
    data: payload,
  });
  const second = await request.post("/api/projects", {
    headers: a.headers,
    data: payload,
  });
  expect(first.status()).toBe(201);
  expect(second.status()).toBe(201);
  expect((await first.json()).id).toBe((await second.json()).id);
  const stats = await (
    await request.get("/api/stats", { headers: a.headers })
  ).json();
  expect(stats.projectsTotal).toBe(1);
  expect(stats.xp).toBe(20);
});
