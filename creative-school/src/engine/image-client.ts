import { WorkerRpc } from "./worker-rpc";
import type { ImageSettings } from "../platform/media-image";
import type { ColorSettings } from "./image-color";
export type ImageFrame = {
  bitmap: ImageBitmap;
  histogram: Uint32Array;
  width: number;
  height: number;
  ms: number;
  renderer: string;
};
export class ImageEngine {
  private readonly rpc = new WorkerRpc(
    new Worker(new URL("./image-worker.ts", import.meta.url), {
      type: "module",
    }),
  );
  private generation = 0;
  private previewing = false;
  private next: (() => void) | null = null;
  private cancelNext: (() => void) | null = null;
  load(blob: Blob) {
    this.generation++;
    return this.rpc.request<{ width: number; height: number }>({
      kind: "load",
      blob,
    });
  }
  preview(
    settings: ImageSettings & ColorSettings,
    compare: boolean,
    ignoreCrop: boolean,
  ): Promise<ImageFrame> {
    const generation = this.generation;
    return new Promise((resolve, reject) => {
      const run = () => {
        this.previewing = true;
        this.rpc
          .request<ImageFrame>({
            kind: "preview",
            settings,
            compare,
            ignoreCrop,
          })
          .then((frame) => {
            if (generation !== this.generation) {
              frame.bitmap.close();
              reject(Error("SUPERSEDED"));
            } else resolve(frame);
          }, reject)
          .finally(() => {
            this.previewing = false;
            const next = this.next;
            this.next = null;
            this.cancelNext = null;
            next?.();
          });
      };
      if (this.previewing) {
        this.cancelNext?.();
        this.next = run;
        this.cancelNext = () => reject(Error("SUPERSEDED"));
      } else run();
    });
  }
  export(
    settings: ImageSettings & ColorSettings,
    format: string,
    quality: number,
  ) {
    return this.rpc.request<{
      blob: Blob;
      width: number;
      height: number;
      ms: number;
      renderer: string;
    }>({ kind: "export", settings, format, quality });
  }
  dispose() {
    this.generation++;
    this.cancelNext?.();
    this.next = null;
    void this.rpc
      .request({ kind: "dispose" })
      .catch(() => undefined)
      .finally(() => this.rpc.dispose());
  }
}
