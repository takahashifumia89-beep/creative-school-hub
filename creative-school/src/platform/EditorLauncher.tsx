import { Link } from "wouter";
import { Box, Camera, Clapperboard, Palette } from "lucide-react";
import { L, useLocale } from "./locale";
import { prefetchRoute } from "./route-loading";
export function EditorLauncher() {
  const { t } = useLocale();
  return (
    <div className="cs-editor-launcher">
      {[
        {
          kind: "design",
          icon: Palette,
          title: L("Дизайн", "Design", "Дизайн"),
          text: L(
            "Постеры, логотипы и макеты",
            "Posters, logos and layouts",
            "Постерлер, логотиптер мен макеттер",
          ),
        },
        {
          kind: "3d",
          icon: Box,
          title: L("3D-моделирование", "3D modeling", "3D модельдеу"),
          text: L(
            "Сцены, материалы и модификаторы",
            "Scenes, materials and modifiers",
            "Сахналар, материалдар мен модификаторлар",
          ),
        },
        {
          kind: "image",
          icon: Camera,
          title: L("Фотография", "Photo", "Фотосурет"),
          text: L(
            "Кадрирование, свет и цвет",
            "Crop, light and color",
            "Қию, жарық пен түс",
          ),
        },
        {
          kind: "video",
          icon: Clapperboard,
          title: L("Видеомонтаж", "Video editing", "Бейнемонтаж"),
          text: L(
            "Монтаж, анимация и субтитры",
            "Editing, animation and captions",
            "Монтаж, анимация мен субтитрлер",
          ),
        },
      ].map(({ kind, icon: Icon, title, text }) => (
        <Link
          key={kind}
          href={`/studio/${kind}`}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") prefetchRoute(`/studio/${kind}`);
          }}
          onFocus={() => prefetchRoute(`/studio/${kind}`)}
        >
          <Icon size={22} />
          <h3>{t(title)}</h3>
          <p>{t(text)}</p>
        </Link>
      ))}
    </div>
  );
}
