import { type ReactNode } from "react";
import { Spinner } from "./Spinner";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {icon && <div className="mb-4 p-4 rounded-2xl gradient-primary-soft text-primary">{icon}</div>}
      <h3 className="font-display text-xl font-bold text-text mb-2">{title}</h3>
      {description && <p className="text-text-muted max-w-md mb-6">{description}</p>}
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Spinner size={32} className="text-primary" />
      <p className="text-text-muted text-sm">{label}</p>
    </div>
  );
}
