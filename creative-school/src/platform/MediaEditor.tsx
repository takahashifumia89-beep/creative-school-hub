import { useEffect, useRef, useState } from "react";
import type { z } from "zod";
import type { imageSchema, videoSchema } from "./schema";
import { L, useLocale } from "./locale";
import { download } from "./client";
type ImageDoc = z.infer<typeof imageSchema>;
type VideoDoc = z.infer<typeof videoSchema>;
export default function MediaEditor({
  kind,
  value,
  onChange,
}: {
  kind: "image" | "video";
  value: ImageDoc | VideoDoc;
  onChange: (v: unknown) => void;
}) {
  return kind === "image" ? (
    <ImageEditor value={value as ImageDoc} onChange={onChange} />
  ) : (
    <VideoEditor value={value as VideoDoc} onChange={onChange} />
  );
}
function ImageEditor({
  value,
  onChange,
}: {
  value: ImageDoc;
  onChange: (v: ImageDoc) => void;
}) {
  const { t } = useLocale(),
    canvas = useRef<HTMLCanvasElement>(null),
    [source, setSource] = useState<HTMLImageElement | null>(null),
    [error, setError] = useState(""),
    [compare, setCompare] = useState(false);
  const past = useRef<ImageDoc[]>([]),
    future = useRef<ImageDoc[]>([]);
  const edit = (d: ImageDoc) => {
    past.current.push(value);
    future.current = [];
    onChange(d);
  };
  useEffect(() => {
    if (!source || !canvas.current) return;
    const c = canvas.current,
      ctx = c.getContext("2d")!;
    const rotated = value.rotation % 180 !== 0,
      w = rotated ? source.height : source.width,
      h = rotated ? source.width : source.height;
    let cw = w,
      ch = h;
    const ratio =
      value.crop === "square"
        ? 1
        : value.crop === "wide"
          ? 16 / 9
          : value.crop === "portrait"
            ? 9 / 16
            : w / h;
    if (w / h > ratio) cw = h * ratio;
    else ch = w / ratio;
    const scale = Math.min(1, 4096 / Math.max(cw, ch));
    c.width = Math.round(cw * scale);
    c.height = Math.round(ch * scale);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.save();
    ctx.translate(c.width / 2, c.height / 2);
    ctx.scale(scale, scale);
    ctx.rotate((value.rotation * Math.PI) / 180);
    ctx.filter = compare
      ? "none"
      : `brightness(${value.brightness}%) contrast(${value.contrast}%) saturate(${value.saturation}%) grayscale(${value.grayscale ? 1 : 0})`;
    ctx.drawImage(source, -source.width / 2, -source.height / 2);
    ctx.restore();
  }, [value, source, compare]);
  async function load(file?: File) {
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 20 * 1024 * 1024
    ) {
      setError(
        t(
          L(
            "PNG, JPEG или WebP, до 20 МБ.",
            "PNG, JPEG or WebP, up to 20 MB.",
            "PNG, JPEG немесе WebP, 20 МБ дейін.",
          ),
        ),
      );
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width * img.height > 40000000) {
        setError(
          t(
            L(
              "Максимум 40 мегапикселей.",
              "Maximum 40 megapixels.",
              "Ең көбі 40 мегапиксель.",
            ),
          ),
        );
        return;
      }
      setSource(img);
      onChange({ ...value, filename: file.name });
      setError("");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError(
        t(L("Файл не читается.", "File cannot be read.", "Файл оқылмайды.")),
      );
    };
    img.src = url;
  }
  return (
    <div className="media-editor">
      <p className="notice">
        {t(
          L(
            "Фотографии остаются на устройстве. В проекте сохраняются настройки; после открытия выберите исходник снова. Экспорт PNG — до 4096 px.",
            "Images stay on your device. Projects save settings; reselect the source when reopening. PNG export up to 4096 px.",
            "Суреттер құрылғыда қалады. Жобада баптаулар сақталады; қайта ашқанда түпнұсқаны таңдаңыз. PNG экспорты 4096 px дейін.",
          ),
        )}
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <label className="file-button">
        {t(L("Открыть изображение", "Open image", "Суретті ашу"))}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => void load(e.target.files?.[0])}
        />
      </label>
      <p>{value.filename}</p>
      <canvas ref={canvas} className="image-canvas" />
      <div className="row">
        <button
          disabled={!past.current.length}
          onClick={() => {
            const d = past.current.pop();
            if (d) {
              future.current.push(value);
              onChange(d);
            }
          }}
        >
          {t(L("Отменить", "Undo", "Болдырмау"))}
        </button>
        <button
          disabled={!future.current.length}
          onClick={() => {
            const d = future.current.pop();
            if (d) {
              past.current.push(value);
              onChange(d);
            }
          }}
        >
          {t(L("Вернуть", "Redo", "Қайтару"))}
        </button>
        <button
          onClick={() =>
            edit({ ...value, rotation: (value.rotation + 90) % 360 })
          }
        >
          {t(L("Повернуть 90°", "Rotate 90°", "90° бұру"))}
        </button>
        <button aria-pressed={compare} onClick={() => setCompare(!compare)}>
          {t(
            L(
              "Сравнить с оригиналом",
              "Compare original",
              "Түпнұсқамен салыстыру",
            ),
          )}
        </button>
        <button
          disabled={!source}
          onClick={() =>
            canvas.current?.toBlob((b) => b && download("edited.png", b))
          }
        >
          PNG ↓
        </button>
      </div>
      <div className="grid3">
        {(["brightness", "contrast", "saturation"] as const).map((key, i) => (
          <label key={key}>
            {t(
              [
                L("Яркость", "Brightness", "Жарықтық"),
                L("Контраст", "Contrast", "Контраст"),
                L("Насыщенность", "Saturation", "Қанықтық"),
              ][i],
            )}
            : {value[key]}%
            <input
              type="range"
              min="0"
              max="200"
              value={value[key]}
              onPointerDown={() => {
                past.current.push(value);
                future.current = [];
              }}
              onChange={(e) => onChange({ ...value, [key]: +e.target.value })}
            />
          </label>
        ))}
        <label>
          {t(L("Кадрирование по центру", "Center crop", "Ортасынан қию"))}
          <select
            value={value.crop}
            onChange={(e) =>
              edit({ ...value, crop: e.target.value as ImageDoc["crop"] })
            }
          >
            {["original", "square", "wide", "portrait"].map((c, i) => (
              <option key={c} value={c}>
                {t(
                  [
                    L("Оригинал", "Original", "Түпнұсқа"),
                    L("Квадрат", "Square", "Шаршы"),
                    L("16:9", "16:9", "16:9"),
                    L("9:16", "9:16", "9:16"),
                  ][i],
                )}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={value.grayscale}
            onChange={(e) => edit({ ...value, grayscale: e.target.checked })}
          />
          {t(L("Чёрно-белый", "Grayscale", "Ақ-қара"))}
        </label>
      </div>
    </div>
  );
}
function VideoEditor({
  value,
  onChange,
}: {
  value: VideoDoc;
  onChange: (v: VideoDoc) => void;
}) {
  const { t } = useLocale(),
    [files, setFiles] = useState<Record<string, string>>({}),
    [selected, setSelected] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0),
    [error, setError] = useState("");
  const video = useRef<HTMLVideoElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    cancel = useRef(false),
    urls = useRef<string[]>([]);
  const cur = value.clips.find((c) => c.id === selected);
  const total = value.clips.reduce((s, c) => s + c.end - c.start, 0);
  useEffect(
    () => () => {
      cancel.current = true;
      urls.current.forEach(URL.revokeObjectURL);
    },
    [],
  );
  async function add(list: FileList | null) {
    if (!list) return;
    setError("");
    const clips = [...value.clips],
      sources = { ...files };
    try {
      for (const file of Array.from(list)) {
        if (
          clips.length >= 30 ||
          file.size > 250 * 1024 * 1024 ||
          !file.type.startsWith("video/")
        )
          throw Error(
            t(
              L(
                "До 30 видео, каждое до 250 МБ.",
                "Up to 30 videos, each up to 250 MB.",
                "30 бейнеге дейін, әрқайсысы 250 МБ дейін.",
              ),
            ),
          );
        const url = URL.createObjectURL(file);
        urls.current.push(url);
        const el = document.createElement("video");
        el.preload = "metadata";
        el.src = url;
        await new Promise<void>((ok, no) => {
          el.onloadedmetadata = () => ok();
          el.onerror = () =>
            no(
              Error(
                t(
                  L(
                    "Формат не поддерживается браузером.",
                    "This browser cannot decode the format.",
                    "Браузер бұл пішімді оқымайды.",
                  ),
                ),
              ),
            );
        });
        if (!Number.isFinite(el.duration) || el.duration > 7200)
          throw Error("Duration limit: 2h");
        const existing = clips.find(
          (c) => c.filename === file.name && !sources[c.id],
        );
        if (existing) {
          sources[existing.id] = url;
        } else {
          const id = crypto.randomUUID();
          clips.push({
            id,
            filename: file.name,
            start: 0,
            end: el.duration,
            duration: el.duration,
            title: "",
            volume: 1,
          });
          sources[id] = url;
        }
        el.removeAttribute("src");
        el.load();
      }
      onChange({ ...value, clips });
      setFiles(sources);
      setSelected(clips[0]?.id ?? null);
    } catch (e) {
      setError(String((e as Error).message));
    }
  }
  const edit = (p: Partial<VideoDoc["clips"][number]>) =>
    onChange({
      ...value,
      clips: value.clips.map((c) => (c.id === selected ? { ...c, ...p } : c)),
    });
  async function render() {
    if (!canvas.current || !value.clips.length) return;
    setError("");
    if (value.clips.some((c) => !files[c.id])) {
      setError(
        t(
          L(
            "Выберите исходники для всех клипов.",
            "Relink every source clip first.",
            "Алдымен барлық бастапқы клипті таңдаңыз.",
          ),
        ),
      );
      return;
    }
    if (total > 600) {
      setError(
        t(
          L(
            "Экспорт ограничен 10 минутами.",
            "Export is limited to 10 minutes.",
            "Экспорт 10 минутпен шектелген.",
          ),
        ),
      );
      return;
    }
    const mime = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ].find(
      (m) =>
        typeof MediaRecorder !== "undefined" &&
        MediaRecorder.isTypeSupported(m),
    );
    if (!mime) {
      setError(
        t(
          L(
            "Экспорт WebM недоступен в этом браузере.",
            "WebM export is not supported in this browser.",
            "Бұл браузерде WebM экспорты қолжетімсіз.",
          ),
        ),
      );
      return;
    }
    setBusy(true);
    setProgress(0);
    cancel.current = false;
    const c = canvas.current;
    c.width = +value.width;
    c.height = Math.round((c.width * 9) / 16);
    const ctx = c.getContext("2d")!,
      stream = c.captureStream(30),
      audio = new AudioContext(),
      destination = audio.createMediaStreamDestination();
    destination.stream
      .getAudioTracks()
      .forEach((track) => stream.addTrack(track));
    const recorder = new MediaRecorder(stream, {
        mimeType: mime,
        videoBitsPerSecond: 5000000,
      }),
      chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    const stopped = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });
    let elapsed = 0;
    let active: HTMLVideoElement | null = null;
    let frame = 0;
    try {
      await audio.resume();
      recorder.start(1000);
      for (const clip of value.clips) {
        if (cancel.current) break;
        const v = document.createElement("video");
        active = v;
        v.src = files[clip.id];
        v.playsInline = true;
        await new Promise<void>((ok, no) => {
          v.onloadedmetadata = () => ok();
          v.onerror = () => no(Error("DECODE"));
        });
        const input = audio.createMediaElementSource(v),
          gain = audio.createGain();
        gain.gain.value = clip.volume;
        input.connect(gain).connect(destination);
        v.currentTime = clip.start;
        await new Promise<void>((ok) => {
          if (Math.abs(v.currentTime - clip.start) < 0.01 && clip.start === 0)
            ok();
          else v.onseeked = () => ok();
        });
        await v.play();
        await new Promise<void>((resolve, reject) => {
          const draw = () => {
            if (cancel.current || v.ended || v.currentTime >= clip.end) {
              v.pause();
              resolve();
              return;
            }
            try {
              ctx.fillStyle = value.bg;
              ctx.fillRect(0, 0, c.width, c.height);
              const scale = Math.min(
                  c.width / v.videoWidth,
                  c.height / v.videoHeight,
                ),
                w = v.videoWidth * scale,
                h = v.videoHeight * scale;
              ctx.drawImage(v, (c.width - w) / 2, (c.height - h) / 2, w, h);
              if (clip.title) {
                ctx.fillStyle = "rgba(0,0,0,.6)";
                ctx.fillRect(0, c.height - 100, c.width, 100);
                ctx.fillStyle = "white";
                ctx.font = `${c.width / 32}px sans-serif`;
                ctx.fillText(clip.title, 35, c.height - 40, c.width - 70);
              }
              setProgress(
                Math.round(
                  ((elapsed + Math.max(0, v.currentTime - clip.start)) /
                    total) *
                    100,
                ),
              );
              frame = requestAnimationFrame(draw);
            } catch (e) {
              reject(e);
            }
          };
          draw();
        });
        elapsed += clip.end - clip.start;
        input.disconnect();
        gain.disconnect();
        v.removeAttribute("src");
        v.load();
      }
      recorder.stop();
      await stopped;
      if (!cancel.current)
        download("creative-school.webm", new Blob(chunks, { type: mime }));
    } catch {
      setError(
        t(
          L(
            "Экспорт не завершён. Проверьте исходники и поддержку формата.",
            "Export failed. Check source files and browser format support.",
            "Экспорт аяқталмады. Файлдар мен браузердің пішім қолдауын тексеріңіз.",
          ),
        ),
      );
      if (recorder.state !== "inactive") recorder.stop();
    } finally {
      cancelAnimationFrame(frame);
      active?.pause();
      stream.getTracks().forEach((track) => track.stop());
      await audio.close();
      setBusy(false);
    }
  }
  return (
    <div className="media-editor">
      <p className="notice">
        {t(
          L(
            "Локальный монтаж: порядок клипов, обрезка, титры, громкость. Исходники не загружаются на сервер; при открытии проекта выберите их снова. Экспорт WebM 16:9 идёт в реальном времени, до 10 минут. Держите вкладку открытой.",
            "Local editing: clip order, trim, titles and volume. Sources stay on your device; relink when reopening. WebM 16:9 export runs in real time, up to 10 minutes. Keep this tab open.",
            "Жергілікті монтаж: клип реті, қию, титр және дыбыс. Түпнұсқалар серверге жіберілмейді; қайта ашқанда таңдаңыз. WebM 16:9 экспорты нақты уақытта, 10 минутқа дейін. Терезені ашық ұстаңыз.",
          ),
        )}
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <label className="file-button">
        {t(
          L(
            "Добавить / привязать видео",
            "Add / relink video",
            "Бейне қосу / байланыстыру",
          ),
        )}
        <input
          type="file"
          accept="video/*"
          multiple
          disabled={busy}
          onChange={(e) => void add(e.target.files)}
        />
      </label>
      <div className="timeline">
        {value.clips.map((clip, i) => (
          <div className="clip" key={clip.id}>
            <button
              aria-pressed={selected === clip.id}
              onClick={() => setSelected(clip.id)}
            >
              {i + 1}. {clip.filename}
              <br />
              {(clip.end - clip.start).toFixed(1)} s{" "}
              {files[clip.id] ? "✓" : "⚠"}
            </button>
            <div className="row">
              <button
                disabled={busy || i === 0}
                aria-label={t(L("Раньше", "Earlier", "Ертерек"))}
                onClick={() => {
                  const a = [...value.clips];
                  [a[i - 1], a[i]] = [a[i], a[i - 1]];
                  onChange({ ...value, clips: a });
                }}
              >
                ←
              </button>
              <button
                disabled={busy || i === value.clips.length - 1}
                aria-label={t(L("Позже", "Later", "Кейінірек"))}
                onClick={() => {
                  const a = [...value.clips];
                  [a[i + 1], a[i]] = [a[i], a[i + 1]];
                  onChange({ ...value, clips: a });
                }}
              >
                →
              </button>
              <button
                disabled={busy}
                aria-label={t(L("Удалить клип", "Remove clip", "Клипті жою"))}
                onClick={() =>
                  onChange({
                    ...value,
                    clips: value.clips.filter((c) => c.id !== clip.id),
                  })
                }
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      {cur && (
        <>
          <video
            key={files[cur.id]}
            ref={video}
            src={files[cur.id]}
            controls
            className="video-preview"
            onTimeUpdate={() => {
              if (video.current && video.current.currentTime > cur.end)
                video.current.pause();
            }}
          />
          <div className="grid3">
            <label>
              {t(L("Начало, с", "In, seconds", "Басы, секунд"))}
              <input
                type="number"
                min="0"
                max={cur.end - 0.05}
                step=".05"
                value={cur.start}
                onChange={(e) =>
                  edit({
                    start: Math.max(
                      0,
                      Math.min(+e.target.value, cur.end - 0.05),
                    ),
                  })
                }
              />
            </label>
            <label>
              {t(L("Конец, с", "Out, seconds", "Соңы, секунд"))}
              <input
                type="number"
                min={cur.start + 0.05}
                max={cur.duration}
                step=".05"
                value={cur.end}
                onChange={(e) =>
                  edit({
                    end: Math.min(
                      cur.duration,
                      Math.max(cur.start + 0.05, +e.target.value),
                    ),
                  })
                }
              />
            </label>
            <label>
              {t(L("Титр", "Title overlay", "Титр"))}
              <input
                maxLength={100}
                value={cur.title}
                onChange={(e) => edit({ title: e.target.value })}
              />
            </label>
            <label>
              {t(L("Громкость", "Volume", "Дыбыс деңгейі"))}
              <input
                type="range"
                min="0"
                max="1"
                step=".05"
                value={cur.volume}
                onChange={(e) => edit({ volume: +e.target.value })}
              />
            </label>
            <button
              onClick={() => {
                if (video.current) {
                  video.current.currentTime = cur.start;
                  video.current.volume = cur.volume;
                  void video.current.play();
                }
              }}
            >
              {t(L("Проверить фрагмент", "Preview trim", "Үзіндіні көру"))}
            </button>
          </div>
        </>
      )}
      <canvas ref={canvas} className={busy ? "video-preview" : "hidden"} />
      <div className="row">
        <label>
          {t(L("Разрешение", "Resolution", "Ажыратымдылық"))}
          <select
            value={value.width}
            disabled={busy}
            onChange={(e) =>
              onChange({ ...value, width: e.target.value as VideoDoc["width"] })
            }
          >
            <option value="1280">1280 × 720</option>
            <option value="720">720 × 405</option>
          </select>
        </label>
        <p>{total.toFixed(1)} s</p>
        <button
          disabled={busy || !value.clips.length}
          onClick={() => void render()}
        >
          WebM ↓
        </button>
        {busy && (
          <>
            <progress max="100" value={progress} />
            <button
              onClick={() => {
                cancel.current = true;
              }}
            >
              {t(L("Отменить экспорт", "Cancel export", "Экспортты тоқтату"))}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
