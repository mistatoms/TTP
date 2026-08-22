import { cn } from "@/lib/utils";
import type { AntennaColor } from "@/lib/furby/protocol";
import type { VoiceStatus } from "@/lib/parrot/types";

export function ParrotMascot({
  antenna,
  speaking,
  status,
  className,
}: {
  antenna: AntennaColor;
  speaking: boolean;
  status: VoiceStatus;
  className?: string;
}) {
  const led = `rgb(${antenna.r}, ${antenna.g}, ${antenna.b})`;
  const moving = speaking || status === "listening";
  return (
    <svg
      viewBox="0 0 88 88"
      className={cn("h-14 w-14", moving && "animate-[idle-bob_1.6s_ease-in-out_infinite]", className)}
      aria-hidden
    >
      <ellipse cx="46" cy="82" rx="22" ry="4" fill="currentColor" className="text-fg/10" />
      {/* antenna */}
      <rect x="54" y="10" width="3" height="16" rx="1" fill="#3a3228" />
      <circle
        cx="55.5"
        cy="10"
        r="5"
        fill={led}
        className="origin-center animate-[antenna-pulse_1.8s_ease-in-out_infinite]"
      />
      {/* tail */}
      <path d="M18 58 C10 62 8 74 16 80 C22 74 24 66 22 60 Z" fill="#1f6b3a" />
      <path d="M20 60 C14 66 16 76 22 78 C24 72 26 64 22 60 Z" fill="#c43b2e" />
      {/* body — profile macaw */}
      <ellipse cx="44" cy="56" rx="22" ry="20" fill="#c43b2e" />
      <ellipse cx="40" cy="60" rx="14" ry="12" fill="#b33428" />
      {/* wing coverts */}
      <ellipse cx="38" cy="58" rx="16" ry="11" fill="#2f8a45" transform="rotate(-18 38 58)" />
      <path d="M26 56 Q34 48 48 54 Q40 64 28 62 Z" fill="#1f6b3a" />
      <path d="M30 58 Q38 52 46 56 Q40 62 32 60 Z" fill="#3db35c" />
      {/* head */}
      <ellipse cx="62" cy="38" rx="16" ry="15" fill="#c43b2e" />
      <path d="M52 32 Q62 18 74 30 Q70 40 54 38 Z" fill="#2f8a45" />
      <ellipse cx="68" cy="40" rx="8" ry="7" fill="#f3e6c8" />
      {/* eye */}
      <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "parrot-blink 4.2s infinite" }}>
        <circle cx="70" cy="38" r="4.2" fill="#f7f1e4" />
        <circle cx="71" cy="38" r="2.2" fill="#0a0c0b" />
        <circle cx="71.8" cy="37.2" r="0.7" fill="#f7f1e4" />
      </g>
      {/* hooked beak */}
      <path
        d={speaking ? "M76 40 Q88 38 84 48 Q78 46 76 44 Z" : "M76 40 Q86 36 82 46 Q78 44 76 42 Z"}
        fill="#e2a12a"
      />
      <path d="M76 42 Q82 42 80 46" fill="none" stroke="#b37818" strokeWidth="0.8" />
      {/* feet */}
      <path d="M40 74 L36 80 M44 74 L46 80 M48 74 L52 80" stroke="#e2a12a" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
