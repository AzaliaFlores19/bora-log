import type { TMDBSearchResult } from "@/types";
import { searchPosterSrc } from "@/lib/media";
import { Artwork } from "@/components/ui/Artwork";
import { Star, Plus, Check, Tv } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface SearchResultCardProps {
  result: TMDBSearchResult;
  isTracked: boolean;
  onAdd: (result: TMDBSearchResult) => void;
}

export function SearchResultCard({ result, isTracked, onAdd }: SearchResultCardProps) {
  return (
    <div className="group flex gap-4 rounded-2xl bg-surface border border-border p-3 card-hover">
      {/* Poster */}
      <div className="relative w-20 sm:w-24 aspect-[2/3] flex-shrink-0 rounded-xl overflow-hidden bg-bg">
        <Artwork src={searchPosterSrc(result)} alt={result.title} sizes="96px" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-text text-sm sm:text-base line-clamp-1">
              {result.title}
            </h3>
            <Badge className="border-border bg-bg/50 text-text-subtle flex-shrink-0">
              <Tv className="w-3 h-3" />
              TV Show
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-subtle mt-1">
            {result.release_date && <span>{new Date(result.release_date).getFullYear()}</span>}
            {result.vote_average && (
              <>
                {result.release_date && <span>·</span>}
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-warning text-warning" />
                  {result.vote_average.toFixed(1)}
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-text-muted mt-2 line-clamp-2 hidden sm:block">
            {result.overview || "No description available."}
          </p>
        </div>

        <div className="mt-2">
          {isTracked ? (
            <Button variant="secondary" size="sm" disabled>
              <Check className="w-4 h-4" />
              In Your Log
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => onAdd(result)}>
              <Plus className="w-4 h-4" />
              Add to Log
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
