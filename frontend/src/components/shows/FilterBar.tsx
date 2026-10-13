"use client";

import type { ShowStatus, Mood, TimeCommit } from "@/types";
import { STATUS_LABELS, MOOD_LABELS, TIME_COMMIT_LABELS } from "@/lib/constants";
import { X, Clock3, Timer, Layers3 } from "lucide-react";
import { MOOD_ICONS } from "@/lib/mood-icons";

interface FilterBarProps {
  statusFilter: ShowStatus | "all";
  onStatusChange: (s: ShowStatus | "all") => void;
  moodFilter: Mood | "all";
  onMoodChange: (m: Mood | "all") => void;
  timeCommitFilter: TimeCommit | "all";
  onTimeCommitChange: (tc: TimeCommit | "all") => void;
  counts: Record<ShowStatus, number>;
  moodsPresent: Mood[];
  timeCommitsPresent: TimeCommit[];
  onClearAll: () => void;
}

const STATUS_STYLES: Record<ShowStatus, { dot: string; pill: string; label: string }> = {
  watching: { dot: "bg-sky-400", pill: "border-sky-400 text-sky-500 bg-sky-50 dark:bg-sky-900/20", label: "Watching" },
  completed: { dot: "bg-emerald-400", pill: "border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20", label: "Completed" },
  plan_to_watch: { dot: "bg-amber-400", pill: "border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-900/20", label: "Plan to Watch" },
  dropped: { dot: "bg-rose-400", pill: "border-rose-400 text-rose-600 bg-rose-50 dark:bg-rose-900/20", label: "Dropped" },
};

const TIME_ICONS: Record<TimeCommit, typeof Clock3> = {
  around_30_min: Timer,
  between_1_and_3_hours: Clock3,
  binge: Layers3,
};

export function FilterBar({
  statusFilter,
  onStatusChange,
  moodFilter,
  onMoodChange,
  timeCommitFilter,
  onTimeCommitChange,
  moodsPresent,
  timeCommitsPresent,
  onClearAll,
}: FilterBarProps) {
  const hasActive = statusFilter !== "all" || moodFilter !== "all" || timeCommitFilter !== "all";
  const statuses: ShowStatus[] = ["watching", "completed", "plan_to_watch", "dropped"];

  return (
    <div className="rounded-2xl border border-border bg-surface/70 p-4 sm:p-5 space-y-5 shadow-sm">
      {/* STATUS */}
      <section>
        <span className="text-[11px] font-bold text-text-subtle uppercase tracking-widest block mb-3">Status</span>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => {
            const active = statusFilter === s;
            const { dot, pill } = STATUS_STYLES[s];
            return (
              <button
                key={s}
                onClick={() => onStatusChange(active ? "all" : s)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
                  active ? pill : "border-border text-text-muted hover:border-primary/40 hover:text-text"
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                {STATUS_LABELS[s]}
              </button>
            );
          })}
        </div>
      </section>

      {/* MOOD */}
      {moodsPresent.length > 0 && (
        <section>
          <span className="text-[11px] font-bold text-text-subtle uppercase tracking-widest block mb-3">Mood</span>
          <div className="flex flex-wrap gap-2">
            {moodsPresent.map((m) => {
              const active = moodFilter === m;
              const MoodIcon = MOOD_ICONS[m];
              return (
                <button
                  key={m}
                  onClick={() => onMoodChange(active ? "all" : m)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
                    active
                      ? "border-primary/50 text-primary bg-primary/10"
                      : "border-border text-text-muted hover:border-primary/40 hover:text-text"
                  }`}
                >
                  <MoodIcon className="w-3.5 h-3.5" />
                  {MOOD_LABELS[m]}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* TIME COMMITMENT */}
      {timeCommitsPresent.length > 0 && (
        <section>
          <span className="text-[11px] font-bold text-text-subtle uppercase tracking-widest block mb-3">
            Time Commitment
          </span>
          <div className="flex flex-wrap gap-2">
            {timeCommitsPresent.map((tc) => {
              const active = timeCommitFilter === tc;
              const TimeIcon = TIME_ICONS[tc];
              return (
                <button
                  key={tc}
                  onClick={() => onTimeCommitChange(active ? "all" : tc)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
                    active
                      ? "border-primary/50 text-primary bg-primary/10"
                      : "border-border text-text-muted hover:border-primary/40 hover:text-text"
                  }`}
                >
                  <TimeIcon className="w-3.5 h-3.5" />
                  {TIME_COMMIT_LABELS[tc]}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Clear all */}
      {hasActive && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 text-sm text-error hover:opacity-80 font-medium transition-opacity"
        >
          <X className="w-3.5 h-3.5" />
          Clear all filters
        </button>
      )}
    </div>
  );
}
