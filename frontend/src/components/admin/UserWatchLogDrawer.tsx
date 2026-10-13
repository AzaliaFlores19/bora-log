"use client";

import { useEffect, useState } from "react";
import { X, Star, Tv, Clock, Clapperboard } from "lucide-react";
import { MOOD_ICONS } from "@/lib/mood-icons";
import type { AdminUser, UserShow, ShowStatus } from "@/types";
import { getPosterUrl } from "@/lib/mock-data";
import {
  STATUS_LABELS,
  STATUS_DOT_COLORS,
  STATUS_COLORS,
  MOOD_LABELS,
  TIME_COMMIT_LABELS,
  formatDate,
} from "@/lib/constants";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchUserShowsById } from "@/services/admin.service";

interface UserWatchLogDrawerProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}

export function UserWatchLogDrawer({ user, open, onClose }: UserWatchLogDrawerProps) {
  const [shows, setShows] = useState<UserShow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !open) return;
    setLoading(true);
    fetchUserShowsById(user.id).then((data) => {
      setShows(data);
      setLoading(false);
    });
  }, [user, open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !user) return null;

  const statusCounts: Record<ShowStatus, number> = { watching: 0, completed: 0, plan_to_watch: 0, dropped: 0 };
  shows.forEach((us) => statusCounts[us.status]++);

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md h-full bg-surface border-l border-border shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 glass-strong border-b border-border px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold text-text">Watch Log</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info row */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-fg font-display text-lg font-extrabold flex-shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-text truncate">{user.username}</p>
              <p className="text-xs text-text-subtle truncate">{user.email}</p>
            </div>
          </div>

          {/* Status summary chips */}
          <div className="flex items-center gap-4 mt-3 text-xs">
            {(Object.keys(STATUS_LABELS) as ShowStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[s]}`} />
                <span className="text-text-muted">{STATUS_LABELS[s]}</span>
                <span className="font-semibold text-text">{statusCounts[s]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────── */}
        <div className="p-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-12 h-18 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : shows.length === 0 ? (
            <EmptyState
              icon={<Clapperboard className="w-8 h-8" />}
              title="No shows tracked"
              description="This user hasn't added any shows to their log yet."
            />
          ) : (
            <div className="space-y-3">
              {shows.map((us) => {
                const TypeIcon = Tv;
                return (
                  <div
                    key={us.id}
                    className="flex gap-3 rounded-xl bg-bg/40 border border-border p-3 hover:border-primary/20 transition-colors"
                  >
                    {/* Poster */}
                    <div className="w-12 h-18 rounded-lg overflow-hidden bg-bg flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getPosterUrl(us.show)}
                        alt={us.show.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-text text-sm line-clamp-1">{us.show.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border flex-shrink-0 ${STATUS_COLORS[us.status]}`}>
                          {STATUS_LABELS[us.status]}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 text-xs text-text-subtle">
                        <TypeIcon className="w-3 h-3" />
                        TV Show
                        {us.show.release_date && <span>· {new Date(us.show.release_date).getFullYear()}</span>}
                      </div>

                      {us.rating !== null && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Star className="w-3 h-3 fill-warning text-warning" />
                          <span className="text-xs text-text-muted">{us.rating}/10</span>
                        </div>
                      )}

                      {us.moods.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {us.moods.slice(0, 4).map((m) => {
                            const MoodIcon = MOOD_ICONS[m];
                            return (
                              <span key={m} title={MOOD_LABELS[m]}>
                                <MoodIcon className="w-3.5 h-3.5 text-primary/70" />
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {us.time_commit && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-text-subtle">
                          <Clock className="w-3 h-3" />
                          {TIME_COMMIT_LABELS[us.time_commit]}
                        </div>
                      )}

                      <p className="text-[11px] text-text-subtle mt-1.5">Added {formatDate(us.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
