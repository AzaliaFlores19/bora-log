import { Request, Response } from "express";
import { showService } from "../services/showService.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import type { ShowListQuery } from "../lib/validation.js";

/**
 * @openapi
 * /api/shows/search:
 *   get:
 *     summary: Search movies and TV shows on TMDB
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
    const { title, mediaType } = (res.locals.query ?? {}) as { title: string; mediaType?: string };
    const results = await showService.searchShows(title, mediaType);
    return res.status(200).json({ results });
  } catch (error) {
    return res.status(500).json({ message: "Error searching shows" });
  }
};

/**
 * @openapi
 * /api/shows/trending:
 *   get:
 *     summary: Trending movies and tv shows on TMDB
 *     tags: [Shows]
 *     responses:
 *       200: { description: "Trending results" }
 */
export const getTrendingShows = async (req: Request, res: Response) => {
  try {
    const { mediaType } = (res.locals.query ?? {}) as { mediaType?: string };
    const results = await showService.getTrending(mediaType);
    return res.status(200).json({ results });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching trending shows" });
  }
};

/**
 * @openapi
 * /api/shows/add-list:
 *   post:
 *     summary: Add a show to the user's list (Just-in-Time persistence)
 *     tags: [Shows]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [showData]
 *             properties:
 *               showData: { type: object }
 *               userShowData: { type: object }
 *     responses:
 *       201: { description: "Show processed" }
 *       400: { description: "Validation error" }
 */
export const addShowToList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });
    const result = await showService.addShow(userId, req.body.showData, req.body.userShowData);
    return res.status(201).json({ message: "Show processed successfully", userShow: result });
  } catch (error: any) {
    return res.status(500).json({ message: "Error adding show to list", error: error.message });
  }
};

/**
 * @openapi
 * /api/shows/user-list/{userId}:
 *   get:
 *     summary: Get a user's tracked shows (own list, or any list if admin)
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: time_commit
 *         schema: { type: string }
 *       - in: query
 *         name: mood
 *         schema: { type: string }
 *     responses:
 *       200: { description: "User show list" }
 *       400: { description: "Validation error" }
 */
export const getUserList = async (req: AuthRequest, res: Response) => {
  try {
    const { userId: rawParamsUserId } = req.params;
    const paramsUserId = Array.isArray(rawParamsUserId) ? rawParamsUserId[0] : rawParamsUserId;
    const loggedInUserId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";
    const targetUserId = paramsUserId && isAdmin ? paramsUserId : loggedInUserId;

    if (!targetUserId) return res.status(401).json({ message: "User not authenticated" });

    const filters = (res.locals.query ?? {}) as Partial<ShowListQuery>;
    const userShows = await showService.getUserShows(targetUserId, filters);
    return res.status(200).json({ userShows });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user list" });
  }
};

/**
 * @openapi
 * /api/shows/update-list/{userShowId}:
 *   patch:
 *     summary: Update a log entry (status, rating, mood, time_commit)
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: userShowId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Show updated" }
 *       404: { description: "Not found or unauthorized" }
 */
export const updateShowInList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });
    const result = await showService.updateShowEntry(req.params.userShowId as string, userId, req.body);
    if (result.count === 0) return res.status(404).json({ message: "Show not found or unauthorized" });
    return res.status(200).json({ message: "Show updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating show in list" });
  }
};

/**
 * @openapi
 * /api/shows/remove-list/{userShowId}:
 *   delete:
 *     summary: Remove a show from the user's list (logical delete)
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: userShowId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Show removed" }
 *       404: { description: "Not found or unauthorized" }
 */
export const removeShowFromList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });
    const removed = await showService.removeShow(req.params.userShowId as string, userId);
    if (!removed) return res.status(404).json({ message: "Show not found in your list" });
    return res.status(200).json({ message: "Show removed from list successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error removing show from list" });
  }
};

/**
 * @openapi
 * /api/shows/show-details/{userShowId}:
 *   get:
 *     summary: Get one of the user's log entries (with the cached show metadata)
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: userShowId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Show details" }
 *       404: { description: "Show not found in your list" }
 */
export const getShowDetails = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });
    const entry = await showService.getShowDetails(req.params.userShowId as string, userId);
    if (!entry) return res.status(404).json({ message: "Show not found in your list" });
    return res.status(200).json(entry);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching show details" });
  }
};

/**
 * @openapi
 * /api/shows/external-show-details/{id}/{mediaType}:
 *   get:
 *     summary: Get full details for a movie or tv show from TMDB
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: mediaType
 *         required: true
 *         schema: { type: string, enum: [movie, tv] }
 *     responses:
 *       200: { description: "TMDB show details" }
 *       400: { description: "Validation error" }
 */
export const getExternalShowDetails = async (req: Request, res: Response) => {
  try {
    const params = (res.locals.params ?? req.params) as { id: string; mediaType: string };
    const details = await showService.getExternalDetails(params.id, params.mediaType);
    return res.status(200).json(details);
  } catch (error: any) {
    return res.status(502).json({ message: "Error fetching details from TMDB", error: error.message });
  }
};

/**
 * @openapi
 * /api/users/shows/all:
 *   get:
 *     summary: Get every log entry in the platform (Admin only)
 *     tags: [Shows]
 *     responses:
 *       200: { description: "List of all user shows" }
 *       403: { description: "Access denied" }
 */
export const getAllUserShows = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "ADMIN") return res.status(403).json({ message: "Access denied." });
    const allShows = await showService.getAllUserShows();
    return res.status(200).json({ allShows });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching all user shows" });
  }
};
