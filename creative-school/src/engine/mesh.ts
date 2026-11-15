import type { ModelModifier } from "../platform/model-schema";
export type MeshBuffers = {
  positions: Float32Array;
  indices: Uint32Array;
  normals?: Float32Array;
};
const MAX_VERTICES = 100_000,
  MAX_INDICES = 600_000;
function budget(vertices: number, indices: number) {
  if (
    vertices > MAX_VERTICES ||
    indices > MAX_INDICES ||
    !Number.isSafeInteger(vertices) ||
    !Number.isSafeInteger(indices)
  )
    throw Error("MESH_BUDGET");
}
/** Packed half-edge topology: origin, next, twin and face lookups are O(1). */
export class HalfEdgeMesh {
  readonly origin: Uint32Array;
  readonly next: Uint32Array;
  readonly twin: Int32Array;
  readonly face: Uint32Array;
  readonly vertexEdge: Int32Array;
  readonly neighborStart: Uint32Array;
  readonly neighbors: Uint32Array;
  readonly boundary: Uint8Array;
  readonly boundaryNeighbors: Int32Array;
  readonly nonManifold: boolean;
  constructor(readonly mesh: MeshBuffers) {
    const vertices = mesh.positions.length / 3,
      n = mesh.indices.length;
    if (!Number.isInteger(vertices) || n % 3 || vertices < 3 || n < 3)
      throw Error("MESH_TOPOLOGY");
    budget(vertices, n);
    this.origin = mesh.indices;
    this.next = new Uint32Array(n);
    this.twin = new Int32Array(n).fill(-1);
    this.face = new Uint32Array(n);
    this.vertexEdge = new Int32Array(vertices).fill(-1);
    this.boundary = new Uint8Array(vertices);
    const directed = new Map<number, number>(),
      unique = new Map<number, number>();
    let nonManifold = false;
    for (let e = 0; e < n; e++) {
      const a = mesh.indices[e],
        b = mesh.indices[e - (e % 3) + ((e + 1) % 3)];
      if (a >= vertices || b >= vertices || a === b)
        throw Error("MESH_TOPOLOGY");
      this.next[e] = e - (e % 3) + ((e + 1) % 3);
      this.face[e] = Math.floor(e / 3);
      this.vertexEdge[a] = e;
      const key = a * vertices + b,
        reverse = b * vertices + a;
      if (directed.has(key)) nonManifold = true;
      const other = directed.get(reverse);
      if (other !== undefined) {
        if (this.twin[other] !== -1) nonManifold = true;
        this.twin[e] = other;
        this.twin[other] = e;
      }
      directed.set(key, e);
      unique.set(Math.min(a, b) * vertices + Math.max(a, b), e);
    }
    this.boundaryNeighbors = new Int32Array(vertices * 2).fill(-1);
    const degree = new Uint32Array(vertices);
    for (const e of unique.values()) {
      degree[this.origin[e]]++;
      degree[this.origin[this.next[e]]]++;
    }
    this.neighborStart = new Uint32Array(vertices + 1);
    for (let i = 0; i < vertices; i++)
      this.neighborStart[i + 1] = this.neighborStart[i] + degree[i];
    this.neighbors = new Uint32Array(this.neighborStart[vertices]);
    const cursor = this.neighborStart.slice(0, vertices);
    for (const e of unique.values()) {
      const a = this.origin[e],
        b = this.origin[this.next[e]];
      this.neighbors[cursor[a]++] = b;
      this.neighbors[cursor[b]++] = a;
    }
    for (let e = 0; e < n; e++)
      if (this.twin[e] === -1) {
        const a = this.origin[e],
          b = this.origin[this.next[e]];
        this.boundary[a] = 1;
        this.boundary[b] = 1;
        for (let side = 0; side < 2; side++) {
          const v = side ? a : b,
            neighbor = side ? b : a,
            at = v * 2;
          if (this.boundaryNeighbors[at] === -1)
            this.boundaryNeighbors[at] = neighbor;
          else if (this.boundaryNeighbors[at + 1] === -1)
            this.boundaryNeighbors[at + 1] = neighbor;
          else nonManifold = true;
        }
      }
    this.nonManifold = nonManifold;
  }
}
export function meshNormals(mesh: MeshBuffers) {
  const normals = new Float32Array(mesh.positions.length),
    p = mesh.positions,
    ix = mesh.indices;
  for (let i = 0; i < ix.length; i += 3) {
    const a = ix[i] * 3,
      b = ix[i + 1] * 3,
      c = ix[i + 2] * 3,
      abx = p[b] - p[a],
      aby = p[b + 1] - p[a + 1],
      abz = p[b + 2] - p[a + 2],
      acx = p[c] - p[a],
      acy = p[c + 1] - p[a + 1],
      acz = p[c + 2] - p[a + 2],
      x = aby * acz - abz * acy,
      y = abz * acx - abx * acz,
      z = abx * acy - aby * acx;
    normals[a] += x;
    normals[a + 1] += y;
    normals[a + 2] += z;
    normals[b] += x;
    normals[b + 1] += y;
    normals[b + 2] += z;
    normals[c] += x;
    normals[c + 1] += y;
    normals[c + 2] += z;
  }
  for (let i = 0; i < normals.length; i += 3) {
    const d = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
    normals[i] /= d;
    normals[i + 1] /= d;
    normals[i + 2] /= d;
  }
  return normals;
}
function subdivide(mesh: MeshBuffers, smooth: boolean): MeshBuffers {
  const h = new HalfEdgeMesh(mesh);
  if (h.nonManifold) throw Error("MESH_NON_MANIFOLD");
  const p = mesh.positions,
    ix = mesh.indices,
    v = p.length / 3,
    edges = new Int32Array(ix.length).fill(-1);
  let next = v;
  for (let e = 0; e < ix.length; e++)
    if (edges[e] === -1) {
      edges[e] = next;
      if (h.twin[e] !== -1) edges[h.twin[e]] = next;
      next++;
    }
  budget(next, ix.length * 4);
  const positions = new Float32Array(next * 3),
    indices = new Uint32Array(ix.length * 4);
  positions.set(p);
  if (smooth)
    for (let a = 0; a < v; a++) {
      const start = h.neighborStart[a],
        end = h.neighborStart[a + 1],
        degree = end - start;
      if (h.boundary[a]) {
        const b = h.boundaryNeighbors[a * 2],
          c = h.boundaryNeighbors[a * 2 + 1];
        if (b >= 0 && c >= 0)
          for (let axis = 0; axis < 3; axis++)
            positions[a * 3 + axis] =
              0.75 * p[a * 3 + axis] +
              0.125 * (p[b * 3 + axis] + p[c * 3 + axis]);
      } else if (degree) {
        const beta = degree === 3 ? 3 / 16 : 3 / (8 * degree);
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let j = start; j < end; j++) sum += p[h.neighbors[j] * 3 + c];
          positions[a * 3 + c] =
            (1 - degree * beta) * p[a * 3 + c] + beta * sum;
        }
      }
    }
  for (let e = 0; e < ix.length; e++) {
    if (h.twin[e] !== -1 && h.twin[e] < e) continue;
    const a = h.origin[e],
      b = h.origin[h.next[e]],
      target = edges[e] * 3,
      twin = h.twin[e];
    for (let c = 0; c < 3; c++)
      positions[target + c] =
        smooth && twin !== -1
          ? 0.375 * (p[a * 3 + c] + p[b * 3 + c]) +
            0.125 *
              (p[h.origin[h.next[h.next[e]]] * 3 + c] +
                p[h.origin[h.next[h.next[twin]]] * 3 + c])
          : 0.5 * (p[a * 3 + c] + p[b * 3 + c]);
  }
  let at = 0;
  for (let e = 0; e < ix.length; e += 3) {
    const a = ix[e],
      b = ix[e + 1],
      c = ix[e + 2],
      ab = edges[e],
      bc = edges[e + 1],
      ca = edges[e + 2];
    indices.set([a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca], at);
    at += 12;
  }
  return { positions, indices };
}
export function weldMesh(mesh: MeshBuffers): MeshBuffers {
  const map = new Map<string, number>(),
    remap = new Uint32Array(mesh.positions.length / 3),
    vertices = new Float32Array(mesh.positions.length);
  let count = 0;
  for (let i = 0; i < remap.length; i++) {
    const at = i * 3,
      key =
        Math.round(mesh.positions[at] * 1e6) +
        "," +
        Math.round(mesh.positions[at + 1] * 1e6) +
        "," +
        Math.round(mesh.positions[at + 2] * 1e6);
    let index = map.get(key);
    if (index === undefined) {
      index = count++;
      map.set(key, index);
      vertices[index * 3] = mesh.positions[at];
      vertices[index * 3 + 1] = mesh.positions[at + 1];
      vertices[index * 3 + 2] = mesh.positions[at + 2];
    }
    remap[i] = index;
  }
  const indices = new Uint32Array(mesh.indices.length);
  let n = 0;
  for (let i = 0; i < mesh.indices.length; i += 3) {
    const a = remap[mesh.indices[i]],
      b = remap[mesh.indices[i + 1]],
      c = remap[mesh.indices[i + 2]];
    if (a === b || b === c || c === a) continue;
    indices[n++] = a;
    indices[n++] = b;
    indices[n++] = c;
  }
  return {
    positions: vertices.slice(0, count * 3),
    indices: indices.slice(0, n),
  };
}
export function applyModifier(
  mesh: MeshBuffers,
  m: ModelModifier,
): MeshBuffers {
  if (!m.enabled) return mesh;
  const count = mesh.positions.length / 3,
    source = mesh.positions,
    ix = mesh.indices;
  if (m.type === "subdivide") {
    let result = weldMesh(mesh);
    for (let i = 0; i < m.levels; i++) result = subdivide(result, m.smooth);
    return result;
  }
  if (m.type === "twist") {
    const p = source.slice(),
      axis = m.axis === "x" ? 0 : m.axis === "y" ? 1 : 2,
      a = (axis + 1) % 3,
      b = (axis + 2) % 3;
    let min = Infinity,
      max = -Infinity;
    for (let i = axis; i < p.length; i += 3) {
      min = Math.min(min, p[i]);
      max = Math.max(max, p[i]);
    }
    const span = max - min || 1;
    for (let i = 0; i < p.length; i += 3) {
      const angle =
          (((p[i + axis] - (min + max) / 2) / span) * m.angle * Math.PI) / 180,
        c = Math.cos(angle),
        s = Math.sin(angle),
        x = p[i + a],
        y = p[i + b];
      p[i + a] = c * x - s * y;
      p[i + b] = s * x + c * y;
    }
    return { positions: p, indices: ix };
  }
  const copies = m.type === "mirror" ? 2 : m.count;
  budget(count * copies, ix.length * copies);
  const positions = new Float32Array(source.length * copies),
    indices = new Uint32Array(ix.length * copies);
  positions.set(source);
  indices.set(ix);
  for (let k = 1; k < copies; k++) {
    for (let i = 0; i < source.length; i += 3)
      for (let a = 0; a < 3; a++)
        positions[k * source.length + i + a] =
          m.type === "mirror"
            ? a === (m.axis === "x" ? 0 : m.axis === "y" ? 1 : 2)
              ? 2 * m.offset - source[i + a]
              : source[i + a]
            : source[i + a] + m.offset[a] * k;
    for (let i = 0; i < ix.length; i += 3) {
      const at = k * ix.length + i,
        base = k * count;
      indices[at] = base + ix[i];
      indices[at + 1] = base + ix[i + (m.type === "mirror" ? 2 : 1)];
      indices[at + 2] = base + ix[i + (m.type === "mirror" ? 1 : 2)];
    }
  }
  return { positions, indices };
}
export class MeshModifierCache {
  private values = new Map<string, MeshBuffers>();
  private bytes = 0;
  constructor(private readonly limit = 32 * 1048576) {}
  get(key: string) {
    const mesh = this.values.get(key);
    if (mesh) {
      this.values.delete(key);
      this.values.set(key, mesh);
    }
    return mesh;
  }
  set(key: string, mesh: MeshBuffers) {
    const bytes = mesh.positions.byteLength + mesh.indices.byteLength;
    if (bytes > this.limit) return;
    const old = this.values.get(key);
    if (old) {
      this.bytes -= old.positions.byteLength + old.indices.byteLength;
      this.values.delete(key);
    }
    while (this.bytes + bytes > this.limit && this.values.size) {
      const first = this.values.keys().next().value!;
      const value = this.values.get(first)!;
      this.bytes -= value.positions.byteLength + value.indices.byteLength;
      this.values.delete(first);
    }
    this.values.set(key, mesh);
    this.bytes += bytes;
  }
  clear() {
    this.values.clear();
    this.bytes = 0;
  }
  get usage() {
    return this.bytes;
  }
}
export function evaluateModifiers(
  source: MeshBuffers,
  modifiers: readonly ModelModifier[] = [],
  cache?: MeshModifierCache,
  sourceKey = "",
): MeshBuffers {
  let result = source,
    key = sourceKey;
  for (const modifier of modifiers) {
    if (!modifier.enabled) continue;
    key += "/" + JSON.stringify(modifier);
    const existing = cache?.get(key);
    if (existing) result = existing;
    else {
      result = applyModifier(result, modifier);
      cache?.set(key, result);
    }
  }
  return result;
}
