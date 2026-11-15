import { L, type Lang, type Localized } from "./locale";
import type { DesignDoc, Shape } from "@/features/studio/DesignEditor";

export const sparkStyles = [
  { id: "orbit", name: L("Орбита", "Orbit", "Орбита") },
  { id: "rhythm", name: L("Ритм", "Rhythm", "Ырғақ") },
  { id: "bloom", name: L("Расцвет", "Bloom", "Гүлдену") },
] as const;
export const sparkPalettes = [
  {
    id: "acid",
    name: L("Лайм и чернила", "Lime & ink", "Лайм және сия"),
    bg: "#d6ee36",
    ink: "#23251c",
    accent: "#faf7ed",
  },
  {
    id: "cobalt",
    name: L("Ультрамарин", "Ultramarine", "Ультрамарин"),
    bg: "#2636dc",
    ink: "#f9f3e5",
    accent: "#edff87",
  },
  {
    id: "peach",
    name: L("Тёплый коралл", "Warm coral", "Жылы маржан"),
    bg: "#f2a384",
    ink: "#39241e",
    accent: "#faf1db",
  },
  {
    id: "lilac",
    name: L("Сиреневый вечер", "Lilac evening", "Жұпаргүл кеші"),
    bg: "#d5c1f1",
    ink: "#352b53",
    accent: "#fdf4dc",
  },
  {
    id: "paper",
    name: L("Бумага и тушь", "Paper & ink", "Қағаз және тушь"),
    bg: "#eee9de",
    ink: "#25251f",
    accent: "#bdce38",
  },
  {
    id: "night",
    name: L("После полуночи", "After midnight", "Түн ортасынан кейін"),
    bg: "#222820",
    ink: "#eeecd9",
    accent: "#c7ec69",
  },
] as const;
export const sparkFormats = [
  { id: "poster", name: L("Постер", "Poster", "Постер"), w: 720, h: 960 },
  { id: "square", name: L("Квадрат", "Square", "Шаршы"), w: 800, h: 800 },
  { id: "cover", name: L("Обложка", "Cover", "Мұқаба"), w: 1200, h: 675 },
] as const;
export type SparkConfig = {
  style: (typeof sparkStyles)[number]["id"];
  palette: (typeof sparkPalettes)[number]["id"];
  format: (typeof sparkFormats)[number]["id"];
  title: string;
  caption: string;
  density: number;
  seed: number;
  brief: string;
};
const localized = (text: Localized, lang: Lang) =>
  text[lang === "ru" ? 0 : lang === "en" ? 1 : 2];
