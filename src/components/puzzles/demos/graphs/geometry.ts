// Geometry + crossing math for the "Graph Theory on Surfaces" demo. Pure TS (no
// three import) so it stays testable and SSR-safe; the React component turns the
// returned tuples into three.js objects.
//
// The story: K₅ and K₃,₃ can't be drawn without crossings on the plane (≅ the
// sphere), but *can* on the torus. We draw the same graph on three surfaces and
// count crossings exactly, so the readout is honest.

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type SurfaceKey = "plane" | "sphere" | "torus";
export type GraphKey = "k5" | "k33";

export interface EdgeRoute {
  i: number;
  j: number;
  // Torus winding applied to the SECOND endpoint's (u, v): the drawn lift goes
  // from uv[i] to uv[j] + (m, n). Lets an edge wrap around the major circle (m)
  // or through the doughnut hole (n).
  wind: Vec2;
}

export interface GraphDef {
  key: GraphKey;
  name: string;
  n: number;
  // Bipartition (for coloring); undefined for K₅.
  partA?: number[];
  // Plane layout in 2D (also the sphere layout, via stereographic projection).
  plane2D: Vec2[];
  // Torus layout in the unit square [0,1)², plus per-edge windings.
  torusUV: Vec2[];
  edges: EdgeRoute[];
}

// ── Display constants ────────────────────────────────────────────────────────
export const SPHERE_R = 1.55;
export const TORUS_R = 1.35; // major radius
export const TORUS_r = 0.5; // tube radius
const PLANE_SCALE = 1.35;
const SAMPLES = 28; // points per edge polyline

// ── Surface maps ─────────────────────────────────────────────────────────────

// Inverse stereographic projection from the north pole: the whole plane wraps
// onto the unit sphere (minus the pole). It's a homeomorphism, so it preserves
// edge crossings exactly — which is precisely why "the plane and the sphere are
// the same for graph drawing."
function invStereo([x, y]: Vec2): Vec3 {
  const s = x * x + y * y;
  const k = 1 / (s + 1);
  return [2 * x * k * SPHERE_R, 2 * y * k * SPHERE_R, ((s - 1) * k) * SPHERE_R];
}

function torusPoint(u: number, v: number, lift = 0.035): Vec3 {
  const theta = 2 * Math.PI * u;
  const phi = 2 * Math.PI * v;
  const cp = Math.cos(phi);
  const nx = cp * Math.cos(theta);
  const ny = cp * Math.sin(theta);
  const nz = Math.sin(phi);
  const ring = TORUS_R + TORUS_r * cp;
  return [
    ring * Math.cos(theta) + lift * nx,
    ring * Math.sin(theta) + lift * ny,
    TORUS_r * nz + lift * nz,
  ];
}

// ── Per-vertex 3D positions on a given surface ───────────────────────────────
export function vertexPositions(g: GraphDef, surface: SurfaceKey): Vec3[] {
  if (surface === "sphere") return g.plane2D.map(invStereo);
  if (surface === "torus") return g.torusUV.map(([u, v]) => torusPoint(u, v, 0));
  return g.plane2D.map(([x, y]) => [x * PLANE_SCALE, y * PLANE_SCALE, 0]);
}

// ── Per-edge polylines (the drawn curve, following the surface) ──────────────
export function edgePolyline(g: GraphDef, e: EdgeRoute, surface: SurfaceKey): Vec3[] {
  const out: Vec3[] = [];
  if (surface === "torus") {
    const [ui, vi] = g.torusUV[e.i];
    const [uj, vj] = g.torusUV[e.j];
    const du = uj + e.wind[0] - ui;
    const dv = vj + e.wind[1] - vi;
    for (let k = 0; k <= SAMPLES; k++) {
      const t = k / SAMPLES;
      out.push(torusPoint(ui + t * du, vi + t * dv));
    }
    return out;
  }
  // plane & sphere: straight 2D segment, then mapped to the surface.
  const [xi, yi] = g.plane2D[e.i];
  const [xj, yj] = g.plane2D[e.j];
  for (let k = 0; k <= SAMPLES; k++) {
    const t = k / SAMPLES;
    const p: Vec2 = [xi + t * (xj - xi), yi + t * (yj - yi)];
    out.push(
      surface === "sphere" ? invStereo(p) : [p[0] * PLANE_SCALE, p[1] * PLANE_SCALE, 0]
    );
  }
  return out;
}

// An edge "uses the hole" on the torus iff it winds through the tube (Δv ≠ 0) —
// these are the edges that dissolve the planar crossings, so we highlight them.
export const edgeWrapsHole = (e: EdgeRoute): boolean => e.wind[1] !== 0;

// ── Crossing detection ───────────────────────────────────────────────────────

