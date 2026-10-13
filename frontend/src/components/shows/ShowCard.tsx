"use client";

import type { UserShow } from "@/types";
import { STATUS_LABELS, STATUS_DOT_COLORS } from "@/lib/constants";
import { posterUrl } from "@/lib/media";
import { Star, Play, CheckCircle2, Bookmark, XCircle, MoreVertical } from "lucide-react";
import { MOOD_ICONS } from "@/lib/mood-icons";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { useState, useRef, useEffect } from "react";

interface ShowCardProps {
  userShow: UserShow;
  onEdit?: (userShow: UserShow) => void;
  onRemove?: (userShow: UserShow) => void;
}

const statusIcons = {
  watching: Play,
  completed: CheckCircle2,
  plan_to_watch: Bookmark,
  dropped: XCircle,
};

export function ShowCard({ userShow, onEdit, onRemove }: ShowCardProps) {
  const router = useRouter();
  const { show, status, rating } = userShow;
  const StatusIcon = statusIcons[status];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div
      className="group relative rounded-2xl bg-surface border border-border overflow-hidden card-hover cursor-pointer"
      onClick={() => router.push(`/shows/${show.id}`)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posterUrl(show)}
          alt={show.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${STATUS_DOT_COLORS[status]} bg-black/50 backdrop-blur-sm border-white/10 text-white`}>
            <StatusIcon className="w-3 h-3" />
            {STATUS_LABELS[status]}
          </Badge>
        </div>

        {/* Menu button */}
        {(onEdit || onRemove) && (
          <div ref={menuRef} className="absolute top-3 right-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-lg bg-surface border border-border shadow-xl py-1 z-20 animate-scale-in">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onEdit(userShow);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-text hover:bg-surface-hover transition-colors"
                  >
                    Edit entry
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onRemove(userShow);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-display font-bold text-white text-sm leading-tight mb-1 line-clamp-2">
            {show.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>TV Show</span>
            {show.release_date && (
              <>
                <span>·</span>
                <span>{new Date(show.release_date).getFullYear()}</span>
              </>
            )}
            {show.vote_average && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-warning text-warning" />
                  {show.vote_average.toFixed(1)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Personal info bar */}
      {(rating !== null || userShow.moods.length > 0) && (
        <div className="px-3 py-2.5 flex items-center justify-between gap-2">
          {rating !== null && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-warning text-warning" />
              <span className="text-sm font-medium text-text">{rating}/10</span>
            </div>
          )}
          {userShow.moods.length > 0 && (
            <div className="flex items-center gap-1.5">
              {userShow.moods.slice(0, 3).map((mood) => {
                const MoodIcon = MOOD_ICONS[mood];
                return <MoodIcon key={mood} className="w-3.5 h-3.5 text-primary/70" />;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
