"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  TrendingUp,
  ArrowLeft,
  Shield,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ScrollText,
  Pencil,
  CheckCircle2,
  XCircle,
  Tv,
  Star,
  BarChart3,
  Eye,
  UserCheck,
  UserX,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserWatchLogDrawer } from "@/components/admin/UserWatchLogDrawer";
import { EditUserModal } from "@/components/admin/EditUserModal";
import { getPosterUrl } from "@/lib/mock-data";
import { STATUS_DOT_COLORS, STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import * as adminService from "@/services/admin.service";
import type { AdminUser, PlatformStats, PlatformShow, ShowStatus, UserRole } from "@/types";

type Tab = "overview" | "users" | "shows";
type SortKey = "username" | "email" | "show_count" | "created_at";
type SortDir = "asc" | "desc";
const USERS_PER_PAGE = 6;
const SHOWS_PER_PAGE = 9;

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return null;
  return sortDir === "asc" ? (
    <ChevronUp className="w-3.5 h-3.5" />
  ) : (
    <ChevronDown className="w-3.5 h-3.5" />
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  const [tab, setTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [platformShows, setPlatformShows] = useState<PlatformShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);

  // User table state
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [usersPage, setUsersPage] = useState(1);
  const [showsPage, setShowsPage] = useState(1);

  // Drawer + modal state
  const [drawerUser, setDrawerUser] = useState<AdminUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    Promise.all([adminService.fetchAllUsers(), adminService.fetchPlatformStats()])
      .then(([u, s]) => {
        setUsers(u);
        setStats(s);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "shows" && platformShows.length === 0 && !showLoading) {
      setShowLoading(true);
      adminService.fetchAllPlatformShows().then((s) => {
        setPlatformShows(s);
        setShowLoading(false);
      });
    }
  }, [tab, platformShows.length, showLoading]);

  const filteredUsers = useMemo(() => {
    let result = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    result = [...result].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [users, search, sortKey, sortDir]);

  const usersTotalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const safeUsersPage = Math.min(usersPage, usersTotalPages);
  const pagedUsers = filteredUsers.slice((safeUsersPage - 1) * USERS_PER_PAGE, safeUsersPage * USERS_PER_PAGE);
  const showsTotalPages = Math.max(1, Math.ceil(platformShows.length / SHOWS_PER_PAGE));
  const safeShowsPage = Math.min(showsPage, showsTotalPages);
  const pagedShows = platformShows.slice((safeShowsPage - 1) * SHOWS_PER_PAGE, safeShowsPage * SHOWS_PER_PAGE);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  async function handleToggleActive(u: AdminUser) {
    try {
      const newActive = await adminService.toggleUserActive(u.id);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active: newActive } : x)));
      addToast("success", `${u.username} ${newActive ? "activated" : "deactivated"}`);
    } catch {
      addToast("error", "Failed to update status");
    }
  }

  async function handleToggleRole(u: AdminUser) {
    const newRole: UserRole = u.role === "admin" ? "user" : "admin";
    try {
      await adminService.updateUserRole(u.id, newRole);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: newRole } : x)));
      addToast("success", `${u.username} is now ${newRole === "admin" ? "an admin" : "a regular user"}`);
    } catch {
      addToast("error", "Failed to update role");
    }
  }

  async function handleEditSave(userId: string, updates: { username: string; email: string; role: UserRole }) {
    try {
      await adminService.updateUserProfile(userId, updates);
      setUsers((prev) => prev.map((x) => (x.id === userId ? { ...x, ...updates } : x)));
      addToast("success", "User updated successfully");
    } catch {
      addToast("error", "Failed to update user");
    }
  }

  async function handleDelete(u: AdminUser) {
    try {
      await adminService.deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setConfirmDelete(null);
      addToast("success", `Deleted user ${u.username}`);
    } catch {
      addToast("error", "Failed to delete user");
    }
  }

  // ── Access guard ──────────────────────────────────────────────────────────
  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <EmptyState
          icon={<Shield className="w-8 h-8" />}
          title="Access Denied"
          description="You need admin privileges to view this page."
          action={<Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-24 mb-6" />
        <Skeleton className="h-10 w-80 mb-6 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.total_users ?? 0, icon: Users, color: "text-primary" },
    { label: "Shows Tracked", value: stats?.total_shows ?? 0, icon: Tv, color: "text-accent" },
    { label: "Total Entries", value: stats?.total_entries ?? 0, icon: BarChart3, color: "text-success" },
    { label: "Active Watching", value: stats?.watching_count ?? 0, icon: TrendingUp, color: "text-warning" },
  ];

  const statusBreakdown: Array<{ status: ShowStatus; count: number }> = [
    { status: "watching", count: stats?.watching_count ?? 0 },
    { status: "completed", count: stats?.completed_count ?? 0 },
    { status: "plan_to_watch", count: stats?.plan_to_watch_count ?? 0 },
    { status: "dropped", count: stats?.dropped_count ?? 0 },
  ];

  const tabs: Array<{ key: Tab; label: string; icon: typeof BarChart3 }> = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "users", label: "User Management", icon: Users },
    { key: "shows", label: "All Shows", icon: Tv },
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
      {/* Back link */}
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Shield className="w-5 h-5 text-primary-fg" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text">Admin Panel</h1>
          <p className="text-sm text-text-subtle">Manage users, shows, and platform statistics</p>
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-2xl bg-surface border border-border mb-5 sm:mb-6 overflow-x-auto no-scrollbar">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              tab === key
                ? "gradient-primary text-primary-fg shadow-md"
                : "text-text-muted hover:text-text hover:bg-surface-hover"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ─────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-2xl bg-surface border border-border p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-text-subtle uppercase tracking-wide">{s.label}</span>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className="font-display text-2xl font-bold text-text">{s.value}</div>
                </div>
              );
            })}
          </div>

          {/* Status breakdown bar */}
          <div className="rounded-2xl bg-surface border border-border p-5">
            <h3 className="text-sm font-bold text-text mb-3">Status Breakdown</h3>
            <div className="flex h-3 rounded-full overflow-hidden bg-bg">
              {statusBreakdown.map((s) => {
                const total = statusBreakdown.reduce((sum, x) => sum + x.count, 0);
                const pct = total > 0 ? (s.count / total) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={s.status}
                    className={STATUS_DOT_COLORS[s.status]}
                    style={{ width: `${pct}%` }}
                    title={`${STATUS_LABELS[s.status]}: ${s.count}`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {statusBreakdown.map((s) => (
                <div key={s.status} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT_COLORS[s.status]}`} />
                  <span className="text-xs text-text-muted">{STATUS_LABELS[s.status]}</span>
                  <span className="text-xs font-medium text-text">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active vs Inactive users */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-surface border border-border p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-text">
                  {users.filter((u) => u.is_active).length}
                </div>
                <div className="text-xs text-text-subtle">Active Users</div>
              </div>
            </div>
            <div className="rounded-2xl bg-surface border border-border p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <UserX className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-text">
                  {users.filter((u) => !u.is_active).length}
                </div>
                <div className="text-xs text-text-subtle">Inactive Users</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Users Tab ────────────────────────────────────────────────────── */}
      {tab === "users" && (
        <div className="rounded-2xl bg-surface border border-border overflow-hidden animate-fade-in">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-border gap-3">
            <h3 className="font-display text-lg font-bold text-text whitespace-nowrap">Users</h3>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle pointer-events-none" />
              <Input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setUsersPage(1);
                }}
                className="pl-10 py-2"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="No users found"
              description={search ? `No users match "${search}"` : "No users registered yet"}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-text-subtle uppercase tracking-wide">
                      <button onClick={() => handleSort("username")} className="flex items-center gap-1 hover:text-text transition-colors">
                        User <SortIcon col="username" sortKey={sortKey} sortDir={sortDir} />
                      </button>
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-text-subtle uppercase tracking-wide hidden md:table-cell">
                      <button onClick={() => handleSort("email")} className="flex items-center gap-1 hover:text-text transition-colors">
                        Email <SortIcon col="email" sortKey={sortKey} sortDir={sortDir} />
                      </button>
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-text-subtle uppercase tracking-wide">
                      <button onClick={() => handleSort("show_count")} className="flex items-center gap-1 hover:text-text transition-colors">
                        Shows <SortIcon col="show_count" sortKey={sortKey} sortDir={sortDir} />
                      </button>
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-text-subtle uppercase tracking-wide hidden sm:table-cell">
                      <button onClick={() => handleSort("created_at")} className="flex items-center gap-1 hover:text-text transition-colors">
                        Joined <SortIcon col="created_at" sortKey={sortKey} sortDir={sortDir} />
                      </button>
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-text-subtle uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-text-subtle uppercase tracking-wide">Role</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-text-subtle uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg gradient-primary-soft border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-text">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-text-muted hidden md:table-cell">{u.email}</td>
                      <td className="px-5 py-3 text-sm text-text-muted">{u.show_count}</td>
                      <td className="px-5 py-3 text-sm text-text-subtle hidden sm:table-cell">
                        {new Date(u.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleToggleActive(u)}
                          disabled={u.id === user?.id}
                          title={u.id === user?.id ? "Cannot change your own status" : `${u.is_active ? "Deactivate" : "Activate"} user`}
                        >
                          <Badge
                            className={
                              u.is_active
                                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-rose-400/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            }
                          >
                            {u.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {u.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleToggleRole(u)}
                          disabled={u.id === user?.id}
                          title={u.id === user?.id ? "Cannot change your own role" : `Make ${u.role === "admin" ? "user" : "admin"}`}
                        >
                          <Badge
                            className={
                              u.role === "admin"
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-border bg-bg/50 text-text-subtle"
                            }
                          >
                            {u.role === "admin" ? <Shield className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {u.role}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Log */}
                          <button
                            onClick={() => {
                              setDrawerUser(u);
                              setDrawerOpen(true);
                            }}
                            title="View watch log"
                            className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <ScrollText className="w-4 h-4" />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditUser(u);
                              setEditOpen(true);
                            }}
                            title="Edit user"
                            className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          {confirmDelete === u.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(u)}
                                title="Confirm delete"
                                className="p-2 rounded-lg text-error hover:bg-error/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                title="Cancel"
                                className="px-2 py-1 rounded-lg text-xs text-text-muted hover:bg-surface-hover transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(u.id)}
                              disabled={u.id === user?.id}
                              title={u.id === user?.id ? "Cannot delete yourself" : "Delete user"}
                              className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filteredUsers.length > USERS_PER_PAGE && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-border">
              <span className="text-xs text-text-subtle">
                Page {safeUsersPage} of {usersTotalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUsersPage(Math.max(1, safeUsersPage - 1))}
                  disabled={safeUsersPage === 1}
                  className="p-2 rounded-lg border border-border text-text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setUsersPage(Math.min(usersTotalPages, safeUsersPage + 1))}
                  disabled={safeUsersPage === usersTotalPages}
                  className="p-2 rounded-lg border border-border text-text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── All Shows Tab ────────────────────────────────────────────────── */}
      {tab === "shows" && (
        <div className="animate-fade-in">
          {showLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-2xl border border-border">
                  <Skeleton className="w-16 h-24 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : platformShows.length === 0 ? (
            <EmptyState
              icon={<Tv className="w-8 h-8" />}
              title="No shows tracked yet"
              description="Shows will appear here once users start adding them to their logs."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pagedShows.map((ps) => (
                  <div
                    key={ps.show.id}
                    className="flex gap-3 rounded-2xl bg-surface border border-border p-4 hover:border-primary/20 transition-colors"
                  >
                    {/* Poster */}
                    <div className="w-16 h-24 rounded-lg overflow-hidden bg-bg flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getPosterUrl(ps.show)}
                        alt={ps.show.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text text-sm line-clamp-1">{ps.show.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-text-subtle">
                        <Tv className="w-3 h-3" />
                        TV Show
                        {ps.show.release_date && <span>· {new Date(ps.show.release_date).getFullYear()}</span>}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs">
                          <Users className="w-3 h-3 text-text-subtle" />
                          <span className="font-medium text-text">{ps.tracking_count}</span>
                          <span className="text-text-subtle">tracking</span>
                        </div>
                        {ps.avg_rating !== null && (
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 fill-warning text-warning" />
                            <span className="font-medium text-text">{ps.avg_rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Watchers */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ps.watchers.slice(0, 5).map((w, i) => (
                          <span
                            key={i}
                            className={`text-[10px] px-1.5 py-0.5 rounded-md border ${STATUS_COLORS[w.status]}`}
                            title={`${w.username}: ${STATUS_LABELS[w.status]}`}
                          >
                            {w.username}
                          </span>
                        ))}
                        {ps.watchers.length > 5 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md border border-border text-text-subtle">
                            +{ps.watchers.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {platformShows.length > SHOWS_PER_PAGE && (
                <div className="flex items-center justify-between mt-5 px-1">
                  <span className="text-xs text-text-subtle">
                    Page {safeShowsPage} of {showsTotalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowsPage(Math.max(1, safeShowsPage - 1))}
                      disabled={safeShowsPage === 1}
                      className="p-2 rounded-lg border border-border text-text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowsPage(Math.min(showsTotalPages, safeShowsPage + 1))}
                      disabled={safeShowsPage === showsTotalPages}
                      className="p-2 rounded-lg border border-border text-text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Drawer + Modal ──────────────────────────────────────────────── */}
      <UserWatchLogDrawer user={drawerUser} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <EditUserModal user={editUser} open={editOpen} onClose={() => setEditOpen(false)} onSave={handleEditSave} />
    </div>
  );
}