// Strict orientation sign of (a, b, c): >0 ccw, <0 cw, 0 collinear.
const orient = (a: Vec2, b: Vec2, c: Vec2): number =>
  (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

// Do segments ab and cd cross at a point strictly interior to BOTH? (Endpoint
// touches and collinear overlaps return false — so edges meeting at a shared
// vertex never count.)
function properCross(a: Vec2, b: Vec2, c: Vec2, d: Vec2): boolean {
  const o1 = orient(a, b, c);
  const o2 = orient(a, b, d);
  const o3 = orient(c, d, a);
  const o4 = orient(c, d, b);
  return o1 * o2 < 0 && o3 * o4 < 0;
}

// Crossings on the plane (and, identically, the sphere — stereographic preserves
// them): every edge is one straight 2D chord.
function planeCrossings(g: GraphDef): number {
  let count = 0;
  for (let a = 0; a < g.edges.length; a++)
    for (let b = a + 1; b < g.edges.length; b++) {
      const e = g.edges[a];
      const f = g.edges[b];
      if (
        properCross(
          g.plane2D[e.i],
          g.plane2D[e.j],
          g.plane2D[f.i],
          g.plane2D[f.j]
        )
      )
        count++;
    }
  return count;
}

// Crossings on the torus: each edge is a segment in the universal cover ℝ²
// (using its winding); two torus edges cross iff some integer translate of one
// segment properly intersects the other. Segments are short (< 1 in each
// coordinate), so translates in {-1,0,1}² suffice, and each torus crossing is
// counted exactly once (by the unique translate that realizes it).
function torusCrossings(g: GraphDef): number {
  const lift = (e: EdgeRoute): [Vec2, Vec2] => {
    const p = g.torusUV[e.i];
    const q: Vec2 = [g.torusUV[e.j][0] + e.wind[0], g.torusUV[e.j][1] + e.wind[1]];
    return [p, q];
  };
  let count = 0;
  for (let a = 0; a < g.edges.length; a++)
    for (let b = a + 1; b < g.edges.length; b++) {
      const [p1, q1] = lift(g.edges[a]);
      const [p2, q2] = lift(g.edges[b]);
      for (let m = -1; m <= 1; m++)
        for (let n = -1; n <= 1; n++) {
          const c: Vec2 = [p2[0] + m, p2[1] + n];
          const d: Vec2 = [q2[0] + m, q2[1] + n];
          if (properCross(p1, q1, c, d)) count++;
        }
    }
  return count;
}

export function crossingCount(g: GraphDef, surface: SurfaceKey): number {
  return surface === "torus" ? torusCrossings(g) : planeCrossings(g);
}

// Euler characteristic of each surface (plane treated as its one-point
// compactification, the sphere).
export const surfaceChi: Record<SurfaceKey, number> = {
  plane: 2,
  sphere: 2,
  torus: 0,
};

// ── Graph definitions ────────────────────────────────────────────────────────

// Helper: a slightly irregular convex polygon layout (so a complete graph's
// diagonals cross at distinct, visible points rather than one degenerate point).
function polygon(n: number, radii: number[], offsetDeg: number, skewDeg: number[]): Vec2[] {
  return Array.from({ length: n }, (_, k) => {
    const deg = offsetDeg + (360 / n) * k + (skewDeg[k] ?? 0);
    const a = (deg * Math.PI) / 180;
    return [radii[k] * Math.cos(a), radii[k] * Math.sin(a)] as Vec2;
  });
}

// K₅ = the circulant C₅(1,2): vertex k joins k±1 (the rim, a 5-cycle) and k±2
// (the "skip" edges). On the torus the rim runs along the outer equator (v = 0)
// and every skip edge winds once through the hole (Δv = +1), so the skip edges
// are mutually parallel in the cover — hence crossing-free. On the plane the
// skip edges form the iconic pentagram (5 crossings).
const K5: GraphDef = {
  key: "k5",
  name: "K₅",
  n: 5,
  plane2D: polygon(5, [1.25, 1.25, 1.25, 1.25, 1.25], 90, [0, 0, 0, 0, 0]),
  torusUV: Array.from({ length: 5 }, (_, k) => [k / 5, 0] as Vec2),
  edges: [
    // rim (k, k+1)
    { i: 0, j: 1, wind: [0, 0] },
    { i: 1, j: 2, wind: [0, 0] },
    { i: 2, j: 3, wind: [0, 0] },
    { i: 3, j: 4, wind: [0, 0] },
    { i: 4, j: 0, wind: [1, 0] },
    // skips (k, k+2) — all wind through the hole, all parallel: Δ(u,v)=(0.4, 1)
    { i: 0, j: 2, wind: [0, 1] },
    { i: 1, j: 3, wind: [0, 1] },
    { i: 2, j: 4, wind: [0, 1] },
    { i: 3, j: 0, wind: [1, 1] },
    { i: 4, j: 1, wind: [1, 1] },
  ],
};

// K₃,₃ = the circulant C₆(1,3): the rim (k, k+1) is a 6-cycle alternating
// between the two parts; the three "diameters" (k, k+3) join opposite vertices.
// On the plane the diameters cross; on the torus each diameter winds through the
// hole (Δv = +1) — again mutually parallel, so crossing-free.
const K33: GraphDef = {
  key: "k33",
  name: "K₃,₃",
  n: 6,
  partA: [0, 2, 4],
  plane2D: polygon(
    6,
    [1.2, 1.05, 1.2, 1.05, 1.2, 1.05],
    90,
    [0, 8, -8, 0, 8, -8] // skew so the three diameters don't all meet at the centre
  ),
  torusUV: Array.from({ length: 6 }, (_, k) => [k / 6, 0] as Vec2),
  edges: [
    // rim 6-cycle (alternates A/B)
    { i: 0, j: 1, wind: [0, 0] },
    { i: 1, j: 2, wind: [0, 0] },
    { i: 2, j: 3, wind: [0, 0] },
    { i: 3, j: 4, wind: [0, 0] },
    { i: 4, j: 5, wind: [0, 0] },
    { i: 5, j: 0, wind: [1, 0] },
    // diameters (k, k+3) — wind through the hole, all parallel: Δ(u,v)=(0.5, 1)
    { i: 0, j: 3, wind: [0, 1] },
    { i: 2, j: 5, wind: [0, 1] },
    { i: 4, j: 1, wind: [1, 1] },
  ],
};

export const GRAPHS: Record<GraphKey, GraphDef> = { k5: K5, k33: K33 };