export const sparkBriefs = [
  {
    id: "sound",
    name: L("Звук вашего города", "The sound of your city", "Қалаңыздың үні"),
    task: L(
      "Придумайте афишу независимого музыкального вечера. Передайте ритм без фотографии музыканта.",
      "Create a poster for an independent music night. Express the rhythm without a musician's photograph.",
      "Тәуелсіз музыка кешіне афиша жасаңыз. Музыканттың фотосуретінсіз ырғақты жеткізіңіз.",
    ),
    title: L("СВОЙ\nРИТМ", "MAKE\nWAVES", "ӨЗ\nЫРҒАҒЫҢ"),
    caption: L(
      "МУЗЫКА / ГОРОД / ТЫ",
      "MUSIC / CITY / YOU",
      "МУЗЫКА / ҚАЛА / СЕН",
    ),
    style: "rhythm",
    palette: "acid",
    format: "poster",
    density: 7,
    lesson: "/learn/visual-basics/vis-1",
    minutes: 20,
    criteria: [
      L(
        "Название читается первым",
        "The title reads first",
        "Атауы бірінші оқылады",
      ),
      L(
        "Есть место, дата и время вашего события",
        "Your event has a place, date and time",
        "Іс-шараның орны, күні мен уақыты бар",
      ),
      L(
        "Ритм повторяется в форме и интервалах",
        "Shapes and spacing share a rhythm",
        "Пішін мен аралықта ортақ ырғақ бар",
      ),
    ],
  },
  {
    id: "identity",
    name: L("Это мой почерк", "This is my signature", "Бұл — менің қолтаңбам"),
    task: L(
      "Создайте обложку собственного портфолио. Выберите два слова, которые описывают ваш подход к работе.",
      "Design a cover for your portfolio. Choose two words that describe your approach to creating.",
      "Өз портфолиоңызға мұқаба жасаңыз. Жұмысқа көзқарасыңызды сипаттайтын екі сөз таңдаңыз.",
    ),
    title: L("ВИЖУ\nИНАЧЕ", "THINK\nSIDEWAYS", "ӨЗГЕШЕ\nКӨРЕМ"),
    caption: L(
      "ИМЯ / ДИЗАЙНЕР / ПОРТФОЛИО",
      "NAME / DESIGNER / PORTFOLIO",
      "АТЫҢЫЗ / ДИЗАЙНЕР / ПОРТФОЛИО",
    ),
    style: "orbit",
    palette: "cobalt",
    format: "cover",
    density: 6,
    lesson: "/learn/portfolio/pf-2",
    minutes: 25,
    criteria: [
      L(
        "Добавлены ваше имя и направление",
        "Your name and discipline are present",
        "Атыңыз бен бағытыңыз көрсетілген",
      ),
      L(
        "Обложка читается в маленьком размере",
        "The cover works at thumbnail size",
        "Мұқаба кішкентай өлшемде оқылады",
      ),
      L(
        "Палитра подходит остальным работам",
        "The palette fits your other work",
        "Палитра басқа жұмыстарыңызға сәйкес келеді",
      ),
    ],
  },
  {
    id: "exhibition",
    name: L(
      "Выставка будущего",
      "An exhibition of tomorrow",
      "Болашақ көрмесі",
    ),
    task: L(
      "Представьте выставку о природе и технологиях. Соберите визуальный образ из простых геометрических форм.",
      "Imagine an exhibition about nature and technology. Build its visual identity from simple geometric forms.",
      "Табиғат пен технологиялар туралы көрмені елестетіңіз. Қарапайым геометриялық пішіндерден визуалды бейне жасаңыз.",
    ),
    title: L("НОВАЯ\nПРИРОДА", "NEW\nNATURE", "ЖАҢА\nТАБИҒАТ"),
    caption: L(
      "ИСКУССТВО / ФОРМА / БУДУЩЕЕ",
      "ART / FORM / FUTURE",
      "ӨНЕР / ПІШІН / БОЛАШАҚ",
    ),
    style: "bloom",
    palette: "lilac",
    format: "square",
    density: 6,
    lesson: "/learn/art-direction/ad-3",
    minutes: 20,
    criteria: [
      L(
        "Форма поддерживает идею выставки",
        "The form supports the exhibition idea",
        "Пішін көрме идеясын қолдайды",
      ),
      L(
        "Текст и фон хорошо контрастируют",
        "Text has strong contrast against its background",
        "Мәтін мен фонның контрастылығы жақсы",
      ),
      L(
        "Между элементами есть воздух",
        "Elements have room to breathe",
        "Элементтердің арасында бос орын бар",
      ),
    ],
  },
] as const;
export function briefConfig(id: string, lang: Lang): SparkConfig {
  const brief = sparkBriefs.find((b) => b.id === id) ?? sparkBriefs[0];
  return {
    style: brief.style,
    palette: brief.palette,
    format: brief.format,
    density: brief.density,
    seed: 0,
    brief: brief.id,
    title: localized(brief.title, lang),
    caption: localized(brief.caption, lang),
  };
}
function clean(value: string, limit: number) {
  return Array.from(value.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ""))
    .slice(0, limit)
    .join("");
}
export function readSpark(search: string, lang: Lang): SparkConfig {
  const p = new URLSearchParams(search.slice(0, 3000));
  const config = briefConfig(p.get("brief") ?? "sound", lang);
  const style = sparkStyles.find((s) => s.id === p.get("style")),
    palette = sparkPalettes.find((s) => s.id === p.get("palette")),
    format = sparkFormats.find((s) => s.id === p.get("format"));
  const number = (key: string, min: number, max: number, fallback: number) =>
    p.has(key) && Number.isFinite(Number(p.get(key)))
      ? Math.max(min, Math.min(max, Math.round(Number(p.get(key)))))
      : fallback;
  return {
    ...config,
    style: style?.id ?? config.style,
    palette: palette?.id ?? config.palette,
    format: format?.id ?? config.format,
    title: clean(p.get("title") ?? config.title, 48),
    caption: clean(p.get("caption") ?? config.caption, 72),
    density: number("density", 3, 10, config.density),
    seed: number("seed", 0, 9999, 0),
  };
}
export function sparkHref(config: SparkConfig) {
  return (
    "/spark?" +
    new URLSearchParams(
      Object.entries(config).map(([k, v]) => [k, String(v)]),
    ).toString()
  );
}

