import { Response } from "express";
import { userService } from "../services/userService.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

/**
 * @openapi
 * /api/users/{id}/password:
 *   patch:
 *     summary: Update password
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword: { type: string }
 *     responses:
 *       200: { description: "Password updated" }
 *       403: { description: "Access denied" }
 *       500: { description: "Internal server error" }
 */
export const updatePassword = async (req: AuthRequest, res: Response) => {
    try {
        const targetId = req.params.id || req.user?.id;
        if (req.user?.role !== "ADMIN" && req.user?.id !== targetId) {
            return res.status(403).json({ message: "Access denied" });
        }
        if (!req.body.newPassword) return res.status(400).json({ message: "New password is required" });
        
        await userService.updatePassword(targetId as string, req.body.newPassword);
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating password" });
    }
};

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "User profile" }
 *       403: { description: "Access denied" }
 *       404: { description: "User not found" }
 */
export const getUser = async (req: AuthRequest, res: Response) => {
    try {
        const targetId = req.params.id || req.user?.id;
        if (req.user?.role !== "ADMIN" && req.user?.id !== targetId) {
            return res.status(403).json({ message: "Access denied" });
        }
        const user = await userService.findUserById(targetId as string);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user" });
    }
};

/**
 * @openapi
 * /api/users/{id}:
 *   patch:
 *     summary: Update profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               profileImage: { type: string }
 *     responses:
 *       200: { description: "Profile updated" }
 *       403: { description: "Access denied" }
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const targetId = req.params.id || req.user?.id;
        if (req.user?.role !== "ADMIN" && req.user?.id !== targetId) {
            return res.status(403).json({ message: "Access denied" });
        }
        const updatedUser = await userService.updateUser(targetId as string, req.body);
        res.status(200).json({ message: "Profile updated", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile" });
    }
};

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "User deleted" }
 *       403: { description: "Access denied" }
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const targetId = req.params.id || req.user?.id;
        if (req.user?.role !== "ADMIN" && req.user?.id !== targetId) {
            return res.status(403).json({ message: "Access denied" });
        }
        await userService.deleteUser(targetId as string);
        res.status(200).json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
};

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     responses:
 *       200: { description: "List of users" }
 *       403: { description: "Access denied" }
 */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== "ADMIN") return res.status(403).json({ message: "Access denied" });
        const users = await userService.getAllUsers();
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

/**
 * @openapi
 * /api/users/{id}/admin-update:
 *   patch:
 *     summary: Admin update user info
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               role: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: "User info updated" }
 *       403: { description: "Access denied" }
 */
export const updateUserByAdmin = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== "ADMIN") return res.status(403).json({ message: "Access denied. Admins only." });
        
        const userId = req.params.id as string;
        const updatedUser = await userService.updateUserByAdmin(userId, req.body);
        
        res.status(200).json({ message: "User info updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating user info" });
    }
};
