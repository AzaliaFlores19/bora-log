import {Router} from "express";
import { isAdmin, verifyToken } from "../middleware/authMiddleware.js";
import {register, login, updatePassword, updateProfile, deleteUser, getUser, getAllUsers} from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.patch("/update-password", verifyToken, updatePassword);
router.patch("/update-profile/:id", verifyToken, updateProfile);
router.delete("/user/:id", verifyToken, deleteUser);

router.get("/user/:id", verifyToken, getUser);
router.get("/users", verifyToken, isAdmin, getAllUsers);


export default router;