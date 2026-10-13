"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { UserShow } from "@/types";
import * as showService from "@/services/show.service";
import type { AddShowInput } from "@/services/show.service";
import type { UserShowInput } from "@/lib/mappers";
import { useAuth } from "./useAuth";

interface ShowsContextValue {
  shows: UserShow[];
  loading: boolean;
  error: string | null;
  addShow: (input: AddShowInput) => Promise<UserShow>;
  updateShow: (userShowId: string, updates: Partial<UserShowInput>) => Promise<void>;
  removeShow: (userShowId: string) => Promise<void>;
  reload: () => Promise<void>;
}

const ShowsContext = createContext<ShowsContextValue | null>(null);

export function ShowsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [shows, setShows] = useState<UserShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setShows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setShows(await showService.fetchUserShows(user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shows");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const addShow = useCallback(async (input: AddShowInput) => {
    const created = await showService.addUserShow(input);
    setShows((prev) => [created, ...prev.filter((us) => us.id !== created.id)]);
    return created;
  }, []);

  const updateShow = useCallback(async (userShowId: string, updates: Partial<UserShowInput>) => {
    const hasChange =
      updates.status !== undefined ||
      updates.rating !== undefined ||
      updates.moods !== undefined ||
      updates.time_commit !== undefined;
    if (hasChange) {
      await showService.updateUserShow(userShowId, updates);
    }
    setShows((prev) =>
      prev.map((us) =>
        us.id === userShowId
          ? {
              ...us,
              status: updates.status ?? us.status,
              rating: updates.rating !== undefined ? updates.rating : us.rating,
              moods: updates.moods ?? us.moods,
              time_commit: updates.time_commit !== undefined ? updates.time_commit : us.time_commit,
            }
          : us,
      ),
    );
  }, []);

  const removeShow = useCallback(async (userShowId: string) => {
    await showService.removeUserShow(userShowId);
    setShows((prev) => prev.filter((us) => us.id !== userShowId));
  }, []);

  return (
    <ShowsContext.Provider value={{ shows, loading, error, addShow, updateShow, removeShow, reload: load }}>
      {children}
    </ShowsContext.Provider>
  );
}

export function useShows() {
  const ctx = useContext(ShowsContext);
  if (!ctx) throw new Error("useShows must be used within ShowsProvider");
  return ctx;
}
