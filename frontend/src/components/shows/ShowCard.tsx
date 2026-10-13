"use client";

import type { UserShow } from "@/types";
import { STATUS_LABELS, STATUS_DOT_COLORS } from "@/lib/constants";
import { posterSrc } from "@/lib/media";
import { Star, Play, CheckCircle2, Bookmark, XCircle, MoreVertical } from "lucide-react";
import { MOOD_ICONS } from "@/lib/mood-icons";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Artwork } from "@/components/ui/Artwork";
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

  const year = show.release_date ? new Date(show.release_date).getFullYear() : null;

  return (
    <div
      className="group relative rounded-2xl bg-surface border border-border overflow-hidden card-hover cursor-pointer"
      onClick={() => router.push(`/shows/${userShow.id}`)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-bg">
        <Artwork
          src={posterSrc(show)}
          alt={show.title}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
          className="transition-transform duration-500 group-hover:scale-105"
        />

        {/* Status badge */}
        <div className="absolute top-2.5 left-2.5">
          <Badge className={`${STATUS_DOT_COLORS[status]} bg-black/55 backdrop-blur-sm border-white/10 text-white`}>
            <StatusIcon className="w-3 h-3" />
            {STATUS_LABELS[status]}
          </Badge>
        </div>

        {/* Menu button */}
        {(onEdit || onRemove) && (
          <div ref={menuRef} className="absolute top-2.5 right-2.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 rounded-lg bg-black/55 backdrop-blur-sm text-white/85 hover:text-white hover:bg-black/75 transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-lg bg-surface border border-border shadow-xl py-1 z-30 animate-scale-in">
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
      </div>

      {/* Info (TMDB-like) */}
      <div className="p-3">
        <h3 className="font-display font-bold text-text text-sm leading-tight line-clamp-2">{show.title}</h3>
        <p className="text-xs text-text-subtle mt-0.5">
          {year ? `${year} · ` : ""}Serie
        </p>

        {(rating !== null || userShow.moods.length > 0) && (
          <div className="flex items-center justify-between gap-2 mt-1.5">
            {rating !== null ? (
              <span className="flex items-center gap-1 text-xs font-medium text-text">
                <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                {rating}/10
              </span>
            ) : (
              <span />
            )}
            {userShow.moods.length > 0 && (
              <div className="flex items-center gap-1">
                {userShow.moods.slice(0, 4).map((mood) => {
                  const MoodIcon = MOOD_ICONS[mood];
                  return <MoodIcon key={mood} className="w-3.5 h-3.5 text-primary/70" />;
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
