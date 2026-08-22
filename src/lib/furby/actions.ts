import type { ActionTuple } from "./protocol";

export interface NamedAction {
  id: string;
  label: string;
  group: "talk" | "body" | "mood" | "idle";
  tuple: ActionTuple;
  hint: string;
}

/** Curated puppet set from bluefluff actionlist + PyFluff. */
export const FURBY_ACTIONS: NamedAction[] = [
  { id: "greet", label: "Greet", group: "talk", tuple: { input: 29, index: 0, subindex: 0, specific: 0 }, hint: "Hi hi hello" },
  { id: "hey_there", label: "Hey there", group: "talk", tuple: { input: 40, index: 0, subindex: 0, specific: 1 }, hint: "Hey there howdy" },
  { id: "missed_you", label: "Missed you", group: "talk", tuple: { input: 30, index: 0, subindex: 3, specific: 0 }, hint: "Kah missed you" },
  { id: "laugh", label: "Laugh", group: "mood", tuple: { input: 2, index: 0, subindex: 0, specific: 0 }, hint: "Frantic laughter" },
  { id: "giggle", label: "Giggle", group: "mood", tuple: { input: 2, index: 0, subindex: 1, specific: 1 }, hint: "Ticklish giggle" },
  { id: "mischief", label: "Mischief", group: "mood", tuple: { input: 3, index: 0, subindex: 1, specific: 3 }, hint: "Mischievous laugh" },
  { id: "surprised", label: "Surprised", group: "mood", tuple: { input: 1, index: 0, subindex: 0, specific: 2 }, hint: "Ooooh oh waa" },
  { id: "excited", label: "Excited", group: "mood", tuple: { input: 55, index: 1, subindex: 0, specific: 0 }, hint: "Hollywood lights" },
  { id: "curious", label: "Curious", group: "mood", tuple: { input: 1, index: 2, subindex: 0, specific: 2 }, hint: "Ooooh favourite" },
  { id: "dance", label: "Dance", group: "body", tuple: { input: 17, index: 0, subindex: 0, specific: 4 }, hint: "Check out kah moves" },
  { id: "do_the_furb", label: "Do the furb", group: "body", tuple: { input: 17, index: 0, subindex: 2, specific: 4 }, hint: "Hustle / electric slide" },
  { id: "wanna_dance", label: "Wanna dance", group: "body", tuple: { input: 17, index: 3, subindex: 0, specific: 1 }, hint: "Wanna dance?" },
  { id: "wake", label: "Wake", group: "idle", tuple: { input: 23, index: 1, subindex: 0, specific: 0 }, hint: "Wakey wakey" },
  { id: "sleep", label: "Sleep", group: "idle", tuple: { input: 28, index: 0, subindex: 0, specific: 3 }, hint: "So sleepy" },
  { id: "yawn", label: "Yawn", group: "idle", tuple: { input: 12, index: 2, subindex: 0, specific: 2 }, hint: "Kah love sleep" },
  { id: "sneeze", label: "Sneeze", group: "body", tuple: { input: 22, index: 0, subindex: 1, specific: 2 }, hint: "Congested sneeze" },
  { id: "hiccup", label: "Hiccup", group: "body", tuple: { input: 16, index: 0, subindex: 0, specific: 0 }, hint: "Hiccup" },
  { id: "purr", label: "Purr", group: "mood", tuple: { input: 1, index: 2, subindex: 1, specific: 1 }, hint: "Purr, dreaming?" },
  { id: "feel_good", label: "Feel good", group: "mood", tuple: { input: 1, index: 0, subindex: 0, specific: 3 }, hint: "Kah feel good" },
  { id: "bored", label: "Bored", group: "idle", tuple: { input: 24, index: 0, subindex: 0, specific: 3 }, hint: "Wanna dance, put on tunes" },
];

export const ACTION_BY_ID = Object.fromEntries(FURBY_ACTIONS.map((a) => [a.id, a]));

export const TOOL_ACTION_IDS = [
  "greet",
  "laugh",
  "giggle",
  "mischief",
  "surprised",
  "excited",
  "curious",
  "dance",
  "wanna_dance",
  "wake",
  "sleep",
  "yawn",
  "sneeze",
  "purr",
  "feel_good",
] as const;

export type ToolActionId = (typeof TOOL_ACTION_IDS)[number];

export const IDLE_ACTIONS = FURBY_ACTIONS.filter((a) => a.group === "idle");
