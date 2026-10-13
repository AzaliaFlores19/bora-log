import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

// Never expose password hashes. Every read/write that returns a user uses this.
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  profileImage: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

type SelfUpdatable = { name?: string; email?: string; profileImage?: string | null };
type AdminUpdatable = { name?: string; email?: string; role?: "USER" | "ADMIN"; isActive?: boolean };

export const userService = {
  async findUserById(id: string) {
    return prisma.user.findFirst({ where: { id, deletedAt: null }, select: publicUserSelect });
  },

  /** Active (non deleted) user, includes the password hash. Auth flow only. */
  async findUserByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  },

  /** Any user with that email (even soft deleted). Used to decide reactivation on register. */
  async findByEmailIncludingDeleted(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  /** Self profile update. Only whitelisted, non-privileged fields. */
  async updateUser(id: string, data: SelfUpdatable) {
    return prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        profileImage: data.profileImage,
      },
      select: publicUserSelect,
    });
  },

  async updatePassword(id: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: publicUserSelect,
    });
  },

  async getAllUsers() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      select: publicUserSelect,
      orderBy: { createdAt: "desc" },
    });
  },

  async updateUserByAdmin(id: string, data: AdminUpdatable) {
    return prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      },
      select: publicUserSelect,
    });
  },

  /** Logical delete: flags the user and cascades to their logs and reset tokens. */
  async softDeleteUser(id: string) {
    const now = new Date();
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { deletedAt: now, isActive: false },
        select: publicUserSelect,
      });
      await tx.userShow.updateMany({
        where: { user_id: id, deletedAt: null },
        data: { deletedAt: now },
      });
      await tx.passwordResetToken.updateMany({
        where: { user_id: id, used_at: null },
        data: { used_at: now },
      });
      return user;
    });
  },

  /** Hard delete. Relies on the DB "onDelete: Cascade" for related rows. */
  async purgeUser(id: string) {
    return prisma.user.delete({ where: { id } });
  },

  /** Reactivates a soft-deleted account when someone registers again with the same email. */
  async reactivateUser(id: string, data: { name: string; password: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        password: hashedPassword,
        deletedAt: null,
        isActive: true,
        role: "USER",
      },
      select: publicUserSelect,
    });
  },
};
