import {Request, Response} from 'express';
import prisma from '../lib/prisma.js';
import * as tmdbService from "../services/tmdbService.js";
import { AuthRequest } from '../middleware/authMiddleware.js';

export const searchShows = async (req: Request, res: Response) => {
    try {
        const {title} = req.query;
        

        if(!title){
            return res.status(400).json({message: "Title is required"});
        }

        const results = await tmdbService.searchMulti(title as string);
        res.status(200).json({results});
    } catch (error) {
        res.status(500).json({message: "Error searching shows"});
    }
}


export const addShowToList = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { showData, userShowData } = req.body;


        if (!userId) return res.status(401).json({ message: "User not authenticated" });


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


        const result = await prisma.userShow.upsert({
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


        res.status(201).json({ message: "Show processed successfully", userShow: result });
    } catch (error: any) {
        console.error("PRISMA ERROR:", error);
        res.status(500).json({ message: "Error adding show to list", error: error.message });
    }
}

export const getUserList = async (req: AuthRequest, res: Response) => {
  try {
        const { userId: paramsUserId } = req.params; 
        const loggedInUserId = req.user?.id;
        const isAdmin = req.user?.role === "ADMIN";

        const targetUserId = (paramsUserId && isAdmin) ? paramsUserId : loggedInUserId;

        if (!targetUserId) return res.status(401).json({ message: "User not authenticated" });
        
        const { mood, time_commit, status } = req.query; 

        const filters: any = { user_id: targetUserId };

        if (status) filters.status = status;
        if (time_commit) filters.time_commit = time_commit;

        if (mood) {
            if (Array.isArray(mood)) {
                filters.mood = { hasSome: mood as string[] };
            } else {
                filters.mood = { has: mood as string };
            }
        }

        const userShows = await prisma.userShow.findMany({
            where: filters,
            include: { show: true },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ userShows });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user list" });
    } 
}
export const updateShowInList = async (req: AuthRequest, res: Response) => {
    try {
        const { userShowId } = req.params; 
        const userId = req.user?.id;
        
        if (!userId) return res.status(401).json({ message: "User not authenticated" });

        const { status, rating, mood, time_commit } = req.body;

        const updateResponse = await prisma.userShow.updateMany({
            where: {
                id: userShowId as string,
                user_id: userId 
            },
            data: {
                status,
                rating: rating ? Number(rating) : undefined,
                mood,
                time_commit
            },
        });

        if (updateResponse.count === 0) {
            return res.status(404).json({ message: "Show not found or unauthorized" });
        }

        res.status(200).json({ message: "Show updated successfully" });
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: "Error updating show in list" });
    }
}


export const removeShowFromList = async (req: AuthRequest, res: Response) => {
    try {
        const {userShowId} = req.params;
        const userId = req.user?.id;
        
        const show = await prisma.userShow.findUnique({ where: { id: userShowId as string } });
        
        if (!show || show.user_id !== userId) {
            return res.status(403).json({ message: "No tienes permiso para borrar este show" });
        }

        await prisma.userShow.delete({
            where: { id: userShowId as string }
        });

        res.status(200).json({message: "Show removed from list successfully"});
    } catch (error) {
        res.status(500).json({message: "Error removing show from list"});
    }
}

export const getShowDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { showId } = req.params;
        const userId = req.user?.id;
        
        const userShowEntry = await prisma.userShow.findUnique({
            where: { id: showId as string },
            include: { show: true } 
        });

        if (!userShowEntry || userShowEntry.user_id !== userId) {
            return res.status(404).json({ message: "Show not found in your list" });
        }

        res.status(200).json(userShowEntry);
    } catch (error) {
        res.status(500).json({ message: "Error fetching show details" });
    }
}

export const getExternalShowDetails = async (req: Request, res: Response) => {
    try {
        const { id, mediaType } = req.params;
        const details = await tmdbService.getExternalDetails(id as string, mediaType as string);
        res.status(200).json(details);
    } catch (error) {
        res.status(500).json({ message: "Error fetching details from TMDB" });
    }
};


