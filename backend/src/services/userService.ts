import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

export const userService = {
    async findUserById(id: string) {
        return await prisma.user.findUnique({ where: { id } });
    },
    async updateUser(id: string, data: any) {
        return await prisma.user.update({ where: { id }, data });
    },
    async deleteUser(id: string) {
        return await prisma.user.delete({ where: { id } });
    },
    async getAllUsers() {
        return await prisma.user.findMany();
    },
    async updatePassword(id: string, newPassword: string) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        return await prisma.user.update({
            where: { id },
            data: { password: hashedPassword }
        });
    },
    async updateStatus(id: string, isActive: boolean) {
        return await prisma.user.update({
            where: { id },
            data: { isActive },
            select: { id: true, name: true, email: true, isActive: true }
        });
    },
    async updateUserByAdmin(id: string, data: any) {
        return await prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                role: data.role,
                isActive: data.isActive
            }
        });
    }
};
