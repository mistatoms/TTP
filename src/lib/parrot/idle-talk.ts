export const MUTTERS = [
  "Rrawk. Just the chest and me. Fine company, if you like wood.",
  "Mm. Ripple, ripple. Very original, canal.",
  "If a walker appears I shall pretend I wasn't talking to a box.",
  "Ducks have a union. I have a perch. We are at an impasse.",
  "Note to self: fewer opinions, more seeds. Ignore that.",
];

export const SONGS = [
  "Oh the cut is long and the lock is slow, and the parrot knows more than the skipper though.",
  "What shall we do with a drunken walker, early in the morning — offer him a duck, rrawk.",
  "Chest of oak and beak of brass, watching lycra thunder past.",
  "Row, row, row your boat — gently, you menace, this is a canal.",
];

export function pickIdleLine(salt = Date.now()): { kind: "mutter" | "song"; text: string } {
  const sing = Math.abs(salt) % 3 === 0;
  const pool = sing ? SONGS : MUTTERS;
  const text = pool[Math.abs(salt >> 2) % pool.length]!;
  return { kind: sing ? "song" : "mutter", text };
}
