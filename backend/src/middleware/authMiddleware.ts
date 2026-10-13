import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. Token not provided." });
  }

  let decoded: { id?: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id?: string };
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }

  if (!decoded?.id) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }

  try {
    // Revalidate against the DB so deactivated / soft-deleted users and stale roles
    // (or a forged/older token) are rejected immediately.
    const user = await prisma.user.findFirst({
      where: { id: decoded.id, deletedAt: null },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Account is inactive or no longer exists." });
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error verifying session." });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};
