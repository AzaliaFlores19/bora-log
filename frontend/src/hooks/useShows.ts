"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserShow } from "@/types";
import * as showsService from "@/services/shows.service";
import { useAuth } from "./useAuth";

export function useShows() {
  const { user } = useAuth();
  const [shows, setShows] = useState<UserShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShows = useCallback(async () => {
    if (!user) {
      setShows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await showsService.fetchUserShows();
      setShows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shows");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadShows();
  }, [loadShows]);

  const addShow = useCallback(async (input: showsService.AddShowInput) => {
    const newUserShow = await showsService.addUserShow(input);
    setShows((prev) => [...prev, newUserShow]);
    return newUserShow;
  }, []);

  const updateShow = useCallback(
    async (
      userShowId: string,
      updates: Partial<Pick<UserShow, "status" | "rating" | "moods" | "time_commit">>,
    ) => {
      const updated = await showsService.updateUserShow(userShowId, updates);
      setShows((prev) => prev.map((us) => (us.id === userShowId ? updated : us)));
      return updated;
    },
    [],
  );

  const removeShow = useCallback(async (userShowId: string) => {
    await showsService.removeUserShow(userShowId);
    setShows((prev) => prev.filter((us) => us.id !== userShowId));
  }, []);

  return { shows, loading, error, addShow, updateShow, removeShow, reload: loadShows };
}
