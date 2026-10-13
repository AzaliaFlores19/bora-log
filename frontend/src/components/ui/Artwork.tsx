import Image from "next/image";
import { Clapperboard } from "lucide-react";

interface ArtworkProps {
  src: string | null;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  iconClassName?: string;
  objectFit?: "cover" | "contain";
}

/**
 * Fills a `relative` and sized parent with an optimized image.
 * Falls back to a neutral gradient when there is no image URL.
 */
export function Artwork({
  src,
  alt,
  sizes = "(max-width: 768px) 50vw, 220px",
  className = "",
  priority = false,
  iconClassName = "w-1/3 h-1/3 max-w-10 max-h-10 text-text-subtle/40",
  objectFit = "cover",
}: ArtworkProps) {
  if (!src) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-hover to-bg ${className}`}
      >
        <Clapperboard className={iconClassName} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`${objectFit === "contain" ? "object-contain" : "object-cover"} ${className}`}
    />
  );
}
