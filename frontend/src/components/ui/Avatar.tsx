import { readableTextColor } from "@/lib/avatar-colors";

interface AvatarProps {
  name: string;
  color?: string | null;
  size?: number;
  rounded?: "full" | "xl";
  className?: string;
}

export function Avatar({ name, color, size = 40, rounded = "full", className = "" }: AvatarProps) {
  const initial = name?.charAt(0).toUpperCase() || "?";
  const radius = rounded === "full" ? "rounded-full" : "rounded-2xl";
  const background = color ?? undefined;

  return (
    <div
      className={`flex items-center justify-center font-display font-extrabold select-none ${
        color ? "" : "gradient-primary text-primary-fg"
      } ${radius} ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        background,
        color: color ? readableTextColor(color) : undefined,
      }}
    >
      {initial}
    </div>
  );
}
