export interface AvatarColor {
  name: string;
  value: string;
}

// Fixed palette for the profile circle. Independent from the theme system so the
// user can pick a color that stands out regardless of the active theme.
export const AVATAR_COLORS: AvatarColor[] = [
  { name: "Violet", value: "#a855f7" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Sky", value: "#38bdf8" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Green", value: "#4ade80" },
  { name: "Amber", value: "#fbbf24" },
  { name: "Coral", value: "#fb7185" },
  { name: "Rose", value: "#ec4899" },
];

export const DEFAULT_AVATAR_COLOR = AVATAR_COLORS[0].value;

/** Deterministic color from a seed (e.g. an email) so it stays stable across sessions. */
export function colorFromSeed(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length].value;
}

/** Returns a readable foreground color (dark or light) for a given hex background. */
export function readableTextColor(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  // Relative luminance (sRGB approximation)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#141018" : "#ffffff";
}
