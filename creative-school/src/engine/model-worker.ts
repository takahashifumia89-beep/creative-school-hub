/// <reference lib="webworker" />
import {
  baseGeometryFor,
  parseOBJ,
  sceneForExport,
} from "../features/studio/model-geometry";
import type { Obj } from "../platform/model-schema";
import {
  evaluateModifiers,
  meshNormals,
  weldMesh,
  MeshModifierCache,
  type MeshBuffers,
} from "./mesh";
const cache = new MeshModifierCache();
self.onmessage = async ({ data }) => {
  const { id, kind } = data;
  try {
    if (kind === "evaluate" || kind === "bake") {
      const started = performance.now(),
        o = data.object as Obj;
      let source: MeshBuffers;
      if (o.kind === "mesh")
        source = { positions: data.positions, indices: data.indices };
      else {
        const g = baseGeometryFor(o),
          p = g.getAttribute("position"),
          ix = g.getIndex();
        source = {
          positions: Float32Array.from(p.array),
          indices: ix
            ? Uint32Array.from(ix.array)
            : Uint32Array.from({ length: p.count }, (_, i) => i),
          normals: Float32Array.from(g.getAttribute("normal").array),
        };
        g.dispose();
      }
      const bytes = new Uint8Array(
        source.positions.byteLength + source.indices.byteLength,
      );
      bytes.set(
        new Uint8Array(
          source.positions.buffer,
          source.positions.byteOffset,
          source.positions.byteLength,
        ),
      );
      bytes.set(
        new Uint8Array(
          source.indices.buffer,
          source.indices.byteOffset,
          source.indices.byteLength,
        ),
        source.positions.byteLength,
      );
      const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
        key = Array.from(hash, (b) => b.toString(16).padStart(2, "0")).join("");
      let evaluated = evaluateModifiers(source, o.modifiers, cache, key);
      if (kind === "bake") {
        evaluated = weldMesh(evaluated);
        if (
          evaluated.positions.length > 30000 ||
          evaluated.indices.length > 60000
        )
          throw Error("BAKE_BUDGET");
      }
      const positions = evaluated.positions.slice(),
        indices = evaluated.indices.slice(),
        normals = evaluated.normals?.slice() ?? meshNormals(evaluated);
      self.postMessage(
        {
          id,
          positions,
          indices,
          normals,
          ms: performance.now() - started,
          cacheBytes: cache.usage,
        },
        [positions.buffer, indices.buffer, normals.buffer],
      );
    } else if (kind === "parse") {
      const mesh = parseOBJ(data.source),
        positions = new Float32Array(mesh.vertices ?? []),
        indices = new Uint32Array(mesh.indices ?? []);
      self.postMessage({ id, positions, indices }, [
        positions.buffer,
        indices.buffer,
      ]);
    } else if (kind === "export") {
      const scene = sceneForExport(data.document);
      try {
        if (!scene.children.length) throw Error("EMPTY");
        if (data.format === "glb") {
          const { GLTFExporter } =
            await import("three/examples/jsm/exporters/GLTFExporter.js");
          const buffer = (await new GLTFExporter().parseAsync(scene, {
            binary: true,
          })) as ArrayBuffer;
          self.postMessage({ id, buffer }, [buffer]);
        } else {
          const { OBJExporter } =
            await import("three/examples/jsm/exporters/OBJExporter.js");
          self.postMessage({ id, text: new OBJExporter().parse(scene) });
        }
      } finally {
        scene.traverse((o: any) => {
          o.geometry?.dispose();
          if (Array.isArray(o.material))
            o.material.forEach((m: any) => m.dispose());
          else o.material?.dispose();
        });
      }
    } else if (kind === "dispose") {
      cache.clear();
      self.postMessage({ id });
    } else throw Error("MODEL_JOB");
  } catch (e) {
    self.postMessage({
      id,
      error: e instanceof Error ? e.message : "MODEL_WORKER",
    });
  }
};
