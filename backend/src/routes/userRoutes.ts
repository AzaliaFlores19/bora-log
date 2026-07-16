import express from "express";
import { getUser, updateProfile, updatePassword, deleteUser, getAllUsers, updateUserByAdmin } from "../controllers/userController.js";
import { getAllUserShows } from "../controllers/showController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// User management
router.get("/me", verifyToken, getUser);
router.get("/:id", verifyToken, getUser);
router.patch("/:id", verifyToken, updateProfile);
router.patch("/:id/password", verifyToken, updatePassword);
router.delete("/:id", verifyToken, deleteUser);

// Admin-only user management
router.get("/", verifyToken, isAdmin, getAllUsers);
router.patch("/:id/admin-update", verifyToken, isAdmin, updateUserByAdmin);
router.get("/shows/all", verifyToken, isAdmin, getAllUserShows);

export default router;

