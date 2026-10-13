import prisma from "../lib/prisma.js";
import * as tmdbService from "./tmdbService.js";
import type { Mood } from "@prisma/client";

type UserShowData = {
  status?: "watching" | "completed" | "plan_to_watch" | "dropped" | null;
  rating?: number | null;
  mood?: Mood[];
  time_commit?: "around_30_min" | "between_1_and_3_hours" | "binge" | null;
};

type ShowListFilters = {
  status?: string;
  time_commit?: string;
  mood?: string | string[];
};

export const showService = {
  async searchShows(title: string, mediaType?: string) {
    return await tmdbService.searchMulti(title, mediaType);
  },

  async getTrending(mediaType?: string) {
    return await tmdbService.getTrending(mediaType);
  },

  async addShow(userId: string, showData: any, userShowData: UserShowData) {
    let fullShowData = { ...showData };

    // Just-in-time enrichment: only hit TMDB when the local payload is incomplete.
    if (!showData.duration || !showData.totalEpisodes) {
      const externalDetails = await tmdbService.getExternalDetails(String(showData.external_id), showData.mediaType);
      fullShowData = { ...fullShowData, ...externalDetails };
    }

    const showPayload = {
      title: fullShowData.title,
      description: fullShowData.description || "",
      imageUrl: fullShowData.imageUrl || fullShowData.poster_path || null,
      duration: fullShowData.duration ?? 0,
      totalEpisodes: fullShowData.totalEpisodes ?? 0,
      releaseDate: fullShowData.releaseDate ? new Date(fullShowData.releaseDate).toISOString() : null,
    };

    const show = await prisma.show.upsert({
      where: {
        external_id_mediaType: {
          external_id: String(fullShowData.external_id),
          mediaType: fullShowData.mediaType,
        },
      },
      update: showPayload, // keep the cached catalog entry fresh
      create: {
        external_id: String(fullShowData.external_id),
        mediaType: fullShowData.mediaType,
        ...showPayload,
      },
    });

    const entryData = {
      status: userShowData.status ?? undefined,
      rating: userShowData.rating ?? null,
      mood: userShowData.mood,
      time_commit: userShowData.time_commit ?? undefined,
    };

    return await prisma.userShow.upsert({
      where: {
        user_id_show_id: {
          user_id: userId,
          show_id: show.id,
        },
      },
      // deletedAt: null restores the entry if the user had soft-deleted it before.
      update: { ...entryData, deletedAt: null },
      create: {
        user_id: userId,
        show_id: show.id,
        ...entryData,
      },
      include: { show: true },
    });
  },

  async getUserShows(userId: string, filters: ShowListFilters) {
    const where: any = { user_id: userId, deletedAt: null };
    if (filters.status) where.status = filters.status;
    if (filters.time_commit) where.time_commit = filters.time_commit;
    if (filters.mood) {
      where.mood = Array.isArray(filters.mood) ? { hasSome: filters.mood } : { has: filters.mood };
    }

    return await prisma.userShow.findMany({
      where,
      include: { show: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async updateShowEntry(userShowId: string, userId: string, data: UserShowData) {
    // Only touch the fields the client actually sent (explicit null clears a value).
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.mood !== undefined) updateData.mood = data.mood;
    if (data.time_commit !== undefined) updateData.time_commit = data.time_commit;

    return await prisma.userShow.updateMany({
      where: { id: userShowId, user_id: userId, deletedAt: null },
      data: updateData,
    });
  },

  /** Logical delete of a user's log entry. Returns true when something was removed. */
  async removeShow(userShowId: string, userId: string) {
    const result = await prisma.userShow.updateMany({
      where: { id: userShowId, user_id: userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return result.count > 0;
  },

  async getShowDetails(userShowId: string, userId: string) {
    return await prisma.userShow.findFirst({
      where: { id: userShowId, user_id: userId, deletedAt: null },
      include: { show: true },
    });
  },

  async getExternalDetails(id: string, mediaType: string) {
    return await tmdbService.getExternalDetails(id, mediaType);
  },

  async getAllUserShows() {
    return await prisma.userShow.findMany({
      where: { deletedAt: null },
      include: {
        show: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
