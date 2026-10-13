import { Star } from "lucide-react";

interface RatingStarsProps {
  value: number | null;
  max?: number;
  size?: number;
  onChange?: (value: number) => void;
}

export function RatingStars({ value, max = 10, size = 16, onChange }: RatingStarsProps) {
  const interactive = !!onChange;
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < (value ?? 0);
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(i + 1)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            <Star
              width={size}
              height={size}
              className={filled ? "fill-warning text-warning" : "text-text-subtle"}
            />
          </button>
        );
      })}
    </div>
  );
}
