"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Show, UserShow, TMDBSearchResult, ShowStatus, Mood, TimeCommit } from "@/types";
import * as tmdbService from "@/services/tmdb.service";
import * as showsService from "@/services/shows.service";
import { ShowFormModal } from "@/components/shows/ShowFormModal";
import { useToast } from "@/hooks/useToast";

interface ShowModalContextValue {
  openAddModal: (result: TMDBSearchResult) => void;
  openEditModal: (userShow: UserShow) => void;
}

const ShowModalContext = createContext<ShowModalContextValue | null>(null);

export function ShowModalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState<Show | null>(null);
  const [editingEntry, setEditingEntry] = useState<UserShow | null>(null);

  const openAddModal = useCallback(
    async (result: TMDBSearchResult) => {
      const details = await tmdbService.fetchDetailsById(result.id, result.media_type);
      if (!details) {
        addToast("error", "Could not load show details");
        return;
      }
      setShow(details);
      setEditingEntry(null);
      setOpen(true);
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
          await showsService.updateUserShow(editingEntry.id, data);
          addToast("success", `Updated "${show.title}"`);
        } else {
          await showsService.addUserShow({ show, ...data });
          addToast("success", `Added "${show.title}" to your log`);
        }
        setOpen(false);
        setEditingEntry(null);
        setShow(null);
        router.push("/dashboard");
        router.refresh();
      } catch {
        addToast("error", "Something went wrong");
      }
    },
    [show, editingEntry, addToast, router],
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
