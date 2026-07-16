import { Request, Response } from 'express';
import { showService } from '../services/showService.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

/**
 * @openapi
 * /api/shows/search:
 *   get:
 *     summary: Search shows
 *     tags: [Shows]
 *     parameters:
 *       - in: query
 *         name: title
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Search results" }
 *       400: { description: "Title required" }
 */
export const searchShows = async (req: Request, res: Response) => {
    try {
        const { title } = req.query;
        if (!title) return res.status(400).json({ message: "Title is required" });
        const results = await showService.searchShows(title as string);
        res.status(200).json({ results });
    } catch (error) {
        res.status(500).json({ message: "Error searching shows" });
    }
};

/**
 * @openapi
 * /api/shows:
 *   post:
 *     summary: Add show to list
 *     tags: [Shows]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               showData: { type: object }
 *               userShowData: { type: object }
 *     responses:
 *       201: { description: "Show processed" }
 */
export const addShowToList = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "User not authenticated" });
        const result = await showService.addShow(userId, req.body.showData, req.body.userShowData);
        res.status(201).json({ message: "Show processed successfully", userShow: result });
    } catch (error: any) {
        res.status(500).json({ message: "Error adding show to list", error: error.message });
    }
};

/**
 * @openapi
 * /api/shows/list/{userId}:
 *   get:
 *     summary: Get user list
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: false
 *         schema: { type: string }
 *     responses:
 *       200: { description: "User show list" }
 */
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
            filters.mood = Array.isArray(mood) ? { hasSome: mood } : { has: mood };
        }

        const userShows = await showService.getUserShows(targetUserId as string, filters);
        res.status(200).json({ userShows });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user list" });
    }
};

/**
 * @openapi
 * /api/shows/{userShowId}:
 *   put:
 *     summary: Update show in list
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: userShowId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Show updated" }
 */
export const updateShowInList = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "User not authenticated" });
        const result = await showService.updateShowEntry(req.params.userShowId as string, userId, req.body);
        if (result.count === 0) return res.status(404).json({ message: "Show not found or unauthorized" });
        res.status(200).json({ message: "Show updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating show in list" });
    }
};

/**
 * @openapi
 * /api/shows/{userShowId}:
 *   delete:
 *     summary: Remove show from list
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: userShowId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Show removed" }
 */
export const removeShowFromList = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "User not authenticated" });
        const result = await showService.removeShow(req.params.userShowId as string, userId);
        if (!result) return res.status(403).json({ message: "No tienes permiso para borrar este show" });
        res.status(200).json({ message: "Show removed from list successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error removing show from list" });
    }
};

/**
 * @openapi
 * /api/shows/details/{showId}:
 *   get:
 *     summary: Get show details
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: showId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Show details" }
 */
export const getShowDetails = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "User not authenticated" });
        const entry = await showService.getShowDetails(req.params.showId as string, userId);
        if (!entry) return res.status(404).json({ message: "Show not found in your list" });
        res.status(200).json(entry);
    } catch (error) {
        res.status(500).json({ message: "Error fetching show details" });
    }
};

/**
 * @openapi
 * /api/shows/external/{id}/{mediaType}:
 *   get:
 *     summary: Get external show details
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: mediaType
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "TMDB show details" }
 */
export const getExternalShowDetails = async (req: Request, res: Response) => {
    try {
        const details = await showService.getExternalDetails(req.params.id as string, req.params.mediaType as string);
        res.status(200).json(details);
    } catch (error) {
        res.status(500).json({ message: "Error fetching details from TMDB" });
    }
};

/**
 * @openapi
 * /api/shows/all-user-shows:
 *   get:
 *     summary: Get all user shows (Admin only)
 *     tags: [Shows]
 *     responses:
 *       200: { description: "List of all user shows" }
 *       403: { description: "Access denied" }
 */
export const getAllUserShows = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== "ADMIN") return res.status(403).json({ message: "Access denied." });
        const allShows = await showService.getAllUserShows();
        res.status(200).json({ allShows });
    } catch (error) {
        res.status(500).json({ message: "Error fetching all user shows" });
    }
};
