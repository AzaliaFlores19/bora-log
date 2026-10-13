"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { RatingStars } from "@/components/ui/RatingStars";
import { Badge } from "@/components/ui/Badge";
import { getPosterUrl, getBackdropUrl } from "@/lib/mock-data";
import { STATUS_LABELS, TIME_COMMIT_LABELS, MOOD_LABELS, formatDate, formatRuntime } from "@/lib/constants";
import type { Show, UserShow, ShowStatus, Mood, TimeCommit } from "@/types";
import { Star, Clock, Calendar, Tv, Check } from "lucide-react";
import { MOOD_ICONS } from "@/lib/mood-icons";

interface ShowFormModalProps {
  open: boolean;
  onClose: () => void;
  show: Show | null;
  existingEntry?: UserShow | null;
  onSubmit: (data: {
    status: ShowStatus;
    rating: number | null;
    moods: Mood[];
    time_commit: TimeCommit | null;
  }) => Promise<void>;
}

const statusOptions: ShowStatus[] = ["watching", "completed", "plan_to_watch", "dropped"];
const moodOptions: Mood[] = ["happy", "sad", "nerdy", "adventurous", "romantic", "thrilled", "cozy", "thoughtful"];
const timeCommitOptions: TimeCommit[] = ["around_30_min", "between_1_and_3_hours", "binge"];

export function ShowFormModal({ open, onClose, show, existingEntry, onSubmit }: ShowFormModalProps) {
  const [status, setStatus] = useState<ShowStatus>("plan_to_watch");
  const [rating, setRating] = useState<number | null>(null);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [timeCommit, setTimeCommit] = useState<TimeCommit | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingEntry) {
      setStatus(existingEntry.status);
      setRating(existingEntry.rating);
      setMoods(existingEntry.moods);
      setTimeCommit(existingEntry.time_commit);
    } else {
      setStatus("plan_to_watch");
      setRating(null);
      setMoods([]);
      setTimeCommit(null);
    }
  }, [existingEntry, open]);

  if (!show) return null;

  async function handleSubmit() {
    setSaving(true);
    try {
      await onSubmit({ status, rating, moods, time_commit: timeCommit });
    } finally {
      setSaving(false);
    }
  }

  function toggleMood(mood: Mood) {
    setMoods((prev) => (prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]));
  }

  const TypeIcon = Tv;

  return (
    <Modal open={open} onClose={onClose} size="lg">
      {/* Hero backdrop */}
      <div className="relative -mx-6 -mt-6 h-40 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={getBackdropUrl(show)} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/80 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Header */}
      <div className="flex gap-4 -mt-8 relative mb-6">
        <div className="w-24 h-36 rounded-xl overflow-hidden bg-bg border-2 border-surface flex-shrink-0 shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getPosterUrl(show)} alt={show.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 pt-8">
          <h2 className="font-display text-xl font-extrabold text-text">{show.title}</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
            <Badge className="border-border bg-bg/50 text-text-subtle">
              <TypeIcon className="w-3 h-3" />
              TV Show
            </Badge>
            {show.release_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(show.release_date)}
              </span>
            )}
            {show.runtime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatRuntime(show.runtime)}
              </span>
            )}
            {show.vote_average && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                {show.vote_average.toFixed(1)}
              </span>
            )}
          </div>
          {show.overview && <p className="text-sm text-text-muted mt-2 line-clamp-2">{show.overview}</p>}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Status</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  status === s
                    ? "gradient-primary text-primary-fg shadow-lg shadow-primary/20"
                    : "bg-surface-hover text-text-muted border border-border hover:text-text"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Your Rating {rating !== null && <span className="text-primary">({rating}/10)</span>}
          </label>
          <div className="flex items-center gap-3">
            <RatingStars value={rating} max={10} onChange={(v) => setRating(v)} size={20} />
            {rating !== null && (
              <button
                onClick={() => setRating(null)}
                className="text-xs text-text-subtle hover:text-error transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Moods */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Moods</label>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((m) => {
              const selected = moods.includes(m);
              const MoodIcon = MOOD_ICONS[m];
              return (
                <button
                  key={m}
                  onClick={() => toggleMood(m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selected
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "bg-surface-hover text-text-muted border border-border hover:text-text"
                  }`}
                >
                  <MoodIcon className="w-3.5 h-3.5" />
                  {MOOD_LABELS[m]}
                  {selected && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Commit */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Time Commitment</label>
          <div className="flex flex-wrap gap-2">
            {timeCommitOptions.map((tc) => (
              <button
                key={tc}
                onClick={() => setTimeCommit(timeCommit === tc ? null : tc)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  timeCommit === tc
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-surface-hover text-text-muted border border-border hover:text-text"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {TIME_COMMIT_LABELS[tc]}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {existingEntry ? "Save Changes" : "Add to Log"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
