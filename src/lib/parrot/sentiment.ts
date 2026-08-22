import { furby } from "@/lib/furby/controller";

export type Sentiment =
  | "amused"
  | "surprised"
  | "excited"
  | "curious"
  | "sleepy"
  | "warm"
  | "cheeky"
  | "annoyed"
  | "neutral";

interface SentimentHit {
  sentiment: Sentiment;
  action: string;
  antenna: string;
}

const RULES: { sentiment: Sentiment; action: string; antenna: string; re: RegExp }[] = [
  { sentiment: "amused", action: "laugh", antenna: "cheeky", re: /\b(haha|lol|lmao|funny|joke|giggle|laugh|hilarious|snort)\b|[😂🤣]/i },
  { sentiment: "amused", action: "giggle", antenna: "cheeky", re: /\b(heh|teehee|tickl)/i },
  { sentiment: "surprised", action: "surprised", antenna: "surprise", re: /\b(whoa|woah|what the|no way|never|really\?|huh\?|wait)\b|!\?|\?!/i },
  { sentiment: "excited", action: "excited", antenna: "green", re: /\b(yes|yay|woo|brilliant|love that|let's go|awesome|amazing)\b/i },
  { sentiment: "excited", action: "dance", antenna: "cheeky", re: /\b(dance|party|tune|bop|groove)\b/i },
  { sentiment: "curious", action: "curious", antenna: "canal", re: /\b(why|how|what|where|who|curious|wonder)\b|\?/i },
  { sentiment: "sleepy", action: "yawn", antenna: "sleepy", re: /\b(tired|sleep|yawn|boring|nap|zzz)\b/i },
  { sentiment: "warm", action: "purr", antenna: "moss", re: /\b(love|sweet|good boy|good girl|thanks|thank you|cute|aww)\b/i },
  { sentiment: "annoyed", action: "mischief", antenna: "red", re: /\b(shut up|stupid|idiot|bloody|bollocks|git|muppet|knob|piss|damn|hell)\b/i },
  { sentiment: "cheeky", action: "mischief", antenna: "cheeky", re: /\b(roast|oi|mate|lycra|tosser|smug|posh|gongoozl)\b/i },
];

let lastAt = 0;
let lastSentiment: Sentiment | null = null;

export function classifySentiment(text: string): SentimentHit {
  const trimmed = text.trim();
  for (const rule of RULES) {
    if (rule.re.test(trimmed)) {
      return { sentiment: rule.sentiment, action: rule.action, antenna: rule.antenna };
    }
  }
  if (/[!?]{2,}/.test(trimmed) || trimmed === trimmed.toUpperCase() && trimmed.length > 8) {
    return { sentiment: "excited", action: "surprised", antenna: "surprise" };
  }
  return { sentiment: "neutral", action: "hey_there", antenna: "moss" };
}

export function enactSentiment(text: string, force = false): SentimentHit | null {
  const hit = classifySentiment(text);
  const now = Date.now();
  if (!force && now - lastAt < 2200 && hit.sentiment === lastSentiment) return null;
  if (!force && hit.sentiment === "neutral" && now - lastAt < 6000) return null;
  lastAt = now;
  lastSentiment = hit.sentiment;
  void furby.trigger(hit.action).catch(() => undefined);
  void furby.setAntennaPreset(hit.antenna).catch(() => undefined);
  if (hit.sentiment === "excited") void furby.setMood("excitedness", 80).catch(() => undefined);
  if (hit.sentiment === "sleepy") void furby.setMood("tiredness", 70).catch(() => undefined);
  if (hit.sentiment === "annoyed") void furby.setMood("displeasedness", 65).catch(() => undefined);
  return hit;
}
