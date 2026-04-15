import {Request, Response} from "express";
import bycrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

const generateToken = (id: string, role: string)=>{
    return jwt.sign( {id, role},
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
    )
}

export const register = async (req: Request, res: Response)=>{
    try{
        const {name, email, password} = req.body;

        const userExistant = await prisma.user.findUnique({where: {email}});
        
        if(userExistant){
            return res.status(400).json({message: "User already exists"});
        }

        const salt = await bycrypt.genSalt(10);
        const hashedPassword = await bycrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        });

        const token = generateToken(user.id, user.role);
        res.status(201).json({message : "User created successfully", 
             user: {
                id: user.id,
                name: user.name,
                email: user.email
             },
             token
        });
        
    } catch (error) {
        res.status(500).json({message: "Error creating user"});
    }
}

export const login = async (req: Request, res: Response)=>{

    try {
        const {email, password} = req.body;

        const user = await prisma.user.findUnique({where: {email}});

        if(!user){
            return res.status(400).json({message: "Invalid credentials"});
        }

        const matches = await bycrypt.compare(password,user.password);

        if(!matches){
            return res.status(400).json({message: "Invalid credentials"});      
        }

        const token = generateToken(user.id, user.role);

        res.status(200).json({message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token
            
        });

    }catch (error) {
        res.status(500).json({message: "Error logging in"});
    }
}

export const updatePassword = async (req: AuthRequest, res: Response) => {
    try {
        const targetId = req.params.id || req.user?.id;
        const { newPassword } = req.body;
        const currentUser = req.user;

        if (currentUser?.role !== "ADMIN" && targetId !== currentUser?.id) {
            return res.status(403).json({ message: "Acceso denegado. Solo puedes actualizar tu propia contraseña." });
        }

        if (!targetId) return res.status(401).json({ message: "Usuario no identificado" });
        if (!newPassword) return res.status(400).json({ message: "La nueva contraseña es requerida" });

        const salt = await bycrypt.genSalt(10);
        const hashedPassword = await bycrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: targetId as string },
            data: { password: hashedPassword }
        });

        res.status(200).json({ message: "Contraseña actualizada con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la contraseña" });
    }
}

export const updateProfile = async (req: AuthRequest, res: Response)=>{
    try {
        const targetId = req.params.id || req.user?.id;
        const {name, email, profileImage} = req.body;
        const currentUser = req.user;

        if(currentUser?.role !== "ADMIN" && targetId !== currentUser?.id){
            return res.status(403).json({message: "Access denied. You can only update your own profile."});
        }

        const updatedUser = await prisma.user.update({
            where: {id: targetId as string},
            data: { name, email, profileImage },
            select: {  
                id: true,
                name: true,
                email: true,
                role: true,
                profileImage: true,
            }
        });

        res.status(200).json({message: "Profile updated successfully", user: updatedUser});
    } catch (error) {
        res.status(500).json({message: "Error updating profile"});
    }
}

export const deleteUser = async (req: AuthRequest, res: Response)=>{
    try {
        const targetId = req.params.id || req.user?.id;
        const currentUser = req.user;

        if(currentUser?.role !== "ADMIN" && targetId !== currentUser?.id){
            return res.status(403).json({message: "Access denied. You can only delete your own account."});
        }

        if (!targetId) return res.status(401).json({ message: "User not authenticated" });

        await prisma.user.delete({where: {id: targetId as string}});

        res.status(200).json({message: "User deleted successfully"});
    } catch (error) {
        res.status(500).json({message: "Error deleting user"});     

    }
}

export const getUser = async (req: AuthRequest, res: Response)=>{
    try {
        const targetId = req.params.id || req.user?.id;
        const currentUser = req.user;

        if(currentUser?.role !== "ADMIN" && currentUser?.id !== targetId){
            return res.status(403).json({message: "Access denied. You can only view your own profile."});
        }

        if (!targetId) return res.status(401).json({ message: "User not authenticated" });

        const user = await prisma.user.findUnique({where: {id: targetId as string},
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profileImage: true,
                createdAt: true,

                userShows: {
                    include: {
                        show: true
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
            });

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({message: "Error fetching user"});
    }
}

export const getAllUsers = async (req: AuthRequest, res: Response)=>{
    try {
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ message: "User not authenticated" });
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        }); 
        res.status(200).json({users});
    } catch (error) {
        res.status(500).json({message: "Error fetching users"});
    }   
}
