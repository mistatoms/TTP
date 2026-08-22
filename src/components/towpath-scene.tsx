import { useParrotStore } from "@/lib/parrot/store";
import type { SceneContext } from "@/lib/vision/types";

export function TowpathScene({ scene }: { scene: SceneContext | null }) {
  const part = scene?.dayPart ?? "evening";
  const empty = !scene || scene.id === "empty";
  const people = empty ? 0 : Math.max(1, scene.peopleCount);
  const jogging = scene?.activity === "running" || scene?.activity === "brisk";
  const sky =
    part === "night"
      ? ["#0c1014", "#1a2220"]
      : part === "morning"
        ? ["#c9b8a0", "#7a8a82"]
        : part === "afternoon"
          ? ["#8aa0a8", "#5b7068"]
          : ["#3a3c48", "#2a322e"];

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a2e2c" />
          <stop offset="1" stopColor="#0d1614" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#sky)" />
      <path d="M0 172 Q256 144 640 180 L640 360 L0 360 Z" fill="#1c2420" />
      <path d="M0 224 Q320 208 640 238 L640 360 L0 360 Z" fill="url(#water)" />
      <rect x="0" y="188" width="640" height="42" fill="#2a2620" />
      {Array.from({ length: 36 }, (_, i) => (
        <rect key={i} x={i * 18} y="188" width="10" height="4" fill="#3a342c" />
      ))}
      <g className="origin-center" style={{ animation: "idle-bob 2.4s ease-in-out infinite" }}>
        <rect x="68" y="118" width="12" height="78" rx="1" fill="#3a3228" />
        <rect x="60" y="192" width="28" height="8" fill="#2a241c" />
        <ellipse cx="74" cy="108" rx="16" ry="18" fill="#c8d4cc" />
        <ellipse cx="68" cy="106" rx="3" ry="3" fill="#6a9e8c" />
        <ellipse cx="80" cy="106" rx="3" ry="3" fill="#6a9e8c" />
        <rect x="73" y="78" width="2" height="18" fill="#3a3228" />
        <circle cx="74" cy="76" r="4" fill="#6a9e8c" />
      </g>
      {empty && (
        <g className="origin-center" style={{ animation: "idle-bob 3.6s ease-in-out infinite" }}>
          <ellipse cx="400" cy="268" rx="10" ry="6" fill="#c8d4cc" />
          <circle cx="410" cy="262" r="4" fill="#c8d4cc" />
          <polygon points="414,262 424,264 414,266" fill="#c45c4a" />
        </g>
      )}
      {!empty &&
        Array.from({ length: people }, (_, i) => {
          const x = 250 + i * 90;
          const scale = scene?.closeUp ? 1.7 : scene?.hasChild && i === people - 1 ? 0.62 : 1;
          return <Walker key={i} x={x} y={180} scale={scale} jogging={jogging} />;
        })}
      {scene?.hasDog && (
        <g transform="translate(460 210)">
          <rect x="-14" y="0" width="26" height="10" fill="#2a2218" />
          <rect x="10" y="-6" width="10" height="8" fill="#2a2218" />
          <rect x="-14" y="10" width="4" height="8" fill="#2a2218" />
          <rect x="6" y="10" width="4" height="8" fill="#2a2218" />
          <rect x="-16" y="2" width="8" height="3" fill="#2a2218" />
        </g>
      )}
      {scene?.hasBicycle && (
        <g transform="translate(360 200)" fill="none" stroke="#111" strokeWidth="2">
          <circle cx="-16" cy="18" r="10" />
          <circle cx="16" cy="18" r="10" />
          <path d="M-16 18 L0 6 L16 18 L4 0" />
        </g>
      )}
    </svg>
  );
}

function Walker({ x, y, scale, jogging }: { x: number; y: number; scale: number; jogging: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#1a1c1a" stroke="#1a1c1a" strokeWidth="3">
      <circle cy="-28" r="8" stroke="none" />
      <rect x="-7" y="-20" width="14" height="28" stroke="none" />
      <path d={jogging ? "M-6 -14 L-16 4 M6 -14 L16 0 M-4 8 L-10 28 M4 8 L10 28" : "M-6 -14 L-12 6 M6 -14 L12 4 M-4 8 L-6 28 M4 8 L6 28"} />
    </g>
  );
}

export function OverlayBoxes() {
  const scene = useParrotStore((s) => s.scene);
  const overlays = useParrotStore((s) => s.overlays);
  if (!overlays || !scene) return null;
  return (
    <div className="pointer-events-none absolute inset-0">
      {scene.people.map((p) => {
        const [x, y, w, h] = p.bbox;
        return (
          <div
            key={`p-${p.id}`}
            className="absolute rounded-xs border border-canal"
            style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }}
          >
            <span className="absolute -top-4 left-1 text-[10px] text-accent">{p.likelyChild ? "child" : "person"}</span>
          </div>
        );
      })}
      {scene.objects.map((o, i) => {
        const [x, y, w, h] = o.bbox;
        return (
          <div
            key={`o-${i}`}
            className="absolute rounded-xs border border-warn"
            style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }}
          >
            <span className="absolute -top-4 left-1 text-[10px] text-warn">{o.label}</span>
          </div>
        );
      })}
    </div>
  );
}
