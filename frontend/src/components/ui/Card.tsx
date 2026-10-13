import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-surface border border-border ${hover ? "card-hover cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
