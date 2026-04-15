import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. Token not provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, email: string, role: string };
        req.user = decoded;
        next(); 
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {

    if(req.user && req.user.role === "ADMIN"){
        next();
    }else{
        res.status(403).json({ message: "Access denied. Admins only." });
    }
}
