"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, Clock, Calendar, Tv, Pencil, Trash2 } from "lucide-react";
import type { UserShow } from "@/types";
import * as showService from "@/services/show.service";
import { useShows } from "@/hooks/useShows";
import { useToast } from "@/hooks/useToast";
import { useShowModal } from "@/components/shows/ShowModalProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { posterUrl, backdropUrl } from "@/lib/media";
import {
  STATUS_LABELS,
  STATUS_DOT_COLORS,
  TIME_COMMIT_LABELS,
  MOOD_LABELS,
  formatDate,
  formatRuntime,
} from "@/lib/constants";
import { MOOD_ICONS } from "@/lib/mood-icons";

export default function ShowDetailPage() {
  const params = useParams<{ id: string }>();
  const userShowId = params.id;
  const router = useRouter();
  const { shows, loading, removeShow } = useShows();
  const { addToast } = useToast();
  const { openEditModal } = useShowModal();

  const [fetched, setFetched] = useState<UserShow | null>(null);
  const [fetching, setFetching] = useState(false);

  const listEntry = shows.find((us) => us.id === userShowId) ?? null;
  const userShow = listEntry ?? fetched;
  const show = userShow?.show ?? null;

  // Fallback for direct links / reloads where the shared list isn't loaded yet.
  useEffect(() => {
    if (loading || listEntry) return;
    let active = true;
    setFetching(true);
    showService
      .fetchUserShowById(userShowId)
      .then((entry) => {
        if (active) setFetched(entry);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setFetching(false);
      });
    return () => {
      active = false;
    };
  }, [loading, listEntry, userShowId]);

  async function handleRemove() {
    if (!userShow) return;
    try {
      await removeShow(userShow.id);
      addToast("success", `Removed "${userShow.show.title}" from your log`);
      router.push("/dashboard");
    } catch {
      addToast("error", "Failed to remove show");
    }
  }

  if (loading || fetching) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-24 mb-6" />
        <Skeleton className="h-64 mb-6 rounded-3xl" />
        <div className="flex gap-6">
          <Skeleton className="w-48 h-72 rounded-2xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!show || !userShow) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon={<Tv className="w-8 h-8" />}
          title="Show not found"
          description="This show may have been removed from your log."
          action={<Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>}
        />
      </div>
    );
  }

  const TypeIcon = Tv;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      {/* Hero backdrop */}
      <div className="relative rounded-3xl overflow-hidden mb-6 h-56 sm:h-72">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={backdropUrl(show)} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-transparent" />
      </div>

      {/* Main content */}
      <div className="flex flex-col sm:flex-row gap-6 -mt-32 relative">
        {/* Poster */}
        <div className="w-36 sm:w-48 flex-shrink-0 mx-auto sm:mx-0">
          <div className="rounded-2xl overflow-hidden bg-bg border-2 border-surface shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={posterUrl(show)} alt={show.title} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 sm:pt-32">
          <h1 className="font-display text-3xl font-extrabold text-text mb-2">{show.title}</h1>

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className="border-border bg-bg/50 text-text-subtle">
              <TypeIcon className="w-3 h-3" />
              TV Show
            </Badge>
            {show.release_date && (
              <Badge className="border-border bg-bg/50 text-text-subtle">
                <Calendar className="w-3 h-3" />
                {formatDate(show.release_date)}
              </Badge>
            )}
            {show.runtime && (
              <Badge className="border-border bg-bg/50 text-text-subtle">
                <Clock className="w-3 h-3" />
                {formatRuntime(show.runtime)}
              </Badge>
            )}
          </div>

          {/* Overview */}
          {show.overview && <p className="text-text-muted leading-relaxed mb-6 max-w-2xl">{show.overview}</p>}

          {/* User's tracking info */}
          <div className="rounded-2xl bg-surface border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-text">Your Tracking</h3>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => openEditModal(userShow)}>
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={handleRemove}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT_COLORS[userShow.status]}`} />
              <span className="text-sm font-medium text-text">{STATUS_LABELS[userShow.status]}</span>
            </div>

            {userShow.rating !== null && (
              <div>
                <span className="text-xs text-text-subtle uppercase tracking-wide block mb-1.5">Your Rating</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < userShow.rating! ? "fill-warning text-warning" : "text-text-subtle"}`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-text-muted">{userShow.rating}/10</span>
                </div>
              </div>
            )}

            {userShow.moods.length > 0 && (
              <div>
                <span className="text-xs text-text-subtle uppercase tracking-wide block mb-1.5">Moods</span>
                <div className="flex flex-wrap gap-2">
                  {userShow.moods.map((m) => {
                    const MoodIcon = MOOD_ICONS[m];
                    return (
                      <Badge key={m} className="border-primary/20 bg-primary/5 text-primary">
                        <MoodIcon className="w-3 h-3" />
                        {MOOD_LABELS[m]}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {userShow.time_commit && (
              <div>
                <span className="text-xs text-text-subtle uppercase tracking-wide block mb-1.5">
                  Time Commitment
                </span>
                <Badge className="border-border bg-bg/50 text-text-muted">
                  <Clock className="w-3 h-3" />
                  {TIME_COMMIT_LABELS[userShow.time_commit]}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
