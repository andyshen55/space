"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import { DoubleSide } from "three";
import { cn } from "@/lib/utils";
import {
  GRAPHS,
  vertexPositions,
  edgePolyline,
  edgeWrapsHole,
  crossingCount,
  surfaceChi,
  SPHERE_R,
  TORUS_R,
  TORUS_r,
  type GraphKey,
  type SurfaceKey,
} from "./geometry";

const SURFACES: { key: SurfaceKey; label: string }[] = [
  { key: "plane", label: "Plane" },
  { key: "sphere", label: "Sphere" },
  { key: "torus", label: "Torus" },
];

const VERTEX_A = "#ef4444"; // K₃,₃ part A / (K₅ uses VERTEX_A throughout)
const VERTEX_B = "#3b82f6"; // K₃,₃ part B
const EDGE = "#6366f1"; // ordinary edge
const EDGE_HOLE = "#f59e0b"; // edge that winds through the torus hole

function Scene({ graph, surface }: { graph: GraphKey; surface: SurfaceKey }) {
  const g = GRAPHS[graph];
  const verts = useMemo(() => vertexPositions(g, surface), [g, surface]);
  const edges = useMemo(
    () =>
      g.edges.map((e) => ({
        points: edgePolyline(g, e, surface),
        hole: surface === "torus" && edgeWrapsHole(e),
      })),
    [g, surface]
  );
  const isA = (v: number) => g.partA?.includes(v) ?? true;

  // The torus's hole-axis is z; viewed straight down it, wrapping edges project
  // on top of each other and look like crossings. Tilt it to a 3/4 view so the
  // over/under separation is obvious. Plane stays face-on; sphere is symmetric.
  const tilt: [number, number, number] = surface === "torus" ? [-0.95, 0, 0] : [0, 0, 0];

  return (
    <>
      <group rotation={tilt}>
        {/* the surface: translucent and non-occluding so back edges show through */}
        {surface === "plane" && (
          <mesh>
            <circleGeometry args={[2.4, 64]} />
            <meshBasicMaterial color="#94a3b8" transparent opacity={0.08} side={DoubleSide} depthWrite={false} />
          </mesh>
        )}
        {surface === "sphere" && (
          <mesh>
            <sphereGeometry args={[SPHERE_R, 48, 32]} />
            <meshBasicMaterial color="#94a3b8" transparent opacity={0.12} depthWrite={false} />
          </mesh>
        )}
        {surface === "torus" && (
          <mesh>
            <torusGeometry args={[TORUS_R, TORUS_r, 28, 80]} />
            <meshBasicMaterial color="#94a3b8" transparent opacity={0.13} depthWrite={false} />
          </mesh>
        )}

        {edges.map((e, i) => (
          <Line
            key={i}
            points={e.points}
            color={e.hole ? EDGE_HOLE : EDGE}
            lineWidth={e.hole ? 3.5 : 2.5}
          />
        ))}

        {verts.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.075, 18, 18]} />
            <meshBasicMaterial color={isA(i) ? VERTEX_A : VERTEX_B} />
          </mesh>
        ))}
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom
        autoRotate={surface === "torus"}
        autoRotateSpeed={0.65}
        minDistance={2.6}
        maxDistance={8}
      />
    </>
  );
}

function Toggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            value === o.key ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function GraphsOnSurfacesDemo() {
  const [graph, setGraph] = useState<GraphKey>("k33");
  const [surface, setSurface] = useState<SurfaceKey>("plane");

  const g = GRAPHS[graph];
  const crossings = useMemo(() => crossingCount(g, surface), [g, surface]);
  const chi = surfaceChi[surface];
  const E = g.edges.length;
  const embeds = crossings === 0;
  const faces = embeds ? chi - g.n + E : null; // V − E + F = χ ⟹ F = χ − V + E

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Toggle
          ariaLabel="Choose graph"
          options={[
            { key: "k33", label: "K₃,₃" },
            { key: "k5", label: "K₅" },
          ]}
          value={graph}
          onChange={setGraph}
        />
        <Toggle ariaLabel="Choose surface" options={SURFACES} value={surface} onChange={setSurface} />
      </div>

      <div className="h-[400px] w-full overflow-hidden rounded-xl bg-gradient-to-b from-muted/20 to-transparent sm:h-[440px]">
        <Canvas camera={{ position: [0.4, 1.1, 4.4], fov: 45 }} gl={{ alpha: true }}>
          {/* remount the scene on graph/surface change so geometry is rebuilt cleanly */}
          <Scene key={`${graph}-${surface}`} graph={graph} surface={surface} />
        </Canvas>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Drag to rotate · scroll to zoom. {g.name}: {g.n} vertices, {E} edges.
      </p>

      <div className="flex w-full max-w-md flex-wrap items-stretch justify-center gap-3">
        <div className="flex min-w-[7rem] flex-1 flex-col items-center rounded-xl border border-border bg-muted/30 px-4 py-3">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Crossings</span>
          <span
            className={cn(
              "text-2xl font-bold tabular-nums",
              embeds ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}
          >
            {crossings}
          </span>
        </div>
        <div className="flex min-w-[7rem] flex-1 flex-col items-center rounded-xl border border-border bg-muted/30 px-4 py-3">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">χ = V − E + F</span>
          <span className="text-2xl font-bold tabular-nums">{chi}</span>
        </div>
      </div>

      <p className="min-h-[3rem] max-w-prose text-center text-sm text-muted-foreground" aria-live="polite">
        {surface === "plane" &&
          `On the plane, ${g.name} can't avoid crossings — and the plane is just the sphere with one point (the “north pole”) removed.`}
        {surface === "sphere" &&
          `Stereographic projection wraps the plane onto the sphere: the same drawing, the same ${crossings} crossings. Sphere and plane are the same for graph-drawing (χ = 2).`}
        {surface === "torus" && embeds &&
          `Zero crossings. The amber edges wind through the hole, giving every edge room — so ${g.name} embeds on the torus (χ = 0), with V − E + F = ${chi} and ${faces} faces.`}
        {surface === "torus" && !embeds &&
          `${crossings} crossings — try nudging the layout; ${g.name} is known to embed on the torus with none.`}
      </p>
    </div>
  );
}
