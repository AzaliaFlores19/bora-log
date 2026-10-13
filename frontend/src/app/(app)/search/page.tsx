"use client";

import { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, X, TrendingUp } from "lucide-react";
import type { TMDBSearchResult } from "@/types";
import * as showService from "@/services/show.service";
import { useShows } from "@/hooks/useShows";
import { useShowModal } from "@/components/shows/ShowModalProvider";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";
import { Artwork } from "@/components/ui/Artwork";
import { searchPosterSrc } from "@/lib/media";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [trending, setTrending] = useState<TMDBSearchResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { shows } = useShows();
  const trackedIds = new Set(shows.map((us) => us.show.tmdb_id));
  const { openAddModal } = useShowModal();

  useEffect(() => {
    showService.fetchTrending().then(setTrending).catch(() => setTrending([]));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await showService.searchShows(query);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
        setHasSearched(true);
      }
    }, 400);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-2xl font-extrabold text-text mb-6">Search Shows</h1>

      {/* Search bar */}
      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-subtle pointer-events-none" />
        <input
          type="text"
          placeholder="Search for TV shows..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-surface border border-border text-text placeholder:text-text-subtle focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <LoadingState label="Searching..." />
      ) : hasSearched ? (
        results.length === 0 ? (
          <EmptyState
            icon={<SearchIcon className="w-8 h-8" />}
            title="No results found"
            description={`No shows match "${query}". Try a different search.`}
          />
        ) : (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm text-text-muted mb-2">
              {results.length} result{results.length !== 1 && "s"}
            </p>
            {results.map((r) => (
              <SearchResultCard key={r.id} result={r} isTracked={trackedIds.has(r.id)} onAdd={openAddModal} />
            ))}
          </div>
        )
      ) : (
        /* Trending */
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-text">Trending Now</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {trending.map((r) => {
              return (
                <div
                  key={r.id}
                  className="group rounded-2xl bg-surface border border-border overflow-hidden card-hover cursor-pointer"
                  onClick={() => openAddModal(r)}
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-bg">
                    <Artwork
                      src={searchPosterSrc(r)}
                      alt={r.title}
                      sizes="(max-width: 640px) 45vw, 22vw"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-display font-bold text-text text-sm leading-tight line-clamp-2">{r.title}</h3>
                    <p className="text-xs text-text-subtle mt-0.5">
                      {r.release_date ? `${new Date(r.release_date).getFullYear()} · ` : ""}Serie
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
