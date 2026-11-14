import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { z } from "zod";
import type { videoSchema } from "./schema";
import { L, useLocale } from "./locale";
import { download } from "./client";
import { useMediaHistory } from "./media-history";
import {
  useAssets,
  CacheStatus,
  Slider,
  HistoryButtons,
  historyKey,
} from "./media-controls";
import {
  clipOpacity,
  locateClip,
  mediaReady,
  paintVideoFrame,
  seekMedia,
  timelineDuration,
  type TimelineClip,
} from "./media-timeline";
export type VideoDoc = z.infer<typeof videoSchema> & {
  clips: (TimelineClip & { assetId?: string })[];
  soundtrack?: { filename: string; volume: number; assetId?: string };
};
const formatTime = (s: number) =>
  `${Math.floor(Math.max(0, s) / 60)
    .toString()
    .padStart(2, "0")}:${(Math.max(0, s) % 60).toFixed(2).padStart(5, "0")}`;
export default function VideoWorkbench({
  value,
  onChange,
  scope,
}: {
  value: VideoDoc;
  onChange: (v: VideoDoc) => void;
  scope: string;
}) {
  const { t } = useLocale(),
    history = useMediaHistory(value, onChange),
    [selected, setSelected] = useState<string | null>(
      value.clips[0]?.id ?? null,
    ),
    [playhead, setPlayhead] = useState(0),
    [playing, setPlaying] = useState(false),
    [busy, setBusy] = useState(false),
    [importing, setImporting] = useState(false),
    [progress, setProgress] = useState(0),
    [error, setError] = useState(""),
    [timelineZoom, setTimelineZoom] = useState(45),
    [timelineAreaWidth, setTimelineAreaWidth] = useState(640),
    [muted, setMuted] = useState(false);
  const doc = useRef(value);
  doc.current = value;
  const position = useRef(playhead);
  position.current = playhead;
  const ids = [
      ...new Set([
        ...value.clips.flatMap((c) => (c.assetId ? [c.assetId] : [])),
        ...(value.soundtrack?.assetId ? [value.soundtrack.assetId] : []),
      ]),
    ],
    assets = useAssets(scope, ids),
    preview = useRef<HTMLCanvasElement>(null),
    timelineArea = useRef<HTMLDivElement>(null),
    elements = useRef(
      new Map<string, { url: string; video: HTMLVideoElement }>(),
    ),
    music = useRef<{ url: string; audio: HTMLAudioElement } | null>(null),
    playback = useRef<AbortController | null>(null),
    exportAbort = useRef<AbortController | null>(null),
    mounted = useRef(true);
  const cur = value.clips.find((c) => c.id === selected) ?? null,
    total = timelineDuration(value.clips),
    timelineWidth = Math.max(timelineAreaWidth, total * timelineZoom),
    location = locateClip(value.clips, playhead),
    disabled = busy || importing;
  function stop() {
    playback.current?.abort();
    playback.current = null;
    for (const e of elements.current.values()) e.video.pause();
    music.current?.audio.pause();
    if (mounted.current) setPlaying(false);
  }
  function setHead(s: number) {
    position.current = s;
    setPlayhead(s);
  }
  function seek(s: number) {
    stop();
    setHead(Math.max(0, Math.min(total, s)));
  }
  function getVideo(clip: TimelineClip) {
    const url = clip.assetId ? assets.urls[clip.assetId] : undefined;
    if (!url) return null;
    let e = elements.current.get(clip.id);
    if (e?.url !== url) {
      e?.video.pause();
      e?.video.removeAttribute("src");
      e?.video.load();
      const video = document.createElement("video");
      video.preload = "metadata";
      video.playsInline = true;
      video.src = url;
      e = { url, video };
      elements.current.set(clip.id, e);
    }
    return e.video;
  }
  function getMusic() {
    const url = value.soundtrack?.assetId
      ? assets.urls[value.soundtrack.assetId]
      : undefined;
    if (!url) return null;
    if (music.current?.url !== url) {
      music.current?.audio.pause();
      music.current?.audio.removeAttribute("src");
      const audio = document.createElement("audio");
      audio.preload = "metadata";
      audio.src = url;
      music.current = { url, audio };
    }
    return music.current.audio;
  }
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      playback.current?.abort();
      exportAbort.current?.abort();
      for (const e of elements.current.values()) {
        e.video.pause();
        e.video.removeAttribute("src");
        e.video.load();
      }
      music.current?.audio.pause();
      music.current?.audio.removeAttribute("src");
    };
  }, []);
  useEffect(() => {
    if (selected && !value.clips.some((c) => c.id === selected))
      setSelected(value.clips[0]?.id ?? null);
    if (playhead > total) setHead(total);
  }, [value.clips, total]);
  useEffect(() => {
    if (playing || busy || !preview.current) return;
    const abort = new AbortController(),
      loc = locateClip(value.clips, playhead);
    if (!loc) {
      paintVideoFrame(preview.current, null, null, 0, value.bg);
      return;
    }
    const video = getVideo(loc.clip);
    if (!video) {
      paintVideoFrame(preview.current, null, null, 0, value.bg);
      return;
    }
    void (async () => {
      try {
        await mediaReady(video, abort.signal);
        await seekMedia(
          video,
          Math.max(loc.clip.start, Math.min(loc.local, loc.clip.end - 0.001)),
          abort.signal,
        );
        if (!abort.signal.aborted && preview.current)
          paintVideoFrame(
            preview.current,
            video,
            loc.clip,
            loc.local,
            value.bg,
          );
      } catch {
        if (!abort.signal.aborted)
          setError(
            t(
              L(
                "Кадр не читается. Проверьте исходник.",
                "Frame cannot be decoded. Check the source.",
                "Кадр оқылмайды. Түпнұсқаны тексеріңіз.",
              ),
            ),
          );
      }
    })();
    return () => abort.abort();
  }, [value, playhead, playing, busy, assets.urls]);
  async function play() {
    if (playing) {
      stop();
      return;
    }
    if (!value.clips.length || disabled) return;
    setError("");
    if (value.clips.some((c) => !c.assetId || !assets.urls[c.assetId])) {
      setError(
        t(
          L(
            "Привяжите все исходные клипы.",
            "Relink all source clips.",
            "Барлық бастапқы клипті байланыстырыңыз.",
          ),
        ),
      );
      return;
    }
    stop();
    const controller = new AbortController();
    playback.current = controller;
    const snapshot = structuredClone(value);
    let at = position.current >= total - 0.01 ? 0 : position.current;
    setHead(at);
    setPlaying(true);
    try {
      // Prepare decoder positions before starting the soundtrack, so buffering
      // cannot put music ahead of the composed picture.
      for (const clip of snapshot.clips) {
        const ready = getVideo(clip)!;
        await mediaReady(ready, controller.signal);
        await seekMedia(ready, clip.start, controller.signal);
      }
      const audio = getMusic();
      let startSoundtrack = false;
      if (audio && snapshot.soundtrack) {
        await mediaReady(audio, controller.signal);
        if (Number.isFinite(audio.duration) && at < audio.duration) {
          await seekMedia(audio, at, controller.signal);
          audio.volume = muted ? 0 : snapshot.soundtrack.volume;
          startSoundtrack = true;
        }
      }
      while (at < total - 0.005 && !controller.signal.aborted) {
        const loc = locateClip(snapshot.clips, at);
        if (!loc) break;
        const video = getVideo(loc.clip)!;
        await mediaReady(video, controller.signal);
        await seekMedia(
          video,
          Math.min(loc.local, loc.clip.end - 0.001),
          controller.signal,
        );
        video.volume = muted
          ? 0
          : loc.clip.volume * clipOpacity(loc.clip, loc.local);
        await Promise.all([
          video.play(),
          startSoundtrack && audio ? audio.play() : Promise.resolve(),
        ]);
        startSoundtrack = false;
        let stalledAt = performance.now(),
          last = video.currentTime;
        await new Promise<void>((ok, no) => {
          let frame = 0;
          const cleanup = () => {
              cancelAnimationFrame(frame);
              controller.signal.removeEventListener("abort", abort);
              video.removeEventListener("error", bad);
            },
            abort = () => {
              cleanup();
              video.pause();
              no(new DOMException("Aborted", "AbortError"));
            },
            bad = () => {
              cleanup();
              no(Error("DECODE"));
            };
          controller.signal.addEventListener("abort", abort, { once: true });
          video.addEventListener("error", bad, { once: true });
          const tick = () => {
            if (controller.signal.aborted) {
              abort();
              return;
            }
            if (video.ended || video.currentTime >= loc.clip.end - 0.008) {
              cleanup();
              video.pause();
              ok();
              return;
            }
            if (video.currentTime !== last) {
              last = video.currentTime;
              stalledAt = performance.now();
            } else if (performance.now() - stalledAt > 15000) {
              cleanup();
              no(Error("STALLED"));
              return;
            }
            at = loc.offset + Math.max(0, video.currentTime - loc.clip.start);
            video.volume = muted
              ? 0
              : loc.clip.volume * clipOpacity(loc.clip, video.currentTime);
            if (preview.current)
              paintVideoFrame(
                preview.current,
                video,
                loc.clip,
                video.currentTime,
                snapshot.bg,
              );
            setHead(at);
            frame = requestAnimationFrame(tick);
          };
          tick();
        });
        at = loc.offset + loc.clip.end - loc.clip.start;
        setHead(Math.min(total, at));
      }
    } catch {
      if (!controller.signal.aborted)
        setError(
          t(
            L(
              "Предпросмотр остановлен: проверьте исходник и разрешение воспроизведения.",
              "Preview stopped: check the source and playback permission.",
              "Алдын ала көру тоқтады: түпнұсқа мен ойнату рұқсатын тексеріңіз.",
            ),
          ),
        );
    } finally {
      if (playback.current === controller) stop();
    }
  }
  useEffect(() => {
    const element = timelineArea.current;
    if (!element) return;
    const measure = () => setTimelineAreaWidth(element.clientWidth);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const h = {
    ...history,
    undo: () => {
      stop();
      history.undo();
    },
    redo: () => {
      stop();
      history.redo();
    },
  };
  function apply(next: VideoDoc) {
    stop();
    history.commit(next);
  }
  function begin() {
    stop();
    history.begin();
  }
  function edit(p: Partial<VideoDoc["clips"][number]>, live = false) {
    if (!cur) return;
    const next = {
      ...value,
      clips: value.clips.map((c) => (c.id === cur.id ? { ...c, ...p } : c)),
    };
    stop();
    live ? history.update(next) : history.commit(next);
  }
  function moveClip(id: string, index: number) {
    const clips = [...value.clips],
      from = clips.findIndex((c) => c.id === id);
    if (from < 0) return;
    const [clip] = clips.splice(from, 1);
    clips.splice(Math.max(0, Math.min(clips.length, index)), 0, clip);
    apply({ ...value, clips });
  }
  function split() {
    const loc = locateClip(value.clips, playhead);
    if (
      !loc ||
      loc.local - loc.clip.start < 0.05 ||
      loc.clip.end - loc.local < 0.05
    )
      return;
    const right = { ...loc.clip, id: crypto.randomUUID(), start: loc.local },
      left = { ...loc.clip, end: loc.local },
      clips = [...value.clips];
    clips.splice(loc.index, 1, left, right);
    apply({ ...value, clips });
    setSelected(right.id);
  }
  function remove() {
    if (cur)
      apply({ ...value, clips: value.clips.filter((c) => c.id !== cur.id) });
  }
  async function addFiles(list: FileList | null) {
    if (!list?.length) return;
    stop();
    setError("");
    setImporting(true);
    const additions: VideoDoc["clips"] = [],
      relinks = new Map<string, { assetId: string; duration: number }>();
    const finishImports = () => {
      if (!additions.length && !relinks.size) return;
      const clips = [
        ...doc.current.clips.map((c) => {
          const link = relinks.get(c.id);
          return link
            ? { ...c, assetId: link.assetId, duration: link.duration }
            : c;
        }),
        ...additions,
      ];
      history.commit({ ...doc.current, clips });
      setSelected(additions[0]?.id ?? clips[0]?.id ?? null);
    };
    try {
      for (const file of Array.from(list)) {
        if (!file.type.startsWith("video/") || file.size > 250 * 1048576)
          throw Error("FILE");
        const url = URL.createObjectURL(file),
          video = document.createElement("video");
        video.preload = "metadata";
        video.src = url;
        try {
          await mediaReady(video);
          if (
            !Number.isFinite(video.duration) ||
            video.duration > 7200 ||
            video.duration < 0.05
          )
            throw Error("DURATION");
          const existing = doc.current.clips.find(
            (c) =>
              c.filename === file.name &&
              (!c.assetId || !assets.urls[c.assetId]) &&
              !relinks.has(c.id),
          );
          if (
            existing &&
            (Math.abs(existing.duration - video.duration) > 0.2 ||
              existing.end > video.duration + 0.001)
          )
            throw Error("MISMATCH");
          if (!existing && doc.current.clips.length + additions.length >= 30)
            throw Error("COUNT");
          const asset = await assets.add(file, existing?.assetId);
          if (existing)
            relinks.set(existing.id, {
              assetId: asset.id,
              duration: video.duration,
            });
          else
            additions.push({
              id: crypto.randomUUID(),
              assetId: asset.id,
              filename: file.name,
              start: 0,
              end: video.duration,
              duration: video.duration,
              title: "",
              volume: 1,
            });
        } finally {
          video.removeAttribute("src");
          video.load();
          URL.revokeObjectURL(url);
        }
      }
      finishImports();
    } catch (e) {
      finishImports();
      setError(
        t(
          (e as Error).message === "MISMATCH"
            ? L(
                "Длительность не совпадает с сохранённым исходником. Выберите правильный файл.",
                "Duration differs from the saved source. Choose the correct file.",
                "Ұзақтық сақталған түпнұсқаға сәйкес емес. Дұрыс файлды таңдаңыз.",
              )
            : (e as Error).message === "COUNT"
              ? L(
                  "Максимум 30 клипов.",
                  "Maximum 30 clips.",
                  "Ең көбі 30 клип.",
                )
              : L(
                  "Не все файлы добавлены. Используйте поддерживаемый браузером формат до 250 МБ и 2 часов.",
                  "Some files could not be added. Use a browser-decodable format up to 250 MB and two hours.",
                  "Кейбір файлдар қосылмады. Браузер қолдайтын пішім, 250 МБ және екі сағатқа дейін.",
                ),
        ),
      );
    } finally {
      setImporting(false);
    }
  }
  async function addSoundtrack(file?: File) {
    if (!file) return;
    stop();
    setError("");
    if (!file.type.startsWith("audio/") || file.size > 40 * 1048576) {
      setError(
        t(
          L(
            "Используйте аудиофайл до 40 МБ.",
            "Use an audio file up to 40 MB.",
            "40 МБ дейінгі аудиофайл қолданыңыз.",
          ),
        ),
      );
      return;
    }
    setImporting(true);
    const url = URL.createObjectURL(file),
      audio = document.createElement("audio");
    audio.src = url;
    try {
      await mediaReady(audio);
      if (!Number.isFinite(audio.duration) || audio.duration <= 0)
        throw Error();
      const asset = await assets.add(file);
      history.commit({
        ...doc.current,
        soundtrack: {
          assetId: asset.id,
          filename: file.name,
          volume: doc.current.soundtrack?.volume ?? 0.3,
        },
      });
    } catch {
      setError(
        t(
          L(
            "Аудиофайл не читается браузером.",
            "The browser cannot decode this audio.",
            "Браузер аудионы оқымайды.",
          ),
        ),
      );
    } finally {
      audio.removeAttribute("src");
      audio.load();
      URL.revokeObjectURL(url);
      setImporting(false);
    }
  }
  async function exportVideo() {
    if (!value.clips.length || busy) return;
    setError("");
    stop();
    const snapshot = structuredClone(value),
      duration = timelineDuration(snapshot.clips);
    if (
      snapshot.clips.some((c) => !c.assetId || !assets.urls[c.assetId]) ||
      (snapshot.soundtrack &&
        (!snapshot.soundtrack.assetId ||
          !assets.urls[snapshot.soundtrack.assetId]))
    ) {
      setError(
        t(
          L(
            "Привяжите все исходники перед экспортом.",
            "Relink every source before export.",
            "Экспорт алдында барлық түпнұсқаны байланыстырыңыз.",
          ),
        ),
      );
      return;
    }
    if (duration > 600) {
      setError(
        t(
          L(
            "Экспорт ограничен 10 минутами. Разделите длинный проект.",
            "Export is limited to 10 minutes. Split longer projects.",
            "Экспорт 10 минутпен шектелген. Ұзын жобаны бөліңіз.",
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
    if (
      !mime ||
      typeof AudioContext === "undefined" ||
      !HTMLCanvasElement.prototype.captureStream
    ) {
      setError(
        t(
          L(
            "Браузер не поддерживает WebM-экспорт с аудио. Используйте актуальный Chrome или Edge.",
            "Browser does not support WebM export with audio. Use a current Chrome or Edge.",
            "Браузер дыбысты WebM экспортын қолдамайды. Жаңа Chrome не Edge қолданыңыз.",
          ),
        ),
      );
      return;
    }
    const controller = new AbortController();
    exportAbort.current = controller;
    setBusy(true);
    setProgress(0);
    const output = document.createElement("canvas");
    output.width = +snapshot.width;
    output.height = Math.round((output.width * 9) / 16);
    const stream = output.captureStream(30),
      audio = new AudioContext(),
      destination = audio.createMediaStreamDestination(),
      mix = audio.createDynamicsCompressor();
    mix.threshold.value = -3;
    mix.ratio.value = 20;
    mix.connect(destination);
    destination.stream
      .getAudioTracks()
      .forEach((track) => stream.addTrack(track));
    const recorder = new MediaRecorder(stream, {
        mimeType: mime,
        videoBitsPerSecond: output.width >= 1280 ? 4500000 : 2500000,
      }),
      chunks: Blob[] = [];
    let bytes = 0,
      exportError = "",
      recorderError: Error | null = null;
    const videos: HTMLVideoElement[] = [];
    let soundtrack: HTMLAudioElement | null = null;
    const stopped = new Promise<void>((ok, no) => {
      recorder.onstop = () => ok();
      recorder.onerror = () => {
        recorderError = Error("RECORDER");
        no(recorderError);
      };
    });
    stopped.catch(() => undefined);
    recorder.ondataavailable = (e) => {
      if (!e.data.size) return;
      bytes += e.data.size;
      if (bytes > 180 * 1048576) {
        exportError = "SIZE";
        controller.abort();
        return;
      }
      chunks.push(e.data);
    };
    let elapsed = 0;
    try {
      await audio.resume();
      const tracks: {
        clip: VideoDoc["clips"][number];
        video: HTMLVideoElement;
        gain: GainNode;
        source: MediaElementAudioSourceNode;
      }[] = [];
      for (const clip of snapshot.clips) {
        if (controller.signal.aborted)
          throw new DOMException("Aborted", "AbortError");
        const video = document.createElement("video");
        video.preload = "auto";
        video.playsInline = true;
        video.src = assets.urls[clip.assetId!];
        videos.push(video);
        await mediaReady(video, controller.signal);
        await seekMedia(video, clip.start, controller.signal);
        const source = audio.createMediaElementSource(video),
          gain = audio.createGain();
        gain.gain.value = clip.volume;
        source.connect(gain).connect(mix);
        tracks.push({ clip, video, gain, source });
      }
      if (snapshot.soundtrack) {
        soundtrack = document.createElement("audio");
        soundtrack.src = assets.urls[snapshot.soundtrack.assetId!];
        await mediaReady(soundtrack, controller.signal);
        await seekMedia(soundtrack, 0, controller.signal);
        const source = audio.createMediaElementSource(soundtrack),
          gain = audio.createGain();
        gain.gain.value = snapshot.soundtrack.volume;
        source.connect(gain).connect(mix);
      }
      paintVideoFrame(
        output,
        tracks[0].video,
        tracks[0].clip,
        tracks[0].clip.start,
        snapshot.bg,
      );
      recorder.start(1000);
      let startSoundtrack = !!soundtrack;
      for (const { clip, video, gain, source } of tracks) {
        if (controller.signal.aborted)
          throw new DOMException("Aborted", "AbortError");
        await Promise.all([
          video.play(),
          startSoundtrack && soundtrack ? soundtrack.play() : Promise.resolve(),
        ]);
        startSoundtrack = false;
        let last = video.currentTime,
          stalledAt = performance.now();
        await new Promise<void>((ok, no) => {
          let frame = 0;
          const cleanup = () => {
              cancelAnimationFrame(frame);
              controller.signal.removeEventListener("abort", abort);
              video.removeEventListener("error", bad);
            },
            abort = () => {
              cleanup();
              video.pause();
              no(new DOMException("Aborted", "AbortError"));
            },
            bad = () => {
              cleanup();
              no(Error("DECODE"));
            };
          controller.signal.addEventListener("abort", abort, { once: true });
          video.addEventListener("error", bad, { once: true });
          const draw = () => {
            if (controller.signal.aborted) {
              abort();
              return;
            }
            if (recorderError) {
              cleanup();
              no(recorderError);
              return;
            }
            if (video.ended || video.currentTime >= clip.end - 0.008) {
              cleanup();
              video.pause();
              ok();
              return;
            }
            if (last !== video.currentTime) {
              last = video.currentTime;
              stalledAt = performance.now();
            } else if (performance.now() - stalledAt > 15000) {
              cleanup();
              no(Error("STALLED"));
              return;
            }
            gain.gain.value =
              clip.volume * clipOpacity(clip, video.currentTime);
            paintVideoFrame(
              output,
              video,
              clip,
              video.currentTime,
              snapshot.bg,
            );
            if (preview.current)
              paintVideoFrame(
                preview.current,
                video,
                clip,
                video.currentTime,
                snapshot.bg,
              );
            setProgress(
              Math.min(
                99,
                Math.round(
                  ((elapsed + video.currentTime - clip.start) / duration) * 100,
                ),
              ),
            );
            frame = requestAnimationFrame(draw);
          };
          draw();
        });
        elapsed += clip.end - clip.start;
        source.disconnect();
        gain.disconnect();
      }
      if (recorder.state !== "inactive") recorder.stop();
      await new Promise<void>((ok, no) => {
        const timer = setTimeout(() => no(Error("FINISH_TIMEOUT")), 10000);
        stopped.then(
          () => {
            clearTimeout(timer);
            ok();
          },
          (e) => {
            clearTimeout(timer);
            no(e);
          },
        );
      });
      if (controller.signal.aborted)
        throw new DOMException("Aborted", "AbortError");
      download("creative-school.webm", new Blob(chunks, { type: mime }));
      setProgress(100);
    } catch {
      if (exportError === "SIZE")
        setError(
          t(
            L(
              "Экспорт превысил 180 МБ. Уменьшите разрешение или длительность.",
              "Export exceeded 180 MB. Reduce resolution or duration.",
              "Экспорт 180 МБ-тан асты. Ажыратымдылық не ұзақтықты азайтыңыз.",
            ),
          ),
        );
      else if (!controller.signal.aborted)
        setError(
          t(
            L(
              "Экспорт не завершён. Проверьте исходники и повторите с активной вкладкой.",
              "Export failed. Check sources and retry with this tab active.",
              "Экспорт аяқталмады. Түпнұсқаларды тексеріп, белсенді терезеде қайталаңыз.",
            ),
          ),
        );
    } finally {
      if (recorder.state !== "inactive") recorder.stop();
      for (const video of videos) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
      soundtrack?.pause();
      soundtrack?.removeAttribute("src");
      stream.getTracks().forEach((track) => track.stop());
      await audio.close().catch(() => undefined);
      output.width = 1;
      output.height = 1;
      if (mounted.current) {
        setBusy(false);
        setHead(Math.min(position.current, duration));
      }
      exportAbort.current = null;
    }
  }
  function onKey(e: KeyboardEvent) {
    if (disabled) return;
    historyKey(e, h);
    if (
      ["INPUT", "TEXTAREA", "SELECT"].includes(
        (e.target as HTMLElement).tagName,
      )
    )
      return;
    if (e.key === " " && (e.target as HTMLElement).tagName !== "BUTTON") {
      e.preventDefault();
      void play();
    } else if (e.key.toLowerCase() === "s" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      split();
    } else if (e.key === "Delete") {
      e.preventDefault();
      remove();
    } else if (e.key === "Home") {
      e.preventDefault();
      seek(0);
    } else if (e.key === "End") {
      e.preventDefault();
      seek(total);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      seek(
        playhead +
          (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 1 : 1 / 30),
      );
    }
  }
  const ticks = Array.from(
    {
      length: Math.min(
        101,
        Math.floor(total / (total > 120 ? 10 : total > 30 ? 5 : 1)) + 1,
      ),
    },
    (_, i) => i * (total > 120 ? 10 : total > 30 ? 5 : 1),
  );
  return (
    <div
      className="media-workspace"
      data-testid="video-workbench"
      tabIndex={0}
      onKeyDown={onKey}
      onDragOver={(e) => {
        if (
          Array.from(e.dataTransfer.items).some((item) => item.kind === "file")
        )
          e.preventDefault();
      }}
      onDrop={(e) => {
        if (e.dataTransfer.files.length) {
          e.preventDefault();
          if (!disabled) void addFiles(e.dataTransfer.files);
        }
      }}
    >
      <div className="media-toolbar">
        <label className="media-file">
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
            disabled={disabled}
            onChange={(e) => void addFiles(e.target.files)}
          />
        </label>
        <HistoryButtons history={h} t={t} disabled={disabled} />
        <button
          disabled={
            disabled ||
            !location ||
            playhead - location.offset < 0.05 ||
            location.offset +
              location.clip.end -
              location.clip.start -
              playhead <
              0.05
          }
          onClick={split}
          title="S"
        >
          {t(L("Разрезать", "Split", "Бөлу"))}
        </button>
        <span className="media-spacer" />
        <button
          className="media-primary"
          disabled={disabled || !value.clips.length}
          onClick={() => void exportVideo()}
        >
          WebM ↓
        </button>
      </div>
      <CacheStatus assets={assets} ids={ids} t={t} />
      {error && (
        <div className="media-error" role="alert">
          {error}
        </div>
      )}
      <div className="media-layout">
        <div className="media-monitor">
          <canvas
            ref={preview}
            width={+value.width}
            height={Math.round((+value.width * 9) / 16)}
            className="media-preview-canvas"
            aria-label={t(
              L(
                "Предпросмотр монтажа",
                "Timeline preview",
                "Монтажды алдын ала көру",
              ),
            )}
          />
          {!value.clips.length && (
            <div className="media-empty">
              <div>
                <strong>
                  {t(
                    L(
                      "Добавьте исходные клипы",
                      "Add source clips",
                      "Бастапқы клиптерді қосыңыз",
                    ),
                  )}
                </strong>
                <p>
                  {t(
                    L(
                      "Монитор показывает итог: обрезку, титры, цвет и затемнения.",
                      "Monitor shows the result: trims, titles, color and fades.",
                      "Монитор соңғы нәтижені көрсетеді: қию, титр, түс және бәсеңдеу.",
                    ),
                  )}
                </p>
              </div>
            </div>
          )}
          <div className="media-transport">
            <button
              disabled={disabled || !value.clips.length}
              onClick={() => void play()}
              aria-label={t(
                playing
                  ? L("Пауза", "Pause", "Кідірту")
                  : L(
                      "Воспроизвести монтаж",
                      "Play timeline",
                      "Монтажды ойнату",
                    ),
              )}
            >
              {playing ? "❚❚" : "▶"}
            </button>
            <button disabled={disabled} onClick={() => seek(0)} title="Home">
              ↤
            </button>
            <span className="media-timecode">
              {formatTime(playhead)} / {formatTime(total)}
            </span>
            <button
              disabled={disabled}
              aria-pressed={muted}
              onClick={() => {
                stop();
                setMuted(!muted);
              }}
            >
              {t(
                muted
                  ? L("Звук выкл.", "Sound off", "Дыбыс өшірулі")
                  : L("Звук вкл.", "Sound on", "Дыбыс қосулы"),
              )}
            </button>
          </div>
          <div className="media-timeline-wrap">
            <label>
              {t(
                L(
                  "Позиция на шкале, с",
                  "Timeline position, seconds",
                  "Уақыт шкаласындағы орын, секунд",
                ),
              )}
              <input
                type="range"
                min={0}
                max={Math.max(total, 0.01)}
                step={1 / 30}
                value={Math.min(playhead, total)}
                disabled={disabled || !total}
                onChange={(e) => seek(+e.target.value)}
              />
            </label>
            <div className="media-timeline-scroll" ref={timelineArea}>
              <div
                className="media-timeline"
                style={{ width: timelineWidth }}
                onClick={(e) => {
                  if (disabled) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  seek(((e.clientX - r.left) / r.width) * total);
                }}
              >
                <div className="media-ruler">
                  {ticks.map((tick) => (
                    <span
                      key={tick}
                      className="media-tick"
                      style={{ left: total ? `${(tick / total) * 100}%` : 0 }}
                    >
                      {formatTime(tick)}
                    </span>
                  ))}
                </div>
                {value.clips.map((clip, i) => {
                  const offset = value.clips
                    .slice(0, i)
                    .reduce((s, c) => s + c.end - c.start, 0);
                  return (
                    <button
                      key={clip.id}
                      className="media-timeline-clip"
                      style={{
                        left: `${(offset / total) * 100}%`,
                        width: `${((clip.end - clip.start) / total) * 100}%`,
                      }}
                      draggable={!disabled}
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/plain", clip.id)
                      }
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (!disabled)
                          moveClip(e.dataTransfer.getData("text/plain"), i);
                      }}
                      aria-pressed={clip.id === selected}
                      title={clip.filename}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(clip.id);
                        seek(offset);
                      }}
                    >
                      <span>
                        {!clip.assetId || !assets.urls[clip.assetId]
                          ? "⚠ "
                          : ""}
                        {i + 1}. {clip.filename}
                      </span>
                      <small>{(clip.end - clip.start).toFixed(2)} s</small>
                    </button>
                  );
                })}
                <div
                  className="media-playhead"
                  style={{ left: total ? `${(playhead / total) * 100}%` : 0 }}
                />
              </div>
            </div>
            <div className="media-transport">
              <label className="media-slider-label">
                {t(L("Масштаб шкалы", "Timeline zoom", "Шкала масштабы"))}
                <input
                  type="range"
                  min={15}
                  max={120}
                  value={timelineZoom}
                  onChange={(e) => setTimelineZoom(+e.target.value)}
                />
              </label>
              <span className="media-muted">
                {t(
                  L(
                    "Перетаскивайте клипы для смены порядка.",
                    "Drag clips to reorder.",
                    "Ретті өзгерту үшін клиптерді тартыңыз.",
                  ),
                )}
              </span>
            </div>
          </div>
        </div>
        <aside className="media-inspector">
          <h3>{t(L("Выбранный клип", "Selected clip", "Таңдалған клип"))}</h3>
          {cur ? (
            <>
              <p className="media-title">{cur.filename}</p>
              <div className="media-two">
                <button
                  disabled={disabled || value.clips[0]?.id === cur.id}
                  onClick={() =>
                    moveClip(
                      cur.id,
                      value.clips.findIndex((c) => c.id === cur.id) - 1,
                    )
                  }
                >
                  {t(L("Раньше", "Earlier", "Ертерек"))}
                </button>
                <button
                  disabled={disabled || value.clips.at(-1)?.id === cur.id}
                  onClick={() =>
                    moveClip(
                      cur.id,
                      value.clips.findIndex((c) => c.id === cur.id) + 1,
                    )
                  }
                >
                  {t(L("Позже", "Later", "Кейінірек"))}
                </button>
                <button
                  disabled={disabled || value.clips.length >= 30}
                  onClick={() => {
                    const c = { ...cur, id: crypto.randomUUID() },
                      clips = [...value.clips],
                      i = clips.findIndex((x) => x.id === cur.id);
                    clips.splice(i + 1, 0, c);
                    apply({ ...value, clips });
                    setSelected(c.id);
                  }}
                >
                  {t(L("Дубликат", "Duplicate", "Көшірме"))}
                </button>
                <button disabled={disabled} onClick={remove}>
                  {t(L("Удалить клип", "Remove clip", "Клипті жою"))}
                </button>
              </div>
              <div className="media-two">
                <label>
                  {t(L("Начало, с", "In, seconds", "Басы, секунд"))}
                  <input
                    type="number"
                    step={0.01}
                    min={0}
                    max={cur.end - 0.05}
                    value={cur.start}
                    disabled={disabled}
                    onFocus={begin}
                    onBlur={history.end}
                    onChange={(e) =>
                      edit(
                        {
                          start: Math.max(
                            0,
                            Math.min(+e.target.value, cur.end - 0.05),
                          ),
                        },
                        true,
                      )
                    }
                  />
                </label>
                <label>
                  {t(L("Конец, с", "Out, seconds", "Соңы, секунд"))}
                  <input
                    type="number"
                    step={0.01}
                    min={cur.start + 0.05}
                    max={cur.duration}
                    value={cur.end}
                    disabled={disabled}
                    onFocus={begin}
                    onBlur={history.end}
                    onChange={(e) =>
                      edit(
                        {
                          end: Math.min(
                            cur.duration,
                            Math.max(cur.start + 0.05, +e.target.value),
                          ),
                        },
                        true,
                      )
                    }
                  />
                </label>
              </div>
              <label>
                {t(L("Титр", "Title overlay", "Титр"))}
                <input
                  maxLength={100}
                  value={cur.title}
                  disabled={disabled}
                  onFocus={begin}
                  onBlur={history.end}
                  onChange={(e) => edit({ title: e.target.value }, true)}
                />
              </label>
              <Slider
                label={t(L("Громкость клипа", "Clip volume", "Клип дыбысы"))}
                value={cur.volume}
                min={0}
                max={1}
                step={0.05}
                disabled={disabled}
                onBegin={begin}
                onEnd={history.end}
                onChange={(n) => edit({ volume: n }, true)}
              />
              <Slider
                label={t(
                  L(
                    "Затемнение в начале и конце, с",
                    "Fade in/out, seconds",
                    "Басында және соңында бәсеңдеу, секунд",
                  ),
                )}
                value={cur.fade ?? 0}
                min={0}
                max={Math.min(3, (cur.end - cur.start) / 2)}
                step={0.1}
                disabled={disabled}
                onBegin={begin}
                onEnd={history.end}
                onChange={(n) => edit({ fade: n }, true)}
              />
              <Slider
                label={t(
                  L("Яркость клипа", "Clip brightness", "Клип жарықтығы"),
                )}
                value={cur.brightness ?? 100}
                min={0}
                max={200}
                disabled={disabled}
                onBegin={begin}
                onEnd={history.end}
                onChange={(n) => edit({ brightness: n }, true)}
              />
              <Slider
                label={t(
                  L("Контраст клипа", "Clip contrast", "Клип контрасты"),
                )}
                value={cur.contrast ?? 100}
                min={0}
                max={200}
                disabled={disabled}
                onBegin={begin}
                onEnd={history.end}
                onChange={(n) => edit({ contrast: n }, true)}
              />
            </>
          ) : (
            <p className="media-muted">
              {t(
                L(
                  "Выберите клип на шкале.",
                  "Select a timeline clip.",
                  "Шкаладан клипті таңдаңыз.",
                ),
              )}
            </p>
          )}
          <h3>{t(L("Звуковая дорожка", "Soundtrack", "Дыбыс жолы"))}</h3>
          <label className="media-file">
            {t(
              L(
                "Добавить / привязать звуковую дорожку",
                "Add / relink soundtrack",
                "Дыбыс жолын қосу / байланыстыру",
              ),
            )}
            <input
              type="file"
              accept="audio/*"
              disabled={disabled}
              onChange={(e) => void addSoundtrack(e.target.files?.[0])}
            />
          </label>
          {value.soundtrack && (
            <>
              <p className="media-muted">
                {value.soundtrack.filename}{" "}
                {!value.soundtrack.assetId ||
                !assets.urls[value.soundtrack.assetId]
                  ? "⚠"
                  : "✓"}
              </p>
              <Slider
                label={t(
                  L(
                    "Громкость дорожки",
                    "Soundtrack volume",
                    "Дыбыс жолының деңгейі",
                  ),
                )}
                value={value.soundtrack.volume}
                min={0}
                max={1}
                step={0.05}
                disabled={disabled}
                onBegin={begin}
                onEnd={history.end}
                onChange={(n) =>
                  history.update({
                    ...value,
                    soundtrack: { ...value.soundtrack!, volume: n },
                  })
                }
              />
              <button
                disabled={disabled}
                onClick={() => apply({ ...value, soundtrack: undefined })}
              >
                {t(L("Убрать дорожку", "Remove soundtrack", "Дыбыс жолын жою"))}
              </button>
            </>
          )}
          <h3>
            {t(L("Параметры проекта", "Project settings", "Жоба баптаулары"))}
          </h3>
          <label>
            {t(L("Разрешение", "Resolution", "Ажыратымдылық"))}
            <select
              value={value.width}
              disabled={disabled}
              onChange={(e) =>
                apply({ ...value, width: e.target.value as VideoDoc["width"] })
              }
            >
              <option value="1280">1280 × 720</option>
              <option value="720">720 × 405</option>
            </select>
          </label>
          <label>
            {t(L("Фон", "Background", "Фон"))}
            <input
              type="color"
              value={value.bg}
              disabled={disabled}
              onFocus={begin}
              onBlur={history.end}
              onChange={(e) => history.update({ ...value, bg: e.target.value })}
            />
          </label>
          <p className="media-muted media-wide">
            {t(
              L(
                "WebM с аудио, до 10 минут. Экспорт в реальном времени; держите вкладку активной.",
                "WebM with audio, up to 10 minutes. Real-time export; keep this tab active.",
                "Дыбысты WebM, 10 минутқа дейін. Нақты уақыттағы экспорт; терезені белсенді ұстаңыз.",
              ),
            )}
          </p>
        </aside>
      </div>
      {busy && (
        <div className="media-export-status" role="status">
          <span>
            {t(L("Экспорт", "Export", "Экспорт"))}: {progress}%
          </span>
          <progress max={100} value={progress} />
          <button onClick={() => exportAbort.current?.abort()}>
            {t(L("Отменить экспорт", "Cancel export", "Экспортты тоқтату"))}
          </button>
        </div>
      )}
      <div className="media-assets">
        {value.clips.map((c) => (
          <span key={c.id}>
            {c.assetId && assets.urls[c.assetId] ? "✓" : "⚠"} {c.filename}
          </span>
        ))}
      </div>
      <div className="media-help">
        {t(
          L(
            "Пробел — воспроизведение. S — разрезать. Стрелки — кадр; Shift+стрелка — секунда. Ctrl/⌘ Z — отмена. Исходники остаются на устройстве; кэш не заменяет резервную копию.",
            "Space: play. S: split. Arrows: one frame; Shift+arrow: one second. Ctrl/⌘ Z: undo. Sources stay on this device; cache is not a backup.",
            "Бос орын: ойнату. S: бөлу. Бағыттауыш: кадр; Shift+бағыттауыш: секунд. Ctrl/⌘ Z: болдырмау. Түпнұсқалар құрылғыда қалады; кэш резервтік көшірме емес.",
          ),
        )}
      </div>
    </div>
  );
}
