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
      viewBox="0 0 72 88"
      className={cn("h-14 w-12", moving && "animate-[idle-bob_1.6s_ease-in-out_infinite]", className)}
      aria-hidden
    >
      <ellipse cx="36" cy="82" rx="18" ry="4" fill="currentColor" className="text-fg/10" />
      <rect x="34" y="8" width="3" height="16" rx="1" fill="#3a3228" />
      <circle cx="35.5" cy="8" r="5" fill={led} className="origin-center animate-[antenna-pulse_1.8s_ease-in-out_infinite]" />
      <ellipse cx="36" cy="52" rx="20" ry="24" fill="#d7ddd6" />
      <ellipse cx="36" cy="54" rx="14" ry="16" fill="#b7c4ba" />
      <ellipse cx="22" cy="28" rx="8" ry="12" fill="#c8d4cc" />
      <ellipse cx="50" cy="28" rx="8" ry="12" fill="#c8d4cc" />
      <ellipse cx="36" cy="36" rx="16" ry="15" fill="#e8ebe6" />
      <g className="origin-center" style={{ transformBox: "fill-box", transformOrigin: "center", animation: "parrot-blink 4.2s infinite" }}>
        <circle cx="30" cy="36" r="3.2" fill="#0a0c0b" />
        <circle cx="42" cy="36" r="3.2" fill="#0a0c0b" />
        <circle cx="31" cy="35" r="1" fill="#e8ebe6" />
        <circle cx="43" cy="35" r="1" fill="#e8ebe6" />
      </g>
      <path
        d={speaking ? "M32 44 L36 52 L40 44 Z" : "M32 44 L36 48 L40 44 Z"}
        fill="#c45c4a"
      />
    </svg>
  );
}
