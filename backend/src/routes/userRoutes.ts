import express from "express";
import {
  getUser,
  updateProfile,
  updatePassword,
  deleteUser,
  getAllUsers,
  updateUserByAdmin,
  getPlatformStats,
} from "../controllers/userController.js";
import { getAllUserShows } from "../controllers/showController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import {
  validateBody,
  updateProfileSchema,
  updatePasswordSchema,
  adminUpdateUserSchema,
} from "../lib/validation.js";

const router = express.Router();

// User management
router.get("/me", verifyToken, getUser);
router.get("/stats", verifyToken, isAdmin, getPlatformStats);
router.get("/:id", verifyToken, getUser);
router.patch("/:id", verifyToken, validateBody(updateProfileSchema), updateProfile);
router.patch("/:id/password", verifyToken, validateBody(updatePasswordSchema), updatePassword);
router.delete("/:id", verifyToken, deleteUser);

// Admin-only user management
router.get("/", verifyToken, isAdmin, getAllUsers);
router.patch("/:id/admin-update", verifyToken, isAdmin, validateBody(adminUpdateUserSchema), updateUserByAdmin);
router.get("/shows/all", verifyToken, isAdmin, getAllUserShows);

export default router;
