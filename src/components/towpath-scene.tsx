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
        <linearGradient id="hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d2a18" />
          <stop offset="1" stopColor="#24180e" />
        </linearGradient>
        <linearGradient id="cabin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a9e8c" />
          <stop offset="1" stopColor="#3d6b5c" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#sky)" />
      <path d="M0 168 Q240 148 640 176 L640 360 L0 360 Z" fill="#1c2420" />
      <path d="M0 228 Q320 214 640 242 L640 360 L0 360 Z" fill="url(#water)" />
      <rect x="0" y="186" width="640" height="42" fill="#2a2620" />
      {Array.from({ length: 36 }, (_, i) => (
        <rect key={i} x={i * 18} y="186" width="10" height="4" fill="#3a342c" />
      ))}

      <g className="origin-center" style={{ animation: "idle-bob 3.2s ease-in-out infinite" }}>
        <Narrowboat />
      </g>

      {empty && (
        <g className="origin-center" style={{ animation: "idle-bob 3.6s ease-in-out infinite" }}>
          <ellipse cx="520" cy="278" rx="10" ry="6" fill="#c8d4cc" />
          <circle cx="530" cy="272" r="4" fill="#c8d4cc" />
          <polygon points="534,272 544,274 534,276" fill="#c45c4a" />
        </g>
      )}
      {!empty &&
        Array.from({ length: people }, (_, i) => {
          const x = 280 + i * 86;
          const scale = scene?.closeUp ? 1.7 : scene?.hasChild && i === people - 1 ? 0.62 : 1;
          return <Walker key={i} x={x} y={178} scale={scale} jogging={jogging} />;
        })}
      {scene?.hasDog && (
        <g transform="translate(500 208)">
          <rect x="-14" y="0" width="26" height="10" fill="#2a2218" />
          <rect x="10" y="-6" width="10" height="8" fill="#2a2218" />
          <rect x="-14" y="10" width="4" height="8" fill="#2a2218" />
          <rect x="6" y="10" width="4" height="8" fill="#2a2218" />
          <rect x="-16" y="2" width="8" height="3" fill="#2a2218" />
        </g>
      )}
      {scene?.hasBicycle && (
        <g transform="translate(400 198)" fill="none" stroke="#111" strokeWidth="2">
          <circle cx="-16" cy="18" r="10" />
          <circle cx="16" cy="18" r="10" />
          <path d="M-16 18 L0 6 L16 18 L4 0" />
        </g>
      )}
    </svg>
  );
}

function Narrowboat() {
  return (
    <g transform="translate(36 150)">
      {/* hull */}
      <path d="M8 78 L18 58 L236 58 L252 78 L248 92 L12 92 Z" fill="url(#hull)" />
      <rect x="18" y="70" width="218" height="8" fill="#c45c4a" />
      <path d="M18 58 L28 48 L210 48 L236 58 Z" fill="#2a241c" />
      {/* cabin */}
      <rect x="70" y="22" width="118" height="36" rx="2" fill="url(#cabin)" />
      <rect x="76" y="28" width="18" height="12" fill="#1a2422" />
      <rect x="102" y="28" width="18" height="12" fill="#1a2422" />
      <rect x="128" y="28" width="18" height="12" fill="#1a2422" />
      <rect x="154" y="28" width="18" height="12" fill="#1a2422" />
      <rect x="188" y="18" width="8" height="18" fill="#3a3228" />
      <rect x="186" y="12" width="12" height="6" fill="#2a241c" />
      {/* tiller deck */}
      <rect x="20" y="50" width="48" height="10" fill="#3a3228" />
      <path d="M28 50 L22 38 L26 38 L34 50" fill="#1a1612" />
      {/* mooring line */}
      <path d="M248 82 Q280 90 300 78" fill="none" stroke="#3a3228" strokeWidth="1.4" />
      {/* treasure chest on cabin roof */}
      <g transform="translate(112 4)">
        <rect x="0" y="10" width="44" height="20" rx="2" fill="#6b4424" />
        <rect x="0" y="6" width="44" height="10" rx="2" fill="#8a5a2b" />
        <rect x="20" y="12" width="6" height="10" rx="1" fill="#c4a15a" />
        <rect x="2" y="16" width="40" height="3" fill="#c4a15a" />
        <rect x="-1" y="8" width="46" height="3" fill="#c4a15a" />
        <ProfileParrot />
      </g>
      {/* waterline glint */}
      <path d="M20 90 Q130 98 244 90" fill="none" stroke="#6a9e8c" strokeWidth="1" opacity="0.35" />
    </g>
  );
}

function ProfileParrot() {
  return (
    <g transform="translate(28 -10)" style={{ animation: "idle-bob 1.8s ease-in-out infinite" }}>
      <path d="M-16 18 C-22 22 -20 32 -12 34 C-8 28 -8 22 -10 18 Z" fill="#1f6b3a" />
      <ellipse cx="2" cy="18" rx="12" ry="11" fill="#c43b2e" />
      <ellipse cx="-2" cy="20" rx="8" ry="7" fill="#2f8a45" transform="rotate(-20 -2 20)" />
      <ellipse cx="12" cy="8" rx="9" ry="8" fill="#c43b2e" />
      <path d="M6 4 Q12 -4 20 6 Q16 12 8 10 Z" fill="#2f8a45" />
      <ellipse cx="16" cy="9" rx="4.5" ry="4" fill="#f3e6c8" />
      <circle cx="17.5" cy="8.5" r="1.6" fill="#0a0c0b" />
      <path d="M20 9 Q28 8 25 14 Q22 12 20 11 Z" fill="#e2a12a" />
      <rect x="10" y="-10" width="1.6" height="10" rx="0.6" fill="#3a3228" />
      <circle cx="10.8" cy="-10" r="2.4" fill="#6a9e8c" />
      <path d="M0 28 L-2 34 M4 28 L6 34" stroke="#e2a12a" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

function Walker({ x, y, scale, jogging }: { x: number; y: number; scale: number; jogging: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#1a1c1a" stroke="#1a1c1a" strokeWidth="3">
      <circle cy="-28" r="8" stroke="none" />
      <rect x="-7" y="-20" width="14" height="28" stroke="none" />
      <path
        d={
          jogging
            ? "M-6 -14 L-16 4 M6 -14 L16 0 M-4 8 L-10 28 M4 8 L10 28"
            : "M-6 -14 L-12 6 M6 -14 L12 4 M-4 8 L-6 28 M4 8 L6 28"
        }
      />
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
