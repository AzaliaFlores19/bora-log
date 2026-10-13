import { Response } from "express";
import bcrypt from "bcryptjs";
import { userService } from "../services/userService.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

/**
 * @openapi
 * /api/users/{id}/password:
 *   patch:
 *     summary: Update password (self or admin)
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
 *             required: [newPassword]
 *             properties:
 *               currentPassword: { type: string, description: "Required when changing your own password" }
 *               newPassword: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: "Password updated" }
 *       400: { description: "Current password is incorrect" }
 *       403: { description: "Access denied" }
 *       500: { description: "Internal server error" }
 */
export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const targetId = (req.params.id || req.user?.id) as string;
    if (req.user?.role !== "ADMIN" && req.user?.id !== targetId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Changing your own password requires the current one; an admin override does not.
    if (req.user?.id === targetId) {
      const currentPassword = req.body.currentPassword;
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      const hash = await userService.findPasswordHash(targetId);
      if (!hash) return res.status(404).json({ message: "User not found" });
      const matches = await bcrypt.compare(currentPassword, hash);
      if (!matches) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
    }

    await userService.updatePassword(targetId, req.body.newPassword);
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating password" });
  }
};

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user profile (self or admin)
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
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user" });
  }
};

/**
 * @openapi
 * /api/users/{id}:
 *   patch:
 *     summary: Update own profile (name, email, profileImage only)
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
 *               profileImage: { type: string, nullable: true }
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
    // Only whitelisted fields reach the service (enforced again in userService).
    const updatedUser = await userService.updateUser(targetId as string, {
      name: req.body.name,
      email: req.body.email,
      profileImage: req.body.profileImage,
      avatarColor: req.body.avatarColor,
    });
    return res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ message: "Email already in use" });
    }
    return res.status(500).json({ message: "Error updating profile" });
  }
};

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (logical by default, physical with ?hard=true, admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: hard
 *         required: false
 *         schema: { type: boolean, default: false }
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

    const hard = req.query.hard === "true";
    if (hard) {
      if (req.user?.role !== "ADMIN") {
        return res.status(403).json({ message: "Only admins can permanently delete users" });
      }
      await userService.purgeUser(targetId as string);
      return res.status(200).json({ message: "User permanently deleted" });
    }

    await userService.softDeleteUser(targetId as string);
    return res.status(200).json({ message: "User deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting user" });
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
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching users" });
  }
};

/**
 * @openapi
 * /api/users/{id}/admin-update:
 *   patch:
 *     summary: Admin update user info (name, email, role, isActive)
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
 *               role: { type: string, enum: [USER, ADMIN] }
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: "User info updated" }
 *       403: { description: "Access denied" }
 */
export const updateUserByAdmin = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "ADMIN") return res.status(403).json({ message: "Access denied. Admins only." });

    const userId = req.params.id as string;
    const updatedUser = await userService.updateUserByAdmin(userId, {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      isActive: req.body.isActive,
    });

    return res.status(200).json({ message: "User info updated successfully", user: updatedUser });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ message: "Email already in use" });
    }
    return res.status(500).json({ message: "Error updating user info" });
  }
};

/**
 * @openapi
 * /api/users/stats:
 *   get:
 *     summary: Platform statistics (Admin only)
 *     tags: [Users]
 *     responses:
 *       200: { description: "Aggregated platform stats" }
 *       403: { description: "Access denied" }
 */
export const getPlatformStats = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "ADMIN") return res.status(403).json({ message: "Access denied" });
    const stats = await userService.getPlatformStats();
    return res.status(200).json({ stats });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching platform stats" });
  }
};
