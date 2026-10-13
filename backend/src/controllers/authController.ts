import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "crypto";
import prisma from "../lib/prisma.js";
import { sendResetEmail } from "../lib/email.js";
import { userService, publicUserSelect } from "../services/userService.js";

const TOKEN_EXPIRY = "1h";
const RESET_TOKEN_TTL_MINUTES = 15;

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, { expiresIn: TOKEN_EXPIRY });
};

const hashResetToken = (token: string) => createHash("sha256").update(token).digest("hex");

const toPublicUser = (user: { id: string; name: string; email: string; role: string; profileImage: string | null }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
});

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (reactivates a soft-deleted account with the same email)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       201: { description: "User created" }
 *       200: { description: "Soft-deleted account reactivated" }
 *       400: { description: "Validation error or email already in use" }
 *       500: { description: "Internal server error" }
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existing = await userService.findByEmailIncludingDeleted(email);

    if (existing && !existing.deletedAt) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (existing && existing.deletedAt) {
      const user = await userService.reactivateUser(existing.id, { name, password });
      const token = generateToken(user.id, user.role);
      return res.status(200).json({ message: "Account reactivated", user, token });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: publicUserSelect,
    });

    const token = generateToken(user.id, user.role);
    return res.status(201).json({ message: "User created", user, token });
  } catch (error) {
    return res.status(500).json({ message: "Error creating user" });
  }
};

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: "Login successful" }
 *       400: { description: "Invalid credentials" }
 *       500: { description: "Internal server error" }
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userService.findUserByEmail(email);

    if (!user || !user.isActive) {
      return res.status(400).json({ message: "Invalid credentials or account inactive" });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user.id, user.role);
    return res.status(200).json({ message: "Login successful", user: toPublicUser(user), token });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in" });
  }
};

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset link (always returns 200 to avoid leaking emails)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200: { description: "Reset instructions sent if the email exists" }
 *       500: { description: "Internal server error" }
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await userService.findUserByEmail(email);
    const response = { message: "Si el correo existe, se enviaran instrucciones para restablecer la contrasena." };
    if (!user || !user.isActive) return res.status(200).json(response);

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await prisma.passwordResetToken.updateMany({
      where: { user_id: user.id, used_at: null },
      data: { used_at: new Date() },
    });

    await prisma.passwordResetToken.create({
      data: { user_id: user.id, token_hash: tokenHash, expires_at: expiresAt },
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl.replace(/\/$/, "")}/reset-password?token=${token}`;
    await sendResetEmail(email, resetLink);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Error en el proceso de forgot password" });
  }
};

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using a token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: "Password reset successful" }
 *       400: { description: "Invalid or expired token" }
 *       500: { description: "Internal server error" }
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const tokenHash = hashResetToken(token);

    const passwordResetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token_hash: tokenHash,
        used_at: null,
        expires_at: { gt: new Date() },
        user: { deletedAt: null },
      },
    });

    if (!passwordResetToken) {
      return res.status(400).json({ message: "El token no es valido o ha expirado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({ where: { id: passwordResetToken.user_id }, data: { password: hashedPassword } }),
      prisma.passwordResetToken.update({ where: { id: passwordResetToken.id }, data: { used_at: new Date() } }),
    ]);

    return res.status(200).json({ message: "La contrasena fue actualizada correctamente." });
  } catch (error) {
    return res.status(500).json({ message: "Error al restablecer la contraseña" });
  }
};
