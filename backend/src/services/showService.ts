import prisma from "../lib/prisma.js";
import * as tmdbService from "./tmdbService.js";

export const showService = {
    async searchShows(title: string) {
        return await tmdbService.searchMulti(title);
    },

    async addShow(userId: string, showData: any, userShowData: any) {
        let fullShowData = { ...showData };
        if (!showData.duration || !showData.totalEpisodes) {
            const externalDetails = await tmdbService.getExternalDetails(showData.external_id, showData.mediaType);
            fullShowData = { ...fullShowData, ...externalDetails };
        }

        const show = await prisma.show.upsert({
            where: {
                external_id_mediaType: {
                    external_id: String(fullShowData.external_id),
                    mediaType: fullShowData.mediaType
                }
            },
            update: {},
            create: {
                external_id: String(fullShowData.external_id),
                title: fullShowData.title,
                description: fullShowData.description || "",
                mediaType: fullShowData.mediaType,
                imageUrl: fullShowData.imageUrl || fullShowData.poster_path,
                duration: fullShowData.duration || 0,
                totalEpisodes: fullShowData.totalEpisodes || 0,
                releaseDate: fullShowData.releaseDate ? new Date(fullShowData.releaseDate).toISOString() : null
            }
        });

        return await prisma.userShow.upsert({
            where: {
                user_id_show_id: {
                    user_id: userId,
                    show_id: show.id
                }
            },
            update: {
                status: userShowData.status,
                rating: userShowData.rating ? Number(userShowData.rating) : undefined,
                mood: userShowData.mood,
                time_commit: userShowData.time_commit
            },
            create: {
                user_id: userId,
                show_id: show.id,
                status: userShowData.status,
                rating: userShowData.rating ? Number(userShowData.rating) : undefined,
                mood: userShowData.mood,
                time_commit: userShowData.time_commit
            },
            include: { show: true }
        });
    },

    async getUserShows(userId: string, filters: any) {
        return await prisma.userShow.findMany({
            where: filters,
            include: { show: true },
            orderBy: { createdAt: 'desc' }
        });
    },

    async updateShowEntry(userShowId: string, userId: string, data: any) {
        const { status, rating, mood, time_commit } = data;
        return await prisma.userShow.updateMany({
            where: { id: userShowId, user_id: userId },
            data: {
                status,
                rating: rating ? Number(rating) : undefined,
                mood,
                time_commit
            }
        });
    },

    async removeShow(userShowId: string, userId: string) {
        const show = await prisma.userShow.findUnique({ where: { id: userShowId } });
        if (!show || show.user_id !== userId) return null;
        return await prisma.userShow.delete({ where: { id: userShowId } });
    },

    async getShowDetails(userShowId: string, userId: string) {
        const entry = await prisma.userShow.findUnique({
            where: { id: userShowId },
            include: { show: true }
        });
        if (!entry || entry.user_id !== userId) return null;
        return entry;
    },

    async getExternalDetails(id: string, mediaType: string) {
        return await tmdbService.getExternalDetails(id, mediaType);
    },

    async getAllUserShows() {
        return await prisma.userShow.findMany({
            include: {
                show: true,
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
};
