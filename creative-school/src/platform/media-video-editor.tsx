import {
  frameRate,
  snapToFrame,
  timecode,
  toTicks,
  toSeconds,
  ticksPerFrame,
} from "../engine/time";
import { keyframeTrack, type VideoKeyframe } from "../engine/keyframes";
import { FrameTelemetry } from "../engine/telemetry";
import { AudioStrip, PreviewAudioBus } from "../engine/audio";
import { PrecisionNumber } from "./PrecisionNumber";
import { parseCaptions, captionsToSrt } from "./captions";
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
  clipDuration,
  videoDimensions,
  locateClip,
  mediaReady,
  paintVideoFrame,
  prepareVideoFrame,
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
    [muted, setMuted] = useState(false),
    [captionId, setCaptionId] = useState<string | null>(null),
    [frameSnap, setFrameSnap] = useState(true),
    [keyId, setKeyId] = useState<string | null>(null),
    [renderStats, setRenderStats] = useState({ mean: 0, p95: 0, samples: 0 }),
    [peak, setPeak] = useState(0),
    [rms, setRms] = useState(0);
  const doc = useRef(value);
  doc.current = value;
  const position = useRef(playhead);

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
    mounted = useRef(true),
    previewAudio = useRef<PreviewAudioBus | null>(null);
  const cur = value.clips.find((c) => c.id === selected) ?? null,
    total = timelineDuration(value.clips),
    dimensions = videoDimensions(+value.width, value.aspect),
    caption = value.captions?.find((c) => c.id === captionId) ?? null,
    timelineWidth = Math.max(timelineAreaWidth, total * timelineZoom),
    location = locateClip(value.clips, playhead),
    disabled = busy || importing;
  function stop() {
    playback.current?.abort();
    playback.current = null;
    for (const e of elements.current.values()) e.video.pause();
    music.current?.audio.pause();
    if (mounted.current) {
      setPlaying(false);
      setPlayhead(position.current);
    }
  }
  function setHead(s: number) {
    position.current = s;
    setPlayhead(s);
  }
  function seek(s: number) {
    stop();
    setHead(
      Math.max(
        0,
        Math.min(total, frameSnap ? snapToFrame(s, value.fps ?? 30) : s),
      ),
    );
  }
  function getVideo(clip: TimelineClip) {
    const url = clip.assetId ? assets.urls[clip.assetId] : undefined;
    if (!url) return null;
    let e = elements.current.get(clip.id);
    if (e?.url !== url) {
      if (e) previewAudio.current?.remove(e.video);
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
      previewAudio.current?.dispose();
      previewAudio.current = null;
    };
  }, []);
  useEffect(() => {
    for (const [id, entry] of elements.current) {
      if (!value.clips.some((c) => c.id === id)) {
        entry.video.pause();
        entry.video.removeAttribute("src");
        entry.video.load();
        previewAudio.current?.remove(entry.video);
        elements.current.delete(id);
      }
    }
  }, [value.clips]);
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
            value,
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
    const telemetry = new FrameTelemetry();
    let lastUI = 0;
    const animated = new Float64Array(5),
      levels = new Float64Array(2);
    const audioBus = (previewAudio.current ??= new PreviewAudioBus());
    let at = position.current >= total - 0.01 ? 0 : position.current;
    setHead(at);
    setPlaying(true);
    try {
      await audioBus.resume();
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
          audio.volume = 1;
          audioBus
            .strip(audio)
            .setVolume(muted ? 0 : snapshot.soundtrack.volume);
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
        video.playbackRate = loc.clip.speed ?? 1;
        video.volume = 1;
        const audioStrip = audioBus.strip(video, loc.clip.audioEQ);
        audioStrip.setVolume(
          muted ? 0 : loc.clip.volume * clipOpacity(loc.clip, loc.local),
        );
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
          const track = keyframeTrack(loc.clip);
          if (preview.current) prepareVideoFrame(preview.current, snapshot);
          const tick = () => {
            const frameStarted = performance.now();
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
            at =
              loc.offset +
              Math.max(0, video.currentTime - loc.clip.start) /
                (loc.clip.speed ?? 1);
            track.evaluate(toTicks(video.currentTime), animated);
            audioStrip.setVolume(
              muted
                ? 0
                : animated[4] * clipOpacity(loc.clip, video.currentTime),
            );
            if (preview.current)
              paintVideoFrame(
                preview.current,
                video,
                loc.clip,
                video.currentTime,
                snapshot.bg,
                snapshot,
              );
            position.current = at;
            if (frameStarted - lastUI >= 100) {
              lastUI = frameStarted;
              setPlayhead(at);
              audioBus.measure(levels);
              setPeak(levels[0]);
              setRms(levels[1]);
            }
            telemetry.record(performance.now() - frameStarted);
            frame = requestAnimationFrame(tick);
          };
          tick();
        });
        at = loc.offset + clipDuration(loc.clip);
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
      if (playback.current === controller) {
        stop();
        setRenderStats(telemetry.summary());
      }
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
  const selectedKey = cur?.keyframes?.find((k) => k.id === keyId) ?? null;
  function addKeyframe() {
    if (!cur || !location || location.clip.id !== cur.id) return;
    const keyLocation = locateClip(
      value.clips,
      Math.max(0, Math.min(total, snapToFrame(playhead, value.fps ?? 30))),
    );
    if (!keyLocation || keyLocation.clip.id !== cur.id) return;
    const tick = Math.max(
        0,
        Math.min(toTicks(cur.duration), toTicks(keyLocation.local)),
      ),
      existing = cur.keyframes?.find((k) => k.tick === tick);
    if (existing) {
      setKeyId(existing.id);
      return;
    }
    if ((cur.keyframes?.length ?? 0) >= 120) return;
    const values = new Float64Array(5);
    keyframeTrack(cur).evaluate(tick, values);
    const key: VideoKeyframe = {
      id: crypto.randomUUID(),
      tick,
      zoom: values[0],
      panX: values[1],
      panY: values[2],
      brightness: values[3],
      volume: values[4],
      interpolation: "smooth",
    };
    edit({
      keyframes: [...(cur.keyframes ?? []), key].sort(
        (a, b) => a.tick - b.tick,
      ),
    });
    setKeyId(key.id);
  }
  function editKey(change: Partial<VideoKeyframe>, live = false) {
    if (cur && selectedKey)
      edit(
        {
          keyframes: cur.keyframes?.map((k) =>
            k.id === selectedKey.id ? { ...k, ...change } : k,
          ),
        },
        live,
      );
  }
  function chooseKey(id: string) {
    if (!cur) return;
    const key = cur.keyframes?.find((k) => k.id === id);
    if (!key) return;
    setKeyId(id);
    let offset = 0;
    for (const c of value.clips) {
      if (c.id === cur.id) break;
      offset += clipDuration(c);
    }
    seek(offset + (toSeconds(key.tick) - cur.start) / (cur.speed ?? 1));
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
    const loc = locateClip(
      value.clips,
      frameSnap ? snapToFrame(playhead, value.fps ?? 30) : playhead,
    );
    if (
      !loc ||
      loc.local - loc.clip.start < 0.05 ||
      loc.clip.end - loc.local < 0.05
    )
      return;
    const boundary = loc.local;
    const right = { ...loc.clip, id: crypto.randomUUID(), start: boundary },
      left = { ...loc.clip, end: boundary },
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
    const outputSize = videoDimensions(+snapshot.width, snapshot.aspect);
    output.width = outputSize.width;
    output.height = outputSize.height;
    const outputRate = frameRate(snapshot.fps ?? 30);
    const stream = output.captureStream(outputRate.num / outputRate.den),
      audio = new AudioContext(),
      destination = audio.createMediaStreamDestination(),
      mix = audio.createDynamicsCompressor(),
      silence = audio.createConstantSource();
    silence.offset.value = 0;
    silence.connect(mix);
    silence.start();
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
    const videos: HTMLVideoElement[] = [],
      strips: AudioStrip[] = [];
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
    const exportValues = new Float64Array(5);
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
        video.playbackRate = clip.speed ?? 1;
        video.preload = "auto";
        video.playsInline = true;
        video.src = assets.urls[clip.assetId!];
        videos.push(video);
        await mediaReady(video, controller.signal);
        await seekMedia(video, clip.start, controller.signal);
        const source = audio.createMediaElementSource(video),
          gain = audio.createGain();
        gain.gain.value = clip.volume;
        const strip = new AudioStrip(audio, source, gain, clip.audioEQ);
        strips.push(strip);
        gain.connect(mix);
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
      prepareVideoFrame(output, snapshot);
      if (preview.current) prepareVideoFrame(preview.current, snapshot);
      paintVideoFrame(
        output,
        tracks[0].video,
        tracks[0].clip,
        tracks[0].clip.start,
        snapshot.bg,
        snapshot,
      );
      // Keep presenting the first frame until the encoder is ready. A very
      // short clip can otherwise end before MediaRecorder receives any frame.
      await new Promise<void>((ok, no) => {
        let frame = 0;
        const cleanup = () => {
          cancelAnimationFrame(frame);
          clearTimeout(timer);
          recorder.removeEventListener("start", ready);
          recorder.removeEventListener("error", bad);
          controller.signal.removeEventListener("abort", abort);
        };
        const ready = () => {
          cleanup();
          ok();
        };
        const bad = () => {
          cleanup();
          no(Error("RECORDER"));
        };
        const abort = () => {
          cleanup();
          no(new DOMException("Aborted", "AbortError"));
        };
        const timer = setTimeout(() => {
          cleanup();
          no(Error("START_TIMEOUT"));
        }, 10000);
        const prime = () => {
          paintVideoFrame(
            output,
            tracks[0].video,
            tracks[0].clip,
            tracks[0].clip.start,
            snapshot.bg,
            snapshot,
          );
          (
            stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack
          ).requestFrame?.();
          frame = requestAnimationFrame(prime);
        };
        recorder.addEventListener("start", ready, { once: true });
        recorder.addEventListener("error", bad, { once: true });
        controller.signal.addEventListener("abort", abort, { once: true });
        recorder.start(250);
        prime();
      });
      let startSoundtrack = !!soundtrack;
      for (const { clip, video, gain, source } of tracks) {
        video.playbackRate = clip.speed ?? 1;
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
              (keyframeTrack(clip).evaluate(
                toTicks(video.currentTime),
                exportValues,
              ),
              exportValues[4]) * clipOpacity(clip, video.currentTime);
            paintVideoFrame(
              output,
              video,
              clip,
              video.currentTime,
              snapshot.bg,
              snapshot,
            );
            if (preview.current)
              paintVideoFrame(
                preview.current,
                video,
                clip,
                video.currentTime,
                snapshot.bg,
                snapshot,
              );
            setProgress(
              Math.min(
                99,
                Math.round(
                  ((elapsed +
                    (video.currentTime - clip.start) / (clip.speed ?? 1)) /
                    duration) *
                    100,
                ),
              ),
            );
            frame = requestAnimationFrame(draw);
          };
          draw();
        });
        elapsed += clipDuration(clip);
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
      const exported = new Blob(chunks, { type: mime });
      const signature = new Uint8Array(
        await exported.slice(0, 4).arrayBuffer(),
      );
      if (
        signature.length !== 4 ||
        signature[0] !== 0x1a ||
        signature[1] !== 0x45 ||
        signature[2] !== 0xdf ||
        signature[3] !== 0xa3
      )
        throw Error("EMPTY_EXPORT");
      download("creative-school.webm", exported);
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
      for (const strip of strips) strip.dispose();
      silence.stop();
      silence.disconnect();
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
          (e.key === "ArrowRight" ? 1 : -1) *
            (e.shiftKey
              ? 1
              : toSeconds(ticksPerFrame(frameRate(value.fps ?? 30)))),
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
            location.offset + clipDuration(location.clip) - playhead < 0.05
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
            width={dimensions.width}
            height={dimensions.height}
            style={{ aspectRatio: `${dimensions.width}/${dimensions.height}` }}
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
              <small className="media-frame-code">
                {timecode(playhead, value.fps ?? 30)} NDF
              </small>
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
                step={
                  frameSnap
                    ? toSeconds(ticksPerFrame(frameRate(value.fps ?? 30)))
                    : 0.001
                }
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
                    .reduce((s, c) => s + clipDuration(c), 0);
                  return (
                    <button
                      key={clip.id}
                      className="media-timeline-clip"
                      style={{
                        left: `${(offset / total) * 100}%`,
                        width: `${(clipDuration(clip) / total) * 100}%`,
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
                      <small>{clipDuration(clip).toFixed(2)} s</small>
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
                <textarea
                  rows={2}
                  maxLength={100}
                  aria-label={t(L("Титр", "Title overlay", "Титр"))}
                  value={cur.title}
                  disabled={disabled}
                  onFocus={begin}
                  onBlur={history.end}
                  onChange={(e) => edit({ title: e.target.value }, true)}
                />
              </label>
              <h3>
                {t(L("Кадр и темп", "Framing and pace", "Кадр мен қарқын"))}
              </h3>
              <label>
                {t(L("Скорость клипа", "Clip speed", "Клип жылдамдығы"))}
                <select
                  aria-label={t(
                    L("Скорость клипа", "Clip speed", "Клип жылдамдығы"),
                  )}
                  value={cur.speed ?? 1}
                  disabled={disabled}
                  onChange={(e) => edit({ speed: +e.target.value })}
                >
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}×
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t(L("Заполнение кадра", "Frame fitting", "Кадрды толтыру"))}
                <select
                  aria-label={t(
                    L("Заполнение кадра", "Frame fitting", "Кадрды толтыру"),
                  )}
                  value={cur.fit ?? "contain"}
                  disabled={disabled}
                  onChange={(e) =>
                    edit({ fit: e.target.value as "contain" | "cover" })
                  }
                >
                  <option value="contain">
                    {t(
                      L("Вписать целиком", "Fit whole image", "Толық сыйдыру"),
                    )}
                  </option>
                  <option value="cover">
                    {t(
                      L(
                        "Заполнить с обрезкой",
                        "Fill and crop",
                        "Қиып толтыру",
                      ),
                    )}
                  </option>
                </select>
              </label>
              <Slider
                label={t(L("Приближение", "Zoom", "Жақындату"))}
                value={cur.zoom ?? 1}
                min={1}
                max={3}
                step={0.05}
                disabled={disabled}
                onBegin={begin}
                onEnd={history.end}
                onChange={(n) => edit({ zoom: n }, true)}
              />
              <Slider
                label={t(
                  L(
                    "Сдвиг по горизонтали",
                    "Horizontal pan",
                    "Көлденең жылжыту",
                  ),
                )}
                value={cur.panX ?? 0}
                min={-1}
                max={1}
                step={0.02}
                disabled={disabled}
                onBegin={begin}
                onEnd={history.end}
                onChange={(n) => edit({ panX: n }, true)}
              />
              <Slider
                label={t(
                  L("Сдвиг по вертикали", "Vertical pan", "Тік жылжыту"),
                )}
                value={cur.panY ?? 0}
                min={-1}
                max={1}
                step={0.02}
                disabled={disabled}
                onBegin={begin}
                onEnd={history.end}
                onChange={(n) => edit({ panY: n }, true)}
              />
              <div className="media-two">
                <button
                  aria-pressed={!!cur.flipX}
                  disabled={disabled}
                  onClick={() => edit({ flipX: !cur.flipX })}
                >
                  {t(L("Зеркало ↔", "Flip horizontal", "Көлденең айна"))}
                </button>
                <button
                  aria-pressed={!!cur.flipY}
                  disabled={disabled}
                  onClick={() => edit({ flipY: !cur.flipY })}
                >
                  {t(L("Зеркало ↕", "Flip vertical", "Тік айна"))}
                </button>
              </div>
              <details className="media-wide">
                <summary>
                  {t(
                    L("Оформление титра", "Title styling", "Титрді безендіру"),
                  )}
                </summary>
                <label>
                  {t(L("Положение титра", "Title position", "Титр орны"))}
                  <select
                    aria-label={t(
                      L("Положение титра", "Title position", "Титр орны"),
                    )}
                    value={cur.titlePosition ?? "bottom"}
                    disabled={disabled}
                    onChange={(e) =>
                      edit({
                        titlePosition: e.target
                          .value as TimelineClip["titlePosition"],
                      })
                    }
                  >
                    <option value="top">
                      {t(L("Сверху", "Top", "Жоғары"))}
                    </option>
                    <option value="center">
                      {t(L("По центру", "Center", "Ортада"))}
                    </option>
                    <option value="bottom">
                      {t(L("Снизу", "Bottom", "Төмен"))}
                    </option>
                  </select>
                </label>
                <label>
                  {t(
                    L(
                      "Выравнивание титра",
                      "Title alignment",
                      "Титрді туралау",
                    ),
                  )}
                  <select
                    aria-label={t(
                      L(
                        "Выравнивание титра",
                        "Title alignment",
                        "Титрді туралау",
                      ),
                    )}
                    value={cur.titleAlign ?? "left"}
                    disabled={disabled}
                    onChange={(e) =>
                      edit({
                        titleAlign: e.target
                          .value as TimelineClip["titleAlign"],
                      })
                    }
                  >
                    <option value="left">{t(L("Слева", "Left", "Сол"))}</option>
                    <option value="center">
                      {t(L("Центр", "Center", "Орта"))}
                    </option>
                    <option value="right">
                      {t(L("Справа", "Right", "Оң"))}
                    </option>
                  </select>
                </label>
                <label>
                  {t(L("Цвет титра", "Title color", "Титр түсі"))}
                  <input
                    type="color"
                    value={cur.titleColor ?? "#ffffff"}
                    disabled={disabled}
                    onFocus={begin}
                    onBlur={history.end}
                    onChange={(e) => edit({ titleColor: e.target.value }, true)}
                  />
                </label>
                <Slider
                  label={t(L("Размер титра", "Title size", "Титр өлшемі"))}
                  value={cur.titleSize ?? 44}
                  min={20}
                  max={100}
                  disabled={disabled}
                  onBegin={begin}
                  onEnd={history.end}
                  onChange={(n) => edit({ titleSize: n }, true)}
                />
                <label className="media-check">
                  <input
                    type="checkbox"
                    checked={cur.titleBackground !== false}
                    disabled={disabled}
                    onChange={(e) =>
                      edit({ titleBackground: e.target.checked })
                    }
                  />
                  {t(L("Подложка титра", "Title background", "Титр фоны"))}
                </label>
              </details>
              <Slider
                label={t(
                  L("Насыщенность клипа", "Clip saturation", "Клип қанықтығы"),
                )}
                value={cur.saturation ?? 100}
                min={0}
                max={200}
                disabled={disabled}
                onBegin={begin}
                onEnd={history.end}
                onChange={(n) => edit({ saturation: n }, true)}
              />
              <button
                disabled={disabled}
                onClick={() =>
                  apply({
                    ...value,
                    clips: value.clips.map((c) => ({
                      ...c,
                      brightness: cur.brightness,
                      contrast: cur.contrast,
                      saturation: cur.saturation,
                    })),
                  })
                }
              >
                {t(
                  L(
                    "Этот цвет — ко всем клипам",
                    "Apply color to all clips",
                    "Бұл түсті барлық клипке қолдану",
                  ),
                )}
              </button>
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
              {cur.keyframes?.length ? (
                <p className="media-muted">
                  {t(
                    L(
                      "Ключевые кадры задают масштаб, панораму, яркость и громкость. Изменяйте их в полях «Ключ».",
                      "Keyframes control zoom, pan, brightness and volume. Edit them in the Key fields.",
                      "Негізгі кадрлар масштаб, панорама, жарықтық пен дыбысты басқарады. Оларды Кілт өрістерінде өзгертіңіз.",
                    ),
                  )}
                </p>
              ) : null}
              <details
                className="media-wide"
                open={!!cur.keyframes?.length || undefined}
              >
                <summary>
                  {t(
                    L(
                      "Анимация · ключевые кадры",
                      "Animation · keyframes",
                      "Анимация · негізгі кадрлар",
                    ),
                  )}
                </summary>
                <div className="media-keyframe-row">
                  <button
                    disabled={
                      disabled ||
                      location?.clip.id !== cur.id ||
                      (cur.keyframes?.length ?? 0) >= 120
                    }
                    onClick={addKeyframe}
                  >
                    {t(
                      L(
                        "Добавить ключевой кадр",
                        "Add keyframe",
                        "Негізгі кадр қосу",
                      ),
                    )}{" "}
                    ◇
                  </button>
                </div>
                {!!cur.keyframes?.length && (
                  <label>
                    {t(L("Ключевой кадр", "Keyframe", "Негізгі кадр"))}
                    <select
                      aria-label={t(
                        L("Ключевой кадр", "Keyframe", "Негізгі кадр"),
                      )}
                      value={selectedKey?.id ?? ""}
                      onChange={(e) => chooseKey(e.target.value)}
                    >
                      <option value="" disabled>
                        —
                      </option>
                      {cur.keyframes.map((k) => (
                        <option value={k.id} key={k.id}>
                          {timecode(toSeconds(k.tick), value.fps ?? 30)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {selectedKey && (
                  <>
                    <label>
                      {t(L("Интерполяция", "Interpolation", "Интерполяция"))}
                      <select
                        aria-label={t(
                          L("Интерполяция", "Interpolation", "Интерполяция"),
                        )}
                        value={selectedKey.interpolation}
                        onChange={(e) =>
                          editKey({
                            interpolation: e.target
                              .value as VideoKeyframe["interpolation"],
                          })
                        }
                      >
                        <option value="smooth">
                          {t(L("Плавная", "Smooth", "Бірқалыпты"))}
                        </option>
                        <option value="linear">
                          {t(L("Линейная", "Linear", "Сызықтық"))}
                        </option>
                        <option value="hold">
                          {t(L("Удержание", "Hold", "Ұстап тұру"))}
                        </option>
                      </select>
                    </label>
                    {(
                      ["zoom", "panX", "panY", "brightness", "volume"] as const
                    ).map((field, i) => (
                      <PrecisionNumber
                        key={field}
                        label={t(
                          [
                            L("Ключ: масштаб", "Key: zoom", "Кілт: масштаб"),
                            L("Ключ: X", "Key: X", "Кілт: X"),
                            L("Ключ: Y", "Key: Y", "Кілт: Y"),
                            L(
                              "Ключ: яркость",
                              "Key: brightness",
                              "Кілт: жарықтық",
                            ),
                            L("Ключ: громкость", "Key: volume", "Кілт: дыбыс"),
                          ][i],
                        )}
                        value={selectedKey[field]}
                        min={
                          field === "zoom"
                            ? 1
                            : field === "panX" || field === "panY"
                              ? -1
                              : 0
                        }
                        max={
                          field === "zoom"
                            ? 3
                            : field === "brightness"
                              ? 200
                              : 1
                        }
                        step={field === "brightness" ? 1 : 0.01}
                        onBegin={begin}
                        onValue={(n) => editKey({ [field]: n }, true)}
                        onEnd={history.end}
                      />
                    ))}
                    <button
                      onClick={() => {
                        edit({
                          keyframes: cur.keyframes?.filter(
                            (k) => k.id !== selectedKey.id,
                          ),
                        });
                        setKeyId(null);
                      }}
                    >
                      {t(
                        L(
                          "Удалить ключевой кадр",
                          "Delete keyframe",
                          "Негізгі кадрды жою",
                        ),
                      )}
                    </button>
                  </>
                )}
              </details>
              <details className="media-wide">
                <summary>
                  {t(
                    L(
                      "Эквалайзер · 3 полосы",
                      "Equalizer · 3 bands",
                      "Эквалайзер · 3 жолақ",
                    ),
                  )}
                </summary>
                {(["low", "mid", "high"] as const).map((band, i) => (
                  <Slider
                    key={band}
                    label={t(
                      [
                        L("Низкие, dB", "Low, dB", "Төменгі, dB"),
                        L("Средние, dB", "Mid, dB", "Ортаңғы, dB"),
                        L("Высокие, dB", "High, dB", "Жоғарғы, dB"),
                      ][i],
                    )}
                    value={cur.audioEQ?.[band] ?? 0}
                    min={-12}
                    max={12}
                    step={0.5}
                    disabled={disabled}
                    onBegin={begin}
                    onEnd={history.end}
                    onChange={(n) =>
                      edit(
                        {
                          audioEQ: {
                            low: 0,
                            mid: 0,
                            high: 0,
                            ...cur.audioEQ,
                            [band]: n,
                          },
                        },
                        true,
                      )
                    }
                  />
                ))}
              </details>
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
          <details className="media-wide">
            <summary>
              {t(
                L(
                  "Контроль воспроизведения",
                  "Playback monitoring",
                  "Ойнатуды бақылау",
                ),
              )}
            </summary>
            <label>
              Peak{" "}
              <meter min={0} max={1} high={0.9} optimum={0.5} value={peak} />
            </label>
            <label>
              RMS <meter min={0} max={1} value={rms} />
            </label>
            <p className="media-muted">
              {t(L("Отрисовка кадра", "Frame rendering", "Кадрды көрсету"))}:{" "}
              {renderStats.mean.toFixed(1)} ms · p95{" "}
              {renderStats.p95.toFixed(1)} ms
            </p>
          </details>
          <h3>
            {t(L("Параметры проекта", "Project settings", "Жоба баптаулары"))}
          </h3>
          <label>
            {t(L("Формат кадра", "Aspect ratio", "Кадр пішімі"))}
            <select
              aria-label={t(L("Формат кадра", "Aspect ratio", "Кадр пішімі"))}
              value={value.aspect ?? "wide"}
              disabled={disabled}
              onChange={(e) =>
                apply({
                  ...value,
                  aspect: e.target.value as VideoDoc["aspect"],
                })
              }
            >
              <option value="wide">
                16:9 · {t(L("Горизонтальный", "Landscape", "Көлденең"))}
              </option>
              <option value="portrait">9:16 · Reels / Shorts</option>
              <option value="square">
                1:1 · {t(L("Квадрат", "Square", "Шаршы"))}
              </option>
            </select>
          </label>
          <label>
            {t(L("Частота кадров", "Frame rate", "Кадр жиілігі"))}
            <select
              aria-label={t(L("Частота кадров", "Frame rate", "Кадр жиілігі"))}
              value={value.fps ?? 30}
              disabled={disabled}
              onChange={(e) =>
                apply({ ...value, fps: +e.target.value as VideoDoc["fps"] })
              }
            >
              {[23.976, 24, 25, 29.97, 30, 59.94, 60].map((n) => (
                <option key={n} value={n}>
                  {n} fps
                </option>
              ))}
            </select>
          </label>
          <label className="media-check">
            <input
              type="checkbox"
              checked={frameSnap}
              onChange={(e) => setFrameSnap(e.target.checked)}
            />
            {t(L("Привязка к кадрам", "Snap to frames", "Кадрларға байлау"))}
          </label>
          <details className="media-wide">
            <summary>
              {t(
                L(
                  "Субтитры · SRT / VTT",
                  "Captions · SRT / VTT",
                  "Субтитр · SRT / VTT",
                ),
              )}
            </summary>
            <label className="media-file">
              {t(L("Импорт субтитров", "Import captions", "Субтитр импорттау"))}
              <input
                type="file"
                accept=".srt,.vtt,text/plain,text/vtt"
                disabled={disabled}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  try {
                    if (file.size > 200000) throw Error();
                    const next = parseCaptions(await file.text());
                    apply({ ...value, captions: next });
                    setCaptionId(next[0].id);
                  } catch {
                    setError(
                      t(
                        L(
                          "Субтитры не прочитаны. Нужен SRT/VTT: до 200 реплик, по 300 символов.",
                          "Cannot read captions. Use SRT/VTT: up to 200 cues, 300 characters each.",
                          "Субтитр оқылмады. SRT/VTT: 200 репликаға дейін, әрқайсысы 300 таңба.",
                        ),
                      ),
                    );
                  }
                }}
              />
            </label>
            <div className="media-two">
              <button
                disabled={
                  disabled || total <= 0 || (value.captions?.length ?? 0) >= 200
                }
                onClick={() => {
                  const cue = {
                    id: crypto.randomUUID(),
                    start: Math.min(playhead, Math.max(0, total - 0.1)),
                    end: Math.min(total, playhead + 3),
                    text: t(L("Новая реплика", "New caption", "Жаңа реплика")),
                  };
                  apply({
                    ...value,
                    captions: [...(value.captions ?? []), cue],
                  });
                  setCaptionId(cue.id);
                }}
              >
                {t(L("Добавить реплику", "Add caption", "Реплика қосу"))}
              </button>
              <button
                disabled={!value.captions?.length}
                onClick={() =>
                  download(
                    "captions.srt",
                    captionsToSrt(value.captions ?? []),
                    "text/plain",
                  )
                }
              >
                SRT ↓
              </button>
            </div>
            {!!value.captions?.length && (
              <label>
                {t(L("Выбрать реплику", "Choose caption", "Реплика таңдау"))}
                <select
                  aria-label={t(
                    L("Выбрать реплику", "Choose caption", "Реплика таңдау"),
                  )}
                  value={captionId ?? ""}
                  onChange={(e) => {
                    setCaptionId(e.target.value);
                    const c = value.captions?.find(
                      (c) => c.id === e.target.value,
                    );
                    if (c) seek(c.start);
                  }}
                >
                  <option value="" disabled>
                    —
                  </option>
                  {value.captions.map((c, i) => (
                    <option key={c.id} value={c.id}>
                      {i + 1}. {formatTime(c.start)} · {c.text.slice(0, 40)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {caption && (
              <>
                <label>
                  {t(L("Текст субтитра", "Caption text", "Субтитр мәтіні"))}
                  <textarea
                    maxLength={300}
                    aria-label={t(
                      L("Текст субтитра", "Caption text", "Субтитр мәтіні"),
                    )}
                    value={caption.text}
                    disabled={disabled}
                    onFocus={begin}
                    onBlur={history.end}
                    onChange={(e) =>
                      history.update({
                        ...value,
                        captions: value.captions?.map((c) =>
                          c.id === caption.id
                            ? { ...c, text: e.target.value || " " }
                            : c,
                        ),
                      })
                    }
                  />
                </label>
                <div className="media-two">
                  <label>
                    {t(
                      L(
                        "Начало субтитра, с",
                        "Caption start, seconds",
                        "Субтитр басы, с",
                      ),
                    )}
                    <input
                      type="number"
                      min={0}
                      max={caption.end - 0.01}
                      step={0.01}
                      value={caption.start}
                      onFocus={begin}
                      onBlur={history.end}
                      onChange={(e) =>
                        history.update({
                          ...value,
                          captions: value.captions?.map((c) =>
                            c.id === caption.id
                              ? {
                                  ...c,
                                  start: Math.max(
                                    0,
                                    Math.min(c.end - 0.01, +e.target.value),
                                  ),
                                }
                              : c,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    {t(
                      L(
                        "Конец субтитра, с",
                        "Caption end, seconds",
                        "Субтитр соңы, с",
                      ),
                    )}
                    <input
                      type="number"
                      min={caption.start + 0.01}
                      max={1000000}
                      step={0.01}
                      value={caption.end}
                      onFocus={begin}
                      onBlur={history.end}
                      onChange={(e) =>
                        history.update({
                          ...value,
                          captions: value.captions?.map((c) =>
                            c.id === caption.id
                              ? {
                                  ...c,
                                  end: Math.min(
                                    1000000,
                                    Math.max(c.start + 0.01, +e.target.value),
                                  ),
                                }
                              : c,
                          ),
                        })
                      }
                    />
                  </label>
                </div>
                <button
                  disabled={disabled}
                  onClick={() => {
                    apply({
                      ...value,
                      captions: value.captions?.filter(
                        (c) => c.id !== caption.id,
                      ),
                    });
                    setCaptionId(null);
                  }}
                >
                  {t(L("Удалить реплику", "Delete caption", "Репликаны жою"))}
                </button>
              </>
            )}
          </details>
          <label>
            {t(L("Разрешение", "Resolution", "Ажыратымдылық"))}
            <select
              aria-label={t(L("Разрешение", "Resolution", "Ажыратымдылық"))}
              value={value.width}
              disabled={disabled}
              onChange={(e) =>
                apply({ ...value, width: e.target.value as VideoDoc["width"] })
              }
            >
              <option value="1280">
                {videoDimensions(1280, value.aspect).width} ×{" "}
                {videoDimensions(1280, value.aspect).height}
              </option>
              <option value="720">
                {videoDimensions(720, value.aspect).width} ×{" "}
                {videoDimensions(720, value.aspect).height}
              </option>
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
