"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Calendar, Tv, Pencil, Trash2 } from "lucide-react";
import type { UserShow } from "@/types";
import * as showService from "@/services/show.service";
import { useShows } from "@/hooks/useShows";
import { useToast } from "@/hooks/useToast";
import { useShowModal } from "@/components/shows/ShowModalProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Artwork } from "@/components/ui/Artwork";
import { RatingStars } from "@/components/ui/RatingStars";
import { posterSrc, backdropSrc } from "@/lib/media";
import {
  STATUS_LABELS,
  STATUS_DOT_COLORS,
  TIME_COMMIT_LABELS,
  MOOD_LABELS,
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

  const backdrop = backdropSrc(show);
  const poster = posterSrc(show);
  const year = show.release_date ? new Date(show.release_date).getFullYear() : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      <div className="relative">
        {/* Banner: full image (contain) over a blurred fill; blurred poster as fallback */}
        <div className="relative rounded-3xl overflow-hidden h-56 sm:h-72 lg:h-80 bg-bg">
          {backdrop ? (
            <>
              <Artwork
                src={backdrop}
                alt=""
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="blur-2xl scale-110 opacity-60"
              />
              <Artwork
                src={backdrop}
                alt=""
                priority
                objectFit="contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </>
          ) : (
            <Artwork
              src={poster}
              alt=""
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="blur-2xl scale-110 opacity-70"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-transparent" />
        </div>

        {/* Poster + info, top-aligned */}
        <div className="relative -mt-24 sm:-mt-28 grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-6 sm:gap-8">
          <div className="mx-auto sm:mx-0 w-36 sm:w-48">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-bg border-2 border-surface shadow-xl">
              <Artwork src={poster} alt={show.title} priority sizes="192px" />
            </div>
          </div>

          <div className="sm:pt-28">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text">{show.title}</h1>

            <div className="flex flex-wrap items-center gap-2 mt-2.5 mb-4">
              <Badge className="border-border bg-bg/50 text-text-subtle">
                <Tv className="w-3 h-3" />
                Serie
              </Badge>
              {year && (
                <Badge className="border-border bg-bg/50 text-text-subtle">
                  <Calendar className="w-3 h-3" />
                  {year}
                </Badge>
              )}
              {show.runtime && (
                <Badge className="border-border bg-bg/50 text-text-subtle">
                  <Clock className="w-3 h-3" />
                  {formatRuntime(show.runtime)}
                </Badge>
              )}
            </div>

            {show.overview && <p className="text-text-muted leading-relaxed max-w-2xl">{show.overview}</p>}
          </div>
        </div>
      </div>

      {/* Your tracking — full-width list */}
      <div className="mt-8 rounded-2xl bg-surface border border-border p-5 sm:p-6">
        <div className="flex items-center justify-between mb-1">
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

        <dl className="divide-y divide-border/60">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3.5">
            <dt className="text-xs font-semibold text-text-subtle uppercase tracking-wide">Status</dt>
            <dd className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT_COLORS[userShow.status]}`} />
              <span className="text-sm font-medium text-text">{STATUS_LABELS[userShow.status]}</span>
            </dd>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3.5">
            <dt className="text-xs font-semibold text-text-subtle uppercase tracking-wide">Your Rating</dt>
            <dd>
              {userShow.rating !== null ? (
                <div className="flex items-center gap-2">
                  <RatingStars value={userShow.rating} max={10} size={14} />
                  <span className="text-sm text-text-muted">{userShow.rating}/10</span>
                </div>
              ) : (
                <span className="text-sm text-text-subtle">Not rated</span>
              )}
            </dd>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3.5">
            <dt className="text-xs font-semibold text-text-subtle uppercase tracking-wide">Moods</dt>
            <dd>
              {userShow.moods.length > 0 ? (
                <div className="flex flex-wrap justify-end gap-1.5">
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
              ) : (
                <span className="text-sm text-text-subtle">No moods</span>
              )}
            </dd>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3.5">
            <dt className="text-xs font-semibold text-text-subtle uppercase tracking-wide">Time Commitment</dt>
            <dd>
              {userShow.time_commit ? (
                <Badge className="border-border bg-bg/50 text-text-muted">
                  <Clock className="w-3 h-3" />
                  {TIME_COMMIT_LABELS[userShow.time_commit]}
                </Badge>
              ) : (
                <span className="text-sm text-text-subtle">Not set</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
