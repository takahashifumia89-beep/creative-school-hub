import { WorkerRpc } from "./worker-rpc";
import type { Obj, SceneDoc } from "../platform/model-schema";
import type { MeshBuffers } from "./mesh";
export type EvaluatedMesh = MeshBuffers & { ms: number; cacheBytes: number };
type Pending = { run: (() => void) | null; cancel: (() => void) | null };
export class ModelEngine {
  private readonly rpc = new WorkerRpc(
    new Worker(new URL("./model-worker.ts", import.meta.url), {
      type: "module",
    }),
  );
  private readonly jobs = new Map<string, Pending>();
  private disposed = false;
  evaluate(o: Obj, bake = false): Promise<EvaluatedMesh> {
    if (this.disposed) return Promise.reject(Error("WORKER_DISPOSED"));
    return new Promise((resolve, reject) => {
      const run = () => {
        const { vertices, indices, ...object } = o,
          positions = new Float32Array(vertices ?? []),
          ix = new Uint32Array(indices ?? []);
        this.rpc
          .request<EvaluatedMesh>(
            {
              kind: bake ? "bake" : "evaluate",
              object,
              positions,
              indices: ix,
            },
            [positions.buffer, ix.buffer],
          )
          .then(resolve, reject)
          .finally(() => {
            if (bake) return;
            const state = this.jobs.get(o.id),
              next = state?.run;
            if (state) {
              state.run = null;
              state.cancel = null;
            }
            if (next) next();
            else this.jobs.delete(o.id);
          });
      };
      if (bake) {
        run();
        return;
      }
      const state = this.jobs.get(o.id);
      if (state) {
        state.cancel?.();
        state.run = run;
        state.cancel = () => reject(Error("SUPERSEDED"));
      } else {
        this.jobs.set(o.id, { run: null, cancel: null });
        run();
      }
    });
  }
  parse(source: string) {
    return this.rpc.request<MeshBuffers>({ kind: "parse", source });
  }
  export(document: SceneDoc, format: "glb" | "obj") {
    return this.rpc.request<{ buffer?: ArrayBuffer; text?: string }>({
      kind: "export",
      document,
      format,
    });
  }
  dispose() {
    this.disposed = true;
    for (const state of this.jobs.values()) state.cancel?.();
    this.jobs.clear();
    void this.rpc
      .request({ kind: "dispose" })
      .catch(() => undefined)
      .finally(() => this.rpc.dispose());
  }
}
