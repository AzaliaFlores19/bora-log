import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

// Never expose password hashes. Every read/write that returns a user uses this.
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  profileImage: true,
  avatarColor: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

type SelfUpdatable = {
  name?: string;
  email?: string;
  profileImage?: string | null;
  avatarColor?: string | null;
};
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

  /** Password hash only, for verifying the current password. */
  async findPasswordHash(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { password: true },
    });
    return user?.password ?? null;
  },

  /** Self profile update. Only whitelisted, non-privileged fields. */
  async updateUser(id: string, data: SelfUpdatable) {
    return prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        profileImage: data.profileImage,
        avatarColor: data.avatarColor,
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
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        ...publicUserSelect,
        _count: { select: { userShows: { where: { deletedAt: null } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return users.map(({ _count, ...user }) => ({ ...user, show_count: _count.userShows }));
  },

  /** Aggregated platform stats for the admin dashboard. */
  async getPlatformStats() {
    const [totalUsers, totalShows, totalEntries, byStatus] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.show.count(),
      prisma.userShow.count({ where: { deletedAt: null } }),
      prisma.userShow.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
    ]);

    const counts: Record<string, number> = { watching: 0, completed: 0, plan_to_watch: 0, dropped: 0 };
    for (const row of byStatus) {
      if (row.status) counts[row.status] = row._count._all;
    }

    return {
      total_users: totalUsers,
      total_shows: totalShows,
      total_entries: totalEntries,
      watching_count: counts.watching,
      completed_count: counts.completed,
      plan_to_watch_count: counts.plan_to_watch,
      dropped_count: counts.dropped,
    };
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
