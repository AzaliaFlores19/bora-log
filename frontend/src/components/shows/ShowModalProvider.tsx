"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Show, UserShow, TMDBSearchResult, ShowStatus, Mood, TimeCommit } from "@/types";
import * as showService from "@/services/show.service";
import { ShowFormModal } from "@/components/shows/ShowFormModal";
import { useToast } from "@/hooks/useToast";
import { useShows } from "@/hooks/useShows";

interface ShowModalContextValue {
  openAddModal: (result: TMDBSearchResult) => void;
  openEditModal: (userShow: UserShow) => void;
}

const ShowModalContext = createContext<ShowModalContextValue | null>(null);

export function ShowModalProvider({ children }: { children: ReactNode }) {
  const { addShow, updateShow } = useShows();
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState<Show | null>(null);
  const [editingEntry, setEditingEntry] = useState<UserShow | null>(null);

  const openAddModal = useCallback(
    async (result: TMDBSearchResult) => {
      try {
        const details = await showService.fetchExternalDetails(result.id, result.media_type);
        setShow(details);
        setEditingEntry(null);
        setOpen(true);
      } catch {
        addToast("error", "Could not load show details");
      }
    },
    [addToast],
  );

  const openEditModal = useCallback((userShow: UserShow) => {
    setShow(userShow.show);
    setEditingEntry(userShow);
    setOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (data: {
      status: ShowStatus;
      rating: number | null;
      moods: Mood[];
      time_commit: TimeCommit | null;
    }) => {
      if (!show) return;
      try {
        if (editingEntry) {
          await updateShow(editingEntry.id, data);
          addToast("success", `Updated "${show.title}"`);
        } else {
          await addShow({ show, ...data });
          addToast("success", `Added "${show.title}" to your log`);
        }
        setOpen(false);
        setEditingEntry(null);
        setShow(null);
      } catch (err) {
        addToast("error", err instanceof Error ? err.message : "Something went wrong");
      }
    },
    [show, editingEntry, addShow, updateShow, addToast],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditingEntry(null);
    setShow(null);
  }, []);

  return (
    <ShowModalContext.Provider value={{ openAddModal, openEditModal }}>
      {children}
      <ShowFormModal
        open={open}
        onClose={handleClose}
        show={show}
        existingEntry={editingEntry}
        onSubmit={handleSubmit}
      />
    </ShowModalContext.Provider>
  );
}

export function useShowModal() {
  const ctx = useContext(ShowModalContext);
  if (!ctx) throw new Error("useShowModal must be used within ShowModalProvider");
  return ctx;
}
