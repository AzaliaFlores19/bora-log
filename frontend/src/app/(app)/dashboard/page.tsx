"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Clapperboard,
  Eye,
  CheckCircle2,
  Bookmark,
  XCircle,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { UserShow, ShowStatus, Mood, TimeCommit } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useShows } from "@/hooks/useShows";
import { useToast } from "@/hooks/useToast";
import { useShowModal } from "@/components/shows/ShowModalProvider";
import { ShowCard } from "@/components/shows/ShowCard";
import { FilterBar } from "@/components/shows/FilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";

const ITEMS_PER_PAGE = 6;

const STAT_CARDS: Array<{
  key: ShowStatus;
  label: string;
  icon: typeof Eye;
  numberClass: string;
  activeBorder: string;
}> = [
  { key: "completed", label: "Completed", icon: CheckCircle2, numberClass: "text-emerald-500", activeBorder: "border-emerald-400" },
  { key: "watching", label: "Watching", icon: Eye, numberClass: "text-sky-500", activeBorder: "border-sky-400" },
  { key: "plan_to_watch", label: "Planned", icon: Bookmark, numberClass: "text-amber-500", activeBorder: "border-amber-400" },
  { key: "dropped", label: "Dropped", icon: XCircle, numberClass: "text-rose-500", activeBorder: "border-rose-400" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { shows, loading, removeShow } = useShows();
  const { addToast } = useToast();
  const { openEditModal } = useShowModal();
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<ShowStatus | "all">("all");
  const [moodFilter, setMoodFilter] = useState<Mood | "all">("all");
  const [tcFilter, setTcFilter] = useState<TimeCommit | "all">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const c: Record<ShowStatus, number> = { watching: 0, completed: 0, plan_to_watch: 0, dropped: 0 };
    shows.forEach((us) => c[us.status]++);
    return c;
  }, [shows]);

  const moodsPresent = useMemo(() => {
    const s = new Set<Mood>();
    shows.forEach((us) => us.moods.forEach((m) => s.add(m)));
    return Array.from(s);
  }, [shows]);

  const tcPresent = useMemo(() => {
    const s = new Set<TimeCommit>();
    shows.forEach((us) => {
      if (us.time_commit) s.add(us.time_commit);
    });
    return Array.from(s);
  }, [shows]);

  const filtered = useMemo(
    () =>
      shows.filter((us) => {
        if (statusFilter !== "all" && us.status !== statusFilter) return false;
        if (moodFilter !== "all" && !us.moods.includes(moodFilter)) return false;
        if (tcFilter !== "all" && us.time_commit !== tcFilter) return false;
        return true;
      }),
    [shows, statusFilter, moodFilter, tcFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const hasActiveFilters = statusFilter !== "all" || moodFilter !== "all" || tcFilter !== "all";

  function resetFilters() {
    setStatusFilter("all");
    setMoodFilter("all");
    setTcFilter("all");
    setPage(1);
  }

  async function handleRemove(us: UserShow) {
    try {
      await removeShow(us.id);
      addToast("success", `Removed "${us.show.title}" from your log`);
    } catch {
      addToast("error", "Failed to remove show");
    }
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-5 mb-8">
          <Skeleton className="w-24 h-24 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="hidden md:grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-32 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* ── Profile header ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        {/* Avatar + info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <Avatar
              name={user?.username ?? "?"}
              color={user?.avatar_color}
              size={80}
              className="ring-2 ring-border ring-offset-2 ring-offset-bg"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-bg" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-extrabold text-text truncate">{user?.username ?? "User"}</h1>
            <p className="text-sm text-text-muted truncate">{user?.email}</p>
            <p className="text-sm font-semibold text-text mt-0.5">{shows.length} shows tracked</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full sm:w-auto flex-shrink-0">
          {STAT_CARDS.map(({ key, label, numberClass, activeBorder }) => {
            const isActive = statusFilter === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setStatusFilter(isActive ? "all" : key);
                  setPage(1);
                }}
                className={`flex flex-col items-center justify-center min-w-0 sm:w-24 h-[76px] sm:h-20 rounded-2xl border-2 bg-surface transition-all duration-200 hover:scale-[1.02] ${
                  isActive ? activeBorder + " shadow-md" : "border-border hover:border-primary/30"
                }`}
              >
                <span className={`font-display text-2xl font-bold ${numberClass}`}>{counts[key]}</span>
                <span className="text-xs text-text-muted mt-0.5">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── My Log bar ────────────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-0">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-xl font-bold text-text">My Log</h2>
            <span className="text-sm text-text-subtle">
              ({filtered.length} of {shows.length})
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                filtersOpen || hasActiveFilters
                  ? "border-primary/50 text-primary bg-primary/5"
                  : "border-border text-text-muted hover:border-primary/30 hover:text-text"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full gradient-primary text-primary-fg text-[10px] font-bold flex items-center justify-center">
                  {(statusFilter !== "all" ? 1 : 0) + (moodFilter !== "all" ? 1 : 0) + (tcFilter !== "all" ? 1 : 0)}
                </span>
              )}
            </button>
            <Button onClick={() => router.push("/search")}>
              <Search className="w-4 h-4" />
              Add Show
            </Button>
          </div>
        </div>

        {/* Filters panel (slide in/out) */}
        {filtersOpen && (
          <div className="mt-2 animate-fade-in">
            <FilterBar
              statusFilter={statusFilter}
              onStatusChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              moodFilter={moodFilter}
              onMoodChange={(v) => {
                setMoodFilter(v);
                setPage(1);
              }}
              timeCommitFilter={tcFilter}
              onTimeCommitChange={(v) => {
                setTcFilter(v);
                setPage(1);
              }}
              counts={counts}
              moodsPresent={moodsPresent}
              timeCommitsPresent={tcPresent}
              onClearAll={resetFilters}
            />
          </div>
        )}
      </div>

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      {pageSlice.length === 0 ? (
        shows.length === 0 ? (
          <EmptyState
            icon={<Clapperboard className="w-8 h-8" />}
            title="Your log is empty"
            description="Search for TV shows to start tracking your watching journey."
            action={
              <Button onClick={() => router.push("/search")}>
                <Search className="w-4 h-4" />
                Find Shows
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<Search className="w-8 h-8" />}
            title="No shows match your filters"
            description="Try adjusting your filters to see more of your log."
            action={
              <Button variant="secondary" onClick={resetFilters}>
                Clear Filters
              </Button>
            }
          />
        )
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {pageSlice.map((us) => (
              <ShowCard key={us.id} userShow={us} onEdit={openEditModal} onRemove={handleRemove} />
            ))}
          </div>

          {/* ── Pagination "X / Y" ─────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="p-2 rounded-xl border border-border text-text-muted hover:border-primary/40 hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-text min-w-[64px] text-center">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                className="p-2 rounded-xl border border-border text-text-muted hover:border-primary/40 hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
