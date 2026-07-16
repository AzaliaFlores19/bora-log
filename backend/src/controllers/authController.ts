import {Request, Response} from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import crypto, { createHash, randomBytes } from "crypto";
import { sendResetEmail } from "../lib/email.js";

const generateToken = (id: string, role: string)=>{
    return jwt.sign( {id, role},
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
    )
}

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: "User created" }
 *       500: { description: "Internal server error" }
 */
export const register = async (req: Request, res: Response)=>{
    try{
        const {name, email, password} = req.body;
        const userExistant = await prisma.user.findUnique({where: {email}});
        if(userExistant) return res.status(400).json({message: "User already exists"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword }
        });

        const token = generateToken(user.id, user.role);
        res.status(201).json({message : "User created", user: {id: user.id, name: user.name, email: user.email}, token});
    } catch (error) {
        res.status(500).json({message: "Error creating user"});
    }
}

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
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: "Login successful" }
 *       400: { description: "Invalid credentials" }
 *       500: { description: "Internal server error" }
 */
export const login = async (req: Request, res: Response)=>{
    try {
        const {email, password} = req.body;
        const user = await prisma.user.findUnique({where: {email}});
        if(!user || !user.isActive) return res.status(400).json({message: "Invalid credentials or account inactive"});

        const matches = await bcrypt.compare(password,user.password);
        if(!matches) return res.status(400).json({message: "Invalid credentials"});      

        const token = generateToken(user.id, user.role);
        res.status(200).json({message: "Login successful", user: {id: user.id, name: user.name, email: user.email}, token});
    }catch (error) {
        res.status(500).json({message: "Error logging in"});
    }
}

const hashResetToken = (token: string) => createHash('sha256').update(token).digest('hex');

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200: { description: "Reset email sent" }
 *       500: { description: "Internal server error" }
 */
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        const response = { message: 'Si el correo existe, se enviaran instrucciones para restablecer la contrasena.' };
        if (!user) return res.status(200).json(response);

        const token = randomBytes(32).toString('hex');
        const tokenHash = hashResetToken(token);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await prisma.passwordResetToken.updateMany({
            where: { user_id: user.id, used_at: null },
            data: { used_at: new Date() },
        });

        await prisma.passwordResetToken.create({
            data: { user_id: user.id, token_hash: tokenHash, expires_at: expiresAt }
        });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
        await sendResetEmail(email, resetLink);

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: "Error en el proceso de forgot password" });
    }
};

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: "Password reset successful" }
 *       400: { description: "Invalid token" }
 *       500: { description: "Internal server error" }
 */
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;
        const tokenHash = hashResetToken(token);

        const passwordResetToken = await prisma.passwordResetToken.findFirst({
            where: { token_hash: tokenHash, used_at: null, expires_at: { gt: new Date() } }
        });

        if (!passwordResetToken) return res.status(400).json({ message: 'El token no es valido o ha expirado.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await prisma.$transaction([
            prisma.user.update({ where: { id: passwordResetToken.user_id }, data: { password: hashedPassword } }),
            prisma.passwordResetToken.update({ where: { id: passwordResetToken.id }, data: { used_at: new Date() } })
        ]);

        res.status(200).json({ message: 'La contrasena fue actualizada correctamente.' });
    } catch (error) {
        res.status(500).json({ message: "Error al restablecer la contraseña" });
    }
};
