import type { ShowStatus, TimeCommit, Mood, MediaType, ThemeOption } from "@/types";

export const STATUS_LABELS: Record<ShowStatus, string> = {
  watching: "Watching",
  completed: "Completed",
  plan_to_watch: "Plan to Watch",
  dropped: "Dropped",
};

export const STATUS_COLORS: Record<ShowStatus, string> = {
  watching: "text-success bg-success/10 border-success/30",
  completed: "text-primary bg-primary/10 border-primary/30",
  plan_to_watch: "text-warning bg-warning/10 border-warning/30",
  dropped: "text-error bg-error/10 border-error/30",
};

export const STATUS_DOT_COLORS: Record<ShowStatus, string> = {
  watching: "bg-success",
  completed: "bg-primary",
  plan_to_watch: "bg-warning",
  dropped: "bg-error",
};

export const TIME_COMMIT_LABELS: Record<TimeCommit, string> = {
  around_30_min: "Around 30 min",
  between_1_and_3_hours: "1-3 hours",
  binge: "Binge",
};

export const MOOD_LABELS: Record<Mood, string> = {
  happy: "Happy",
  sad: "Sad",
  nerdy: "Nerdy",
  adventurous: "Adventurous",
  romantic: "Romantic",
  thrilled: "Thrilled",
  cozy: "Cozy",
  thoughtful: "Thoughtful",
};

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  movie: "Movie",
  tv: "TV Series",
};

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Unknown";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatYear(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return String(date.getFullYear());
}

export function formatRuntime(runtime: number | null): string {
  if (!runtime) return "";
  const h = Math.floor(runtime / 60);
  const m = runtime % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatRating(rating: number | null): string {
  if (rating === null) return "—";
  return rating.toFixed(1);
}

export const themeOptions: ThemeOption[] = [
  { name: "purple", label: "Bora-Log", swatch: "#a855f7" },
  { name: "ocean", label: "Ocean", swatch: "#38bdf8" },
  { name: "forest", label: "Forest", swatch: "#4ade80" },
  { name: "sunset", label: "Sunset", swatch: "#fb923c" },
  { name: "rose", label: "Rose", swatch: "#f43f5e" },
  { name: "mono", label: "Mono", swatch: "#e5e7eb" },
];