/** Native design layers, shared by the live preview and the editable project. */
export function buildSpark(config: SparkConfig): DesignDoc {
  const { w, h } =
    sparkFormats.find((f) => f.id === config.format) ?? sparkFormats[0];
  const p =
      sparkPalettes.find((p) => p.id === config.palette) ?? sparkPalettes[0],
    shapes: Shape[] = [];
  const landscape = w > h,
    margin = w * 0.065;
  const add = (
    type: Shape["type"],
    x: number,
    y: number,
    sw: number,
    sh: number,
    fill: string,
    extra: Partial<Shape> = {},
  ) =>
    shapes.push({
      id: `spark-${shapes.length}`,
      type,
      x,
      y,
      w: sw,
      h: sh,
      fill,
      ...extra,
    });
  const text = (
    value: string,
    x: number,
    y: number,
    maxWidth: number,
    size: number,
    fill: string,
    name: string,
    bold = false,
  ) => {
    const widthWeight = Array.from(value).reduce(
      (sum, c) =>
        sum + (/[MWЖШЩЮФӨӘ]/i.test(c) ? 1 : /[ .,/!ІI1]/.test(c) ? 0.35 : 0.72),
      0,
    );
    const fitted = Math.min(size, maxWidth / Math.max(1, widthWeight));
    add("text", x, y, maxWidth, fitted * 1.15, fill, {
      text: value,
      size: fitted,
      font: "Inter, sans-serif",
      bold,
      name,
      lineHeight: 1.12,
    });
  };
  const cx = landscape ? w * 0.75 : w * 0.5,
    cy = landscape ? h * 0.5 : h * 0.345;
  const diameter = landscape ? h * 0.77 : Math.min(w * 0.79, h * 0.48);
  const n = Math.round(Math.max(3, Math.min(10, config.density))),
    phase = config.seed % 12;
  if (config.style === "orbit") {
    for (let i = 0; i < n * 2; i++) {
      const d = diameter * (1 - i / (n * 2 + 1));
      const offset = Math.sin(phase * 0.5) * i * diameter * 0.004;
      add(
        "ellipse",
        cx - d / 2 + offset,
        cy - d / 2,
        d,
        d,
        i % 2 ? p.bg : p.ink,
        { name: `Orbit ${i + 1}` },
      );
    }
    const dot = diameter * 0.16;
    add(
      "ellipse",
      cx + diameter * 0.27 - dot / 2,
      cy - diameter * 0.3 - dot / 2,
      dot,
      dot,
      p.accent,
      { name: "Satellite" },
    );
  } else if (config.style === "rhythm") {
    const bw = (diameter / n) * 0.68;
    for (let i = 0; i < n; i++) {
      const bh =
        diameter *
        (0.32 +
          0.67 *
            Math.abs(Math.sin(((i + 0.6) / (n + 1)) * Math.PI + phase * 0.18)));
      add(
        "rect",
        cx - diameter / 2 + (i * diameter) / n,
        cy - bh / 2,
        bw,
        bh,
        i === phase % n ? p.accent : p.ink,
        { r: bw / 2, rot: (phase - 5) * 2, name: `Beat ${i + 1}` },
      );
    }
  } else {
    for (let i = 0; i < n; i++)
      add(
        "ellipse",
        cx - diameter * 0.15,
        cy - diameter / 2,
        diameter * 0.3,
        diameter,
        i % 2 ? p.ink : p.accent,
        { rot: (i * 180) / n + phase * 6, name: `Petal ${i + 1}` },
      );
    add(
      "ellipse",
      cx - diameter * 0.095,
      cy - diameter * 0.095,
      diameter * 0.19,
      diameter * 0.19,
      p.bg,
      { name: "Centre" },
    );
  }
  text(
    "CREATIVE SCHOOL",
    margin,
    h * 0.045,
    w * 0.65,
    Math.min(w, h) * 0.022,
    p.ink,
    "Masthead",
    true,
  );
  text(
    String(config.seed + 1).padStart(3, "0"),
    w - margin - w * 0.12,
    h * 0.045,
    w * 0.12,
    Math.min(w, h) * 0.022,
    p.ink,
    "Edition",
  );
  const normalized = clean(config.title, 48).trim().toLocaleUpperCase();
  const pieces = normalized.includes("\n")
    ? normalized.split("\n").filter(Boolean)
    : (normalized.match(/.{1,18}(?:\s|$)|.{1,18}/gu)?.map((s) => s.trim()) ?? [
        "",
      ]);
  const lines =
    pieces.length > 3
      ? [...pieces.slice(0, 2), pieces.slice(2).join(" ")]
      : pieces;
  const width = landscape ? w * 0.47 : w - margin * 2,
    startY = landscape ? h * 0.31 : h * 0.655;
  const step = landscape
      ? h * 0.14
      : Math.min(h * (lines.length > 2 ? 0.074 : 0.105), w * 0.15),
    base = step * 0.94;
  for (let i = 0; i < lines.length; i++)
    text(
      lines[i],
      margin,
      startY + i * step,
      width,
      base,
      p.ink,
      `Headline ${i + 1}`,
      true,
    );
  add(
    "rect",
    margin,
    h * 0.91,
    w - margin * 2,
    Math.max(1, h * 0.0015),
    p.ink,
    { name: "Rule" },
  );
  text(
    clean(config.caption, 72).replace(/\n/g, " "),
    margin,
    h * 0.934,
    w - margin * 2,
    Math.min(w, h) * 0.02,
    p.ink,
    "Caption",
  );
  return { bg: p.bg, w, h, shapes };
}
