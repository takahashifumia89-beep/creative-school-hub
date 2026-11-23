import {
  test,
  expect,
  type APIRequestContext,
  type Page,
} from "@playwright/test";
import { readFile } from "node:fs/promises";
const password = "Long-test-password-2026!";
async function account(request: APIRequestContext, page?: Page) {
  const response = await request.post("/api/auth/signup", {
    data: {
      email: `spark-${crypto.randomUUID()}@example.test`,
      password,
      displayName: "Original Creator",
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
test("Spark keeps the guest's composition across sign-in and creates an editable project exactly once after a lost reply", async ({
  page,
  request,
}) => {
  const a = await account(request);
  await page.goto("/spark");
  await page.getByLabel("Главные слова", { exact: true }).fill("МОЙ\nСИГНАЛ");
  await page.getByRole("button", { name: "Ультрамарин", exact: true }).click();
  await page.getByRole("button", { name: "Расцвет", exact: true }).click();
  await page.getByLabel("Формат", { exact: true }).selectOption("square");
  await page
    .getByRole("button", { name: "Войти и открыть в студии", exact: true })
    .click();
  await expect(page).toHaveURL(/\/auth\?next=/);
  await page
    .getByLabel("Электронная почта", { exact: true })
    .fill(a.user.email);
  await page.getByLabel("Пароль", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Войти в школу", exact: true })
    .click();
  await expect(page).toHaveURL(/\/spark\?/);
  await expect(page.getByLabel("Главные слова", { exact: true })).toHaveValue(
    "МОЙ\nСИГНАЛ",
  );
  await expect(
    page.getByRole("button", { name: "Ультрамарин", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  let fail = true;
  const ids: string[] = [];
  await page.route("**/api/projects", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    ids.push(route.request().postDataJSON().clientId);
    if (fail) {
      fail = false;
      await route.fetch();
      await route.abort("failed");
    } else await route.continue();
  });
  await page
    .getByRole("button", { name: "Открыть в студии", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Нет связи");
  await page
    .getByRole("button", { name: "Открыть в студии", exact: true })
    .click();
  await expect(page).toHaveURL(/\/studio\/design\?project=/);
  expect(ids).toHaveLength(2);
  expect(ids[0]).toBe(ids[1]);
  const projects = await (
    await request.get("/api/projects", { headers: a.headers })
  ).json();
  expect(projects).toHaveLength(1);
  expect(projects[0]).toMatchObject({
    title: "МОЙ СИГНАЛ",
    visibility: "private",
    status: "draft",
  });
  const document = JSON.parse(projects[0].content);
  expect(document.w).toBe(800);
  expect(document.bg).toBe("#2636dc");
  expect(document.shapes.length).toBeGreaterThan(8);
  await expect(
    page.getByRole("button", { name: "Прямоугольник", exact: true }),
  ).toBeVisible();
  await page.locator('a[href="/projects"]').first().click();
  await expect(page.locator(".cs-project-thumbnail svg")).toHaveCount(1);
  const thumbnail = await request.get(
    `/api/projects/${projects[0].id}/preview`,
    { headers: a.headers },
  );
  expect(thumbnail.status()).toBe(200);
  expect(
    (
      await request.get(`/api/projects/${projects[0].id}/preview`, {
        headers: { Cookie: "" },
      })
    ).status(),
  ).toBe(401);
  const b = await account(request);
  expect(
    (
      await request.get(`/api/projects/${projects[0].id}/preview`, {
        headers: b.headers,
      })
    ).status(),
  ).toBe(404);
});

test("an author's case story is saved with the project and appears on its public page", async ({
  page,
  request,
}) => {
  const a = await account(request, page);
  const response = await request.post("/api/projects", {
    headers: a.headers,
    data: {
      title: "Independent work",
      kind: "notes",
      content: "Original work",
      description: "An existing description",
    },
  });
  const p = await response.json();
  await page.goto("/projects");
  const tile = page.locator(`[data-project-id="${p.id}"]`);
  await tile.locator("summary").click();
  await tile
    .getByRole("button", { name: "История работы", exact: true })
    .click();
  const story = page.getByRole("dialog", {
    name: "История работы",
    exact: true,
  });
  await expect(story.getByLabel("Задача", { exact: true })).toHaveValue(
    "An existing description",
  );
  await story
    .getByLabel("Задача", { exact: true })
    .fill("Создать узнаваемую афишу для своего города.");
  await story
    .getByLabel("Моё решение", { exact: true })
    .fill("Я связал ритм букв с геометрией городской среды.");
  await story
    .getByLabel("Результат и вывод", { exact: true })
    .fill("В следующей версии я попробую другой масштаб.");
  await story
    .getByRole("button", { name: "Сохранить историю", exact: true })
    .click();
  await expect(story).toHaveCount(0);
  await tile.locator("summary").click();
  page.once("dialog", (d) => d.accept());
  await tile
    .getByRole("button", { name: "Опубликовать проект", exact: true })
    .click();
  await expect(tile).toContainText("Опубликован");
  await page.goto(`/p/${p.id}`);
  await expect(page.locator(".cs-public-story")).toContainText(
    "Я связал ритм букв",
  );
  await expect(page.locator(".cs-public-story")).toContainText(
    "В следующей версии",
  );
});

test("lesson practice creates a scene, keeps its brief in the studio, and resumes the same work", async ({
  page,
  request,
}) => {
  const a = await account(request, page);
  await page.goto("/learn/3d-basics/b3d-1");
  await page
    .getByRole("button", { name: "К практике в студии", exact: true })
    .click();
  await expect(page).toHaveURL(/\/studio\/3d\?project=.*lesson=b3d-1/);
  const url = page.url();
  await page.locator(".cs-studio-brief summary").click();
  await expect(page.locator(".cs-studio-brief p")).not.toBeEmpty();
  await page.getByRole("link", { name: /Вернуться к уроку/ }).click();
  await page
    .getByRole("button", { name: "К практике в студии", exact: true })
    .click();
  await expect(page).toHaveURL(url);
  const projects = await (
    await request.get("/api/projects", { headers: a.headers })
  ).json();
  expect(projects).toHaveLength(1);
  expect(JSON.parse(projects[0].content).objects).toHaveLength(3);
});

test("live art, briefs, shared variations and three languages work on desktop and mobile without external image services", async ({
  page,
}) => {
  await page.goto("/");
  const preview = page.getByRole("img", {
    name: "Интерактивный постер",
    exact: true,
  });
  const before = await preview.innerHTML();
  await page.getByRole("button", { name: "Другая форма", exact: true }).click();
  expect(await preview.innerHTML()).not.toBe(before);
  await page.screenshot({
    path: "work/creative-landing-desktop.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Зажечь идею", exact: true }).click();
  await expect(page).toHaveURL(/\/spark/);
  await page
    .getByRole("button", {
      name: "Выбрать бриф: Выставка будущего",
      exact: true,
    })
    .click();
  await expect(page.getByLabel("Главные слова", { exact: true })).toHaveValue(
    "НОВАЯ\nПРИРОДА",
  );
  await page
    .getByRole("button", { name: "Поделиться этой версией", exact: true })
    .click();
  const link = await page.locator(".spark-share-link input").inputValue();
  await page.goto(link);
  await expect(
    page.getByRole("button", { name: "Сиреневый вечер", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({
    path: "work/creative-spark-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Ideas have shape.", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ҚАЗ", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Идеяға пішін бер.", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  const widths = await page
    .locator(".spark-canvas svg text")
    .evaluateAll((els) =>
      els.map((e) => ({
        length: (e as SVGTextElement).getComputedTextLength(),
        x: Number(e.getAttribute("x")),
        width: e.ownerSVGElement!.viewBox.baseVal.width,
      })),
    );
  expect(widths.every((t) => t.x + t.length < t.width)).toBe(true);
  await page.screenshot({
    path: "work/creative-spark-mobile.png",
    fullPage: true,
  });
});

test("guest can keep, compare and swap poster variations and download the current one", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/spark?brief=sound");
  const title = page.getByLabel("Главные слова", { exact: true });
  await title.fill("ПЕРВЫЙ ВАРИАНТ");
  await page.getByRole("button", { name: "Сравнить два варианта" }).click();
  await title.fill("ВТОРОЙ ВАРИАНТ");
  await page.getByLabel("Формат", { exact: true }).selectOption("square");
  await page.reload();
  await expect(title).toHaveValue("ВТОРОЙ ВАРИАНТ");
  await expect(
    page.getByRole("img", { name: "Отложенный постер" }),
  ).toHaveAttribute("viewBox", "0 0 720 960");
  await page.getByRole("button", { name: "Поменять A и B" }).click();
  await expect(title).toHaveValue("ПЕРВЫЙ ВАРИАНТ");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Скачать PNG" }).click();
  const downloaded = await downloadPromise;
  expect(downloaded.suggestedFilename()).toBe("ПЕРВЫЙ-ВАРИАНТ.png");
  const png = await readFile((await downloaded.path())!);
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1440, 1920]);
  await expect(
    page.getByRole("button", { name: "Войти и открыть в студии" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({
    path: "work/spark-comparison-mobile.png",
    fullPage: false,
  });
});

test("portfolio loads metadata and visible covers, then opens a structured case with the full source", async ({
  page,
  request,
}) => {
  const a = await account(request);
  const content = JSON.stringify({
    bg: "#2736db",
    w: 800,
    h: 500,
    shapes: [
      {
        id: "real-rect",
        type: "rect",
        x: 40,
        y: 40,
        w: 80,
        h: 120,
        fill: "#e6fd77",
      },
    ],
  });
  async function publish(title: string, visibility: string) {
    const res = await request.post("/api/projects", {
      headers: a.headers,
      data: {
        title,
        kind: "design",
        content,
        description:
          "Задача:\nПередать ритм города.\n\nМоё решение:\nРабота с контрастом.\n\nРезультат и вывод:",
      },
    });
    expect(res.status()).toBe(201);
    const project = await res.json();
    expect(
      (
        await request.patch(`/api/projects/${project.id}`, {
          headers: a.headers,
          data: { version: 1, status: "published", visibility },
        })
      ).status(),
    ).toBe(200);
    return project.id;
  }
  const pub = await publish("Городской ритм", "public");
  const unlisted = await publish("По личной ссылке", "unlisted");
  const galleryPath = `/api/public/profiles/${a.user.id}`;
  const gallery = await (
    await request.get(`${galleryPath}?view=gallery`, {
      headers: { Cookie: "" },
    })
  ).json();
  expect(gallery.projects).toHaveLength(1);
  expect(gallery.projects[0]).not.toHaveProperty("content");
  expect(
    (
      await request.get(`/api/public/projects/${unlisted}/preview`, {
        headers: { Cookie: "" },
      })
    ).status(),
  ).toBe(404);
  let fail = true;
  await page.route(`**${galleryPath}?*`, (route) => {
    if (fail) {
      fail = false;
      return route.fulfill({ status: 503, json: { error: "SERVER_ERROR" } });
    }
    return route.continue();
  });
  const openedSources: string[] = [];
  page.on("request", (req) => {
    const path = new URL(req.url()).pathname;
    if (/^\/api\/public\/projects\/[^/]+$/.test(path)) openedSources.push(path);
  });
  await page.goto(`/u/${a.user.id}`);
  await page.getByRole("button", { name: "Повторить", exact: true }).click();
  await expect(
    page.getByRole("img", { name: "Городской ритм", exact: true }),
  ).toBeVisible();
  expect(openedSources).toEqual([]);
  await page
    .getByRole("heading", { name: "Городской ритм", exact: true })
    .getByRole("link")
    .click();
  await expect(
    page.getByRole("heading", { name: "Моё решение", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Результат и вывод", exact: true }),
  ).toHaveCount(0);
  expect(openedSources).toEqual([`/api/public/projects/${pub}`]);
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Скачать опубликованный исходник" })
    .click();
  const file = await downloadPromise;
  expect(JSON.parse(await readFile((await file.path())!, "utf8")).content).toBe(
    content,
  );
});

test("studio ignores a late project response after a same-studio navigation", async ({
  page,
  request,
}) => {
  const a = await account(request, page);
  async function note(title: string) {
    const res = await request.post("/api/projects", {
      headers: a.headers,
      data: { title, kind: "notes", content: title },
    });
    expect(res.status()).toBe(201);
    return (await res.json()).id as string;
  }
  const slow = await note("Opened first");
  const fast = await note("Opened last");
  let release!: () => void;
  const responseGate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(`**/api/projects/${slow}`, async (route) => {
    const response = await route.fetch();
    await responseGate;
    await route.fulfill({ response });
  });
  try {
    const firstRequest = page.waitForRequest(`**/api/projects/${slow}`);
    await page.goto(`/studio/notes?project=${slow}`);
    await firstRequest;
    await page.evaluate(
      (id) => history.pushState(null, "", `/studio/notes?project=${id}`),
      fast,
    );
    const field = page.getByLabel("Название", { exact: true });
    await expect(field).toHaveValue("Opened last");
    release();
    await page.locator(".studio-notes").fill("Changed last only");
    await page.getByRole("button", { name: "Сохранить", exact: true }).click();
    await expect(page.locator(".studio-save-status")).toContainText(
      "Сохранено",
    );
    expect(
      (
        await (
          await request.get(`/api/projects/${slow}`, { headers: a.headers })
        ).json()
      ).content,
    ).toBe("Opened first");
    expect(
      (
        await (
          await request.get(`/api/projects/${fast}`, { headers: a.headers })
        ).json()
      ).content,
    ).toBe("Changed last only");
  } finally {
    release();
  }
});
