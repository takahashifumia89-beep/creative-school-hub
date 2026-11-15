import { useRafPointer, type PointerSample } from "./raf-pointer";
import { ImageEngine, type ImageFrame } from "../engine/image-client";
import { PrecisionNumber } from "./PrecisionNumber";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { z } from "zod";
import type { imageSchema } from "./schema";
import { L, useLocale } from "./locale";
import { download } from "./client";
import { useMediaHistory } from "./media-history";
import {
  imageGeometry,
  normalizeCrop,
  presetCrop,
  type CropRect,
} from "./media-image";
import {
  useAssets,
  CacheStatus,
  Slider,
  HistoryButtons,
  historyKey,
} from "./media-controls";
export type ImageDoc = z.infer<typeof imageSchema> & {
  assetId?: string;
  cropRect?: CropRect;
  exportWidth?: number;
};
export default function ImageWorkbench({
  value,
  onChange,
  scope,
}: {
  value: ImageDoc;
  onChange: (v: ImageDoc) => void;
  scope: string;
}) {
  const { t } = useLocale(),
    history = useMediaHistory(value, onChange),
    canvas = useRef<HTMLCanvasElement>(null),
    stage = useRef<HTMLDivElement>(null),
    viewport = useRef<HTMLDivElement>(null),
    [viewportSize, setViewportSize] = useState({ width: 800, height: 520 }),
    [source, setSource] = useState<{ width: number; height: number } | null>(
      null,
    ),
    [exporting, setExporting] = useState(false),
    [renderInfo, setRenderInfo] = useState({
      ms: 0,
      renderer: "",
      width: 0,
      height: 0,
    }),
    [error, setError] = useState(""),
    [compare, setCompare] = useState(false),
    [cropping, setCropping] = useState(false),
    [zoom, setZoom] = useState(100),
    [format, setFormat] = useState<"png" | "jpeg" | "webp">("png"),
    [quality, setQuality] = useState(0.92),
    [loading, setLoading] = useState(false);
  const ids = value.assetId ? [value.assetId] : [],
    assets = useAssets(scope, ids),
    activeSource = useRef(""),
    latest = useRef(value);
  latest.current = value;
  const engine = useRef<ImageEngine | null>(null),
    histogram = useRef<HTMLCanvasElement>(null),
    previewGeneration = useRef(0),
    sourceRequest = useRef(0);
  const getEngine = () => (engine.current ??= new ImageEngine());
  useEffect(
    () => () => {
      previewGeneration.current++;
      sourceRequest.current++;
      engine.current?.dispose();
      engine.current = null;
    },
    [],
  );
  function showFrame(frame: ImageFrame) {
    try {
      const c = canvas.current;
      if (c) {
        if (c.width !== frame.width) c.width = frame.width;
        if (c.height !== frame.height) c.height = frame.height;
        c.getContext("2d")!.drawImage(frame.bitmap, 0, 0);
      }
      const h = histogram.current,
        ctx = h?.getContext("2d");
      if (h && ctx) {
        ctx.clearRect(0, 0, h.width, h.height);
        let peak = 1;
        for (let i = 0; i < 768; i++) peak = Math.max(peak, frame.histogram[i]);
        for (let channel = 0; channel < 3; channel++) {
          ctx.beginPath();
          ctx.moveTo(0, h.height);
          for (let i = 0; i < 256; i++)
            ctx.lineTo(
              (i * h.width) / 255,
              h.height -
                Math.sqrt(frame.histogram[channel * 256 + i] / peak) * h.height,
            );
          ctx.lineTo(h.width, h.height);
          ctx.fillStyle = [
            "rgba(225,90,80,.45)",
            "rgba(110,170,75,.4)",
            "rgba(80,140,220,.4)",
          ][channel];
          ctx.fill();
        }
      }
      setRenderInfo({
        ms: frame.ms,
        renderer: frame.renderer,
        width: frame.width,
        height: frame.height,
      });
    } finally {
      frame.bitmap.close();
    }
  }
  const geometry = source
      ? imageGeometry(source.width, source.height, value)
      : null,
    crop =
      value.cropRect ??
      (source
        ? presetCrop(source.width, source.height, value.rotation, value.crop)
        : { x: 0, y: 0, w: 1, h: 1 });
  const frameGeometry = source
    ? imageGeometry(source.width, source.height, value, cropping)
    : null;
  const fitWidth = frameGeometry
    ? Math.max(
        16,
        Math.min(
          viewportSize.width - 48,
          ((viewportSize.height - 48) * frameGeometry.exportWidth) /
            frameGeometry.exportHeight,
        ),
      )
    : 640;
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const measure = () =>
      setViewportSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const gesture = useRef<{
    x: number;
    y: number;
    rect: CropRect;
    mode: string;
  } | null>(null);
  useEffect(() => {
    if (!value.assetId) {
      if (activeSource.current) {
        setSource(null);
        activeSource.current = "";
      }
      return;
    }
    if (activeSource.current === value.assetId) return;
    const blob = assets.sources[value.assetId];
    if (!blob) {
      setSource(null);
      return;
    }
    let active = true;
    const ticket = ++sourceRequest.current;
    setSource(null);
    void getEngine()
      .load(blob)
      .then((size) => {
        if (active && ticket === sourceRequest.current) {
          setSource(size);
          activeSource.current = value.assetId!;
          setError("");
        }
      })
      .catch(() => {
        if (active && ticket === sourceRequest.current)
          setError(
            t(
              L(
                "Не удалось прочитать источник. Выберите файл снова.",
                "Could not read source. Relink the file.",
                "Түпнұсқа оқылмады. Файлды қайта таңдаңыз.",
              ),
            ),
          );
      });
    return () => {
      active = false;
    };
  }, [value.assetId, assets.sources]);
  useEffect(() => {
    if (!source) return;
    const generation = ++previewGeneration.current;
    const frame = requestAnimationFrame(() => {
      void getEngine()
        .preview(
          cropping ? { ...value, exportWidth: undefined } : value,
          compare,
          cropping,
        )
        .then((result) => {
          if (generation !== previewGeneration.current) {
            result.bitmap.close();
            return;
          }
          showFrame(result);
        })
        .catch((e) => {
          if (
            generation === previewGeneration.current &&
            e.message !== "SUPERSEDED"
          )
            setError(
              t(
                L(
                  "Обработка изображения не удалась. Откройте исходник снова.",
                  "Image processing failed. Reopen the source.",
                  "Суретті өңдеу орындалмады. Түпнұсқаны қайта ашыңыз.",
                ),
              ),
            );
        });
    });
    return () => {
      previewGeneration.current++;
      cancelAnimationFrame(frame);
    };
  }, [source, value, compare, cropping]);

  async function load(file?: File) {
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 20 * 1048576
    ) {
      setError(
        t(
          L(
            "Используйте PNG, JPEG или WebP до 20 МБ.",
            "Use PNG, JPEG or WebP up to 20 MB.",
            "20 МБ дейінгі PNG, JPEG не WebP қолданыңыз.",
          ),
        ),
      );
      return;
    }
    const ticket = ++sourceRequest.current,
      previous = source;
    setLoading(true);
    setSource(null);
    setError("");
    try {
      const img = await getEngine().load(file);
      if (ticket !== sourceRequest.current) return;
      const asset = await assets.add(file);
      if (ticket !== sourceRequest.current) return;
      activeSource.current = asset.id;
      setSource(img);
      history.commit({ ...value, assetId: asset.id, filename: file.name });
      setZoom(100);
    } catch (e) {
      if (ticket !== sourceRequest.current) return;
      setSource(previous);
      setError(
        t(
          (e as Error).message === "PIXELS"
            ? L(
                "Максимум 40 мегапикселей.",
                "Maximum 40 megapixels.",
                "Ең көбі 40 мегапиксель.",
              )
            : L(
                "Изображение не читается.",
                "Image cannot be decoded.",
                "Сурет оқылмайды.",
              ),
        ),
      );
    } finally {
      if (ticket === sourceRequest.current) setLoading(false);
    }
  }
  function point(e: Pick<PointerSample, "clientX" | "clientY">) {
    const r = stage.current!.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    };
  }
  function start(e: PointerEvent, mode: string) {
    if (!cropping || !source) return;
    e.preventDefault();
    e.stopPropagation();
    history.begin();
    gesture.current = { ...point(e), rect: structuredClone(crop), mode };
    stage.current?.setPointerCapture(e.pointerId);
  }
  function move(e: PointerSample) {
    const g = gesture.current;
    if (!g) return;
    const p = point(e),
      dx = p.x - g.x,
      dy = p.y - g.y;
    let next: CropRect;
    if (g.mode === "move")
      next = {
        ...g.rect,
        x: Math.max(0, Math.min(1 - g.rect.w, g.rect.x + dx)),
        y: Math.max(0, Math.min(1 - g.rect.h, g.rect.y + dy)),
      };
    else if (g.mode === "draw")
      next = {
        x: Math.min(g.x, p.x),
        y: Math.min(g.y, p.y),
        w: Math.max(0.01, Math.abs(dx)),
        h: Math.max(0.01, Math.abs(dy)),
      };
    else {
      const x = g.mode.includes("w")
          ? Math.min(p.x, g.rect.x + g.rect.w - 0.01)
          : g.rect.x,
        y = g.mode.includes("n")
          ? Math.min(p.y, g.rect.y + g.rect.h - 0.01)
          : g.rect.y,
        right = g.mode.includes("e")
          ? Math.max(p.x, g.rect.x + 0.01)
          : g.rect.x + g.rect.w,
        bottom = g.mode.includes("s")
          ? Math.max(p.y, g.rect.y + 0.01)
          : g.rect.y + g.rect.h;
      next = { x, y, w: right - x, h: bottom - y };
    }
    history.update({
      ...latest.current,
      crop: "original",
      cropRect: normalizeCrop(next),
    });
  }
  const cropPointer = useRafPointer(move);
  function end() {
    cropPointer.flush();
    if (gesture.current) {
      gesture.current = null;
      history.end();
    }
  }
  function reset() {
    history.commit({
      ...value,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      grayscale: false,
      rotation: 0,
      crop: "original",
      cropRect: undefined,
      flipX: false,
      flipY: false,
      sepia: 0,
      blur: 0,
      linearColor: false,
      exposure: 0,
      temperature: 0,
      tint: 0,
      vignette: 0,
      toneMap: "none",
      exportWidth: undefined,
    });
    setCompare(false);
  }
  async function exportImage() {
    if (!source) return;
    setError("");
    setExporting(true);
    try {
      const { blob } = await getEngine().export(value, format, quality);
      const ext =
        blob.type === "image/png"
          ? "png"
          : blob.type === "image/webp"
            ? "webp"
            : "jpg";
      download(
        `${value.filename.replace(/\.[^.]+$/, "") || "image"}-edited.${ext}`,
        blob,
      );
    } catch {
      setError(
        t(
          L(
            "Экспорт не удался. Попробуйте меньший размер.",
            "Export failed. Try a smaller size.",
            "Экспорт орындалмады. Кішірек өлшемді көріңіз.",
          ),
        ),
      );
    } finally {
      setExporting(false);
    }
  }
  return (
    <div
      className="media-workspace"
      data-testid="image-workbench"
      tabIndex={0}
      onKeyDown={(e) => historyKey(e, history)}
      onDragOver={(e) => {
        if (
          Array.from(e.dataTransfer.items).some((item) => item.kind === "file")
        )
          e.preventDefault();
      }}
      onDrop={(e) => {
        if (e.dataTransfer.files.length) {
          e.preventDefault();
          void load(e.dataTransfer.files[0]);
        }
      }}
    >
      <div className="media-toolbar">
        <label className="media-file">
          {t(L("Открыть изображение", "Open image", "Суретті ашу"))}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={loading}
            onChange={(e) => void load(e.target.files?.[0])}
          />
        </label>
        <HistoryButtons history={history} t={t} />
        <span className="media-title">
          {value.filename ||
            t(L("Новый документ", "New document", "Жаңа құжат"))}
        </span>
        <span className="media-spacer" />
        <button
          disabled={!source}
          aria-pressed={cropping}
          onClick={() => {
            end();
            setCropping(!cropping);
          }}
        >
          {t(L("Кадрирование", "Crop", "Қию"))}
        </button>
        <button
          disabled={!source}
          aria-pressed={compare}
          onClick={() => setCompare(!compare)}
        >
          {t(L("До / после", "Before / after", "Бұрын / кейін"))}
        </button>
        <button
          disabled={!source || exporting}
          className="media-primary"
          onClick={() => void exportImage()}
        >
          {exporting
            ? t(L("Экспорт…", "Exporting…", "Экспорт…"))
            : `${format.toUpperCase()} ↓`}
        </button>
      </div>
      <CacheStatus assets={assets} ids={ids} t={t} />
      {error && (
        <div role="alert" className="media-error">
          {error}
        </div>
      )}
      <div className="media-layout">
        <div className="media-monitor">
          <div
            ref={viewport}
            className={`media-monitor-viewport ${cropping ? "is-crop" : ""}`}
          >
            {source ? (
              <div
                className="media-image-stage"
                ref={stage}
                style={{ width: `${(fitWidth * zoom) / 100}px` }}
                onPointerDown={(e) => start(e, "draw")}
                onPointerMove={cropPointer.move}
                onPointerUp={end}
                onPointerCancel={end}
              >
                <canvas
                  ref={canvas}
                  aria-label={t(
                    L(
                      "Предпросмотр изображения",
                      "Image preview",
                      "Суретті алдын ала көру",
                    ),
                  )}
                />
                {cropping && (
                  <div
                    className="media-crop-box"
                    style={{
                      left: `${crop.x * 100}%`,
                      top: `${crop.y * 100}%`,
                      width: `${crop.w * 100}%`,
                      height: `${crop.h * 100}%`,
                    }}
                    onPointerDown={(e) => start(e, "move")}
                  >
                    {(["nw", "ne", "sw", "se"] as const).map((c) => (
                      <span
                        key={c}
                        className="media-crop-handle"
                        style={{
                          left: c.includes("w") ? "0%" : "100%",
                          top: c.includes("n") ? "0%" : "100%",
                          cursor: `${c}-resize`,
                        }}
                        onPointerDown={(e) => start(e, c)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="media-empty">
                <div>
                  <strong>
                    {t(
                      L(
                        "Откройте фотографию",
                        "Open a photograph",
                        "Фотосуретті ашыңыз",
                      ),
                    )}
                  </strong>
                  <p>
                    {value.filename
                      ? t(
                          L(
                            "Выберите исходный файл, если локальная копия недоступна.",
                            "Relink the original if the local copy is unavailable.",
                            "Жергілікті көшірме жоқ болса, түпнұсқаны таңдаңыз.",
                          ),
                        )
                      : "PNG · JPEG · WebP"}
                  </p>
                </div>
                <canvas ref={canvas} className="media-hidden" />
              </div>
            )}
          </div>
          <div className="media-transport">
            <button onClick={() => setZoom(100)}>
              {t(L("Вписать", "Fit", "Сыйдыру"))}
            </button>
            <button
              disabled={zoom <= 25}
              onClick={() => setZoom((n) => Math.max(25, n - 25))}
            >
              −
            </button>
            <output>{zoom}%</output>
            <button
              disabled={zoom >= 300}
              onClick={() => setZoom((n) => Math.min(300, n + 25))}
            >
              +
            </button>
            <span className="media-spacer" />
            {geometry && (
              <span className="media-muted">
                {geometry.exportWidth} × {geometry.exportHeight} px
              </span>
            )}
          </div>
        </div>
        <aside className="media-inspector">
          <h3>{t(L("Композиция", "Composition", "Композиция"))}</h3>
          <label>
            {t(L("Кадрирование по центру", "Center crop", "Ортасынан қию"))}
            <select
              disabled={!source}
              value={value.cropRect ? "custom" : value.crop}
              onChange={(e) => {
                if (e.target.value === "custom") {
                  setCropping(true);
                  return;
                }
                history.commit({
                  ...value,
                  crop: e.target.value as ImageDoc["crop"],
                  cropRect: undefined,
                });
              }}
            >
              <option value="original">
                {t(L("Оригинал", "Original", "Түпнұсқа"))}
              </option>
              <option value="square">1:1</option>
              <option value="wide">16:9</option>
              <option value="portrait">9:16</option>
              <option value="custom">
                {t(L("Вручную", "Custom", "Қолмен"))}
              </option>
            </select>
          </label>
          <div className="media-two">
            {(["x", "y", "w", "h"] as const).map((field, i) => (
              <PrecisionNumber
                key={field}
                label={t(
                  [
                    L("X, %", "X, %", "X, %"),
                    L("Y, %", "Y, %", "Y, %"),
                    L("Ширина, %", "Width, %", "Ені, %"),
                    L("Высота, %", "Height, %", "Биіктігі, %"),
                  ][i],
                )}
                min={field === "w" || field === "h" ? 1 : 0}
                max={100}
                step={0.1}
                disabled={!source}
                value={+(crop[field] * 100).toFixed(1)}
                onBegin={history.begin}
                onEnd={history.end}
                onValue={(n) =>
                  history.update({
                    ...latest.current,
                    crop: "original",
                    cropRect: normalizeCrop({ ...crop, [field]: n / 100 }),
                  })
                }
              />
            ))}
          </div>
          <div className="media-two">
            <button
              disabled={!source}
              onClick={() =>
                history.commit({
                  ...value,
                  rotation: (value.rotation + 90) % 360,
                  cropRect: undefined,
                })
              }
            >
              {t(L("Поворот 90°", "Rotate 90°", "90° бұру"))}
            </button>
            <button
              disabled={!source}
              aria-pressed={!!value.flipX}
              onClick={() => history.commit({ ...value, flipX: !value.flipX })}
            >
              {t(L("Отразить ↔", "Flip ↔", "Шағылыстыру ↔"))}
            </button>
            <button
              disabled={!source}
              aria-pressed={!!value.flipY}
              onClick={() => history.commit({ ...value, flipY: !value.flipY })}
            >
              {t(L("Отразить ↕", "Flip ↕", "Шағылыстыру ↕"))}
            </button>
            <button disabled={!source} onClick={reset}>
              {t(L("Сбросить", "Reset", "Қалпына келтіру"))}
            </button>
          </div>
          <h3>{t(L("Гистограмма", "Histogram", "Гистограмма"))}</h3>
          <canvas
            ref={histogram}
            className="media-histogram"
            width={256}
            height={80}
            aria-label={t(
              L("RGB-гистограмма", "RGB histogram", "RGB гистограммасы"),
            )}
          />
          <h3>{t(L("Коррекция", "Adjustments", "Түзету"))}</h3>
          {(
            ["brightness", "contrast", "saturation", "sepia", "blur"] as const
          ).map((field, i) => (
            <Slider
              key={field}
              label={t(
                [
                  L("Яркость", "Brightness", "Жарықтық"),
                  L("Контраст", "Contrast", "Контраст"),
                  L("Насыщенность", "Saturation", "Қанықтық"),
                  L("Сепия", "Sepia", "Сепия"),
                  L("Размытие", "Blur", "Бұлыңғырлық"),
                ][i],
              )}
              min={0}
              max={field === "blur" ? 10 : field === "sepia" ? 100 : 200}
              step={field === "blur" ? 0.2 : 1}
              value={value[field] ?? 0}
              unit={field === "blur" ? " px" : "%"}
              disabled={!source}
              onBegin={history.begin}
              onEnd={history.end}
              onChange={(n) => history.update({ ...value, [field]: n })}
            />
          ))}
          <label className="media-check">
            <input
              type="checkbox"
              checked={value.grayscale}
              disabled={!source}
              onChange={(e) =>
                history.commit({ ...value, grayscale: e.target.checked })
              }
            />
            {t(L("Чёрно-белый", "Grayscale", "Ақ-қара"))}
          </label>
          <h3>{t(L("Свет и цвет", "Light and color", "Жарық пен түс"))}</h3>
          <label className="media-check">
            <input
              type="checkbox"
              disabled={!source}
              checked={!!value.linearColor}
              onChange={(e) =>
                history.commit({ ...value, linearColor: e.target.checked })
              }
            />
            {t(
              L(
                "Линейная цветокоррекция",
                "Linear color adjustments",
                "Сызықтық түсті түзету",
              ),
            )}
          </label>
          {(["exposure", "temperature", "tint", "vignette"] as const).map(
            (field, i) => (
              <Slider
                key={field}
                label={t(
                  [
                    L("Экспозиция, EV", "Exposure, EV", "Экспозиция, EV"),
                    L("Температура", "Temperature", "Температура"),
                    L("Оттенок", "Tint", "Реңк"),
                    L("Виньетка", "Vignette", "Виньетка"),
                  ][i],
                )}
                value={value[field] ?? 0}
                min={
                  field === "exposure" ? -4 : field === "vignette" ? 0 : -100
                }
                max={field === "exposure" ? 4 : 100}
                step={field === "exposure" ? 0.1 : 1}
                disabled={!source}
                onBegin={history.begin}
                onEnd={history.end}
                onChange={(n) =>
                  history.update({ ...latest.current, [field]: n })
                }
              />
            ),
          )}
          <label>
            {t(L("Тоновое отображение", "Tone mapping", "Тонды бейнелеу"))}
            <select
              aria-label={t(
                L("Тоновое отображение", "Tone mapping", "Тонды бейнелеу"),
              )}
              value={value.toneMap ?? "none"}
              disabled={!source}
              onChange={(e) =>
                history.commit({
                  ...value,
                  toneMap: e.target.value as "none" | "aces",
                })
              }
            >
              <option value="none">
                {t(L("Стандартное", "Standard", "Стандартты"))}
              </option>
              <option value="aces">Filmic · ACES curve</option>
            </select>
          </label>
          <p className="media-muted" data-testid="image-engine-status">
            {renderInfo.renderer}
            {renderInfo.renderer ? ` · ${Math.round(renderInfo.ms)} ms` : ""}
          </p>
          <h3>{t(L("Экспорт", "Export", "Экспорт"))}</h3>
          <label>
            {t(L("Ширина экспорта, px", "Export width, px", "Экспорт ені, px"))}
            <input
              type="number"
              min={16}
              max={4096}
              disabled={!source}
              value={value.exportWidth ?? geometry?.exportWidth ?? 800}
              onChange={(e) =>
                history.commit({
                  ...value,
                  exportWidth: Math.max(
                    16,
                    Math.min(4096, +e.target.value || 16),
                  ),
                })
              }
            />
          </label>
          <label>
            {t(L("Формат", "Format", "Пішім"))}
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as typeof format)}
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </select>
          </label>
          {format !== "png" && (
            <Slider
              label={t(L("Качество", "Quality", "Сапа"))}
              value={quality}
              min={0.3}
              max={1}
              step={0.05}
              onChange={setQuality}
            />
          )}
          <p className="media-muted media-wide">
            {t(
              L(
                "PNG сохраняет прозрачность. Исходник не меняется.",
                "PNG preserves transparency. The original is unchanged.",
                "PNG мөлдірлікті сақтайды. Түпнұсқа өзгермейді.",
              ),
            )}
          </p>
        </aside>
      </div>
      <div className="media-help">
        {t(
          L(
            "Тяните рамку и углы для кадрирования. Точные проценты — справа. Ctrl/⌘ Z — отмена. Локальный кэш не заменяет резервную копию.",
            "Drag crop box or corners. Set exact percentages in the inspector. Ctrl/⌘ Z undoes. Local cache is not a backup.",
            "Қию жақтауы мен бұрыштарын тартыңыз. Нақты пайызды инспекторда орнатыңыз. Ctrl/⌘ Z — болдырмау. Кэш резервтік көшірме емес.",
          ),
        )}
      </div>
    </div>
  );
}
