"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import type { ToastType } from "@/types";

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const colorMap: Record<ToastType, string> = {
  success: "text-success border-success/30",
  error: "text-error border-error/30",
  info: "text-primary border-primary/30",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl bg-surface border ${colorMap[toast.type]} shadow-lg animate-slide-in-right`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm text-text">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-text-subtle hover:text-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
