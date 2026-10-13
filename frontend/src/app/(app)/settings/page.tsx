"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, Lock, Mail, Save, ArrowLeft, Shield, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Tab = "profile" | "security";

export default function SettingsPage() {
  const { user, updateProfile, changePassword } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  const [tab, setTab] = useState<Tab>("profile");

  // Profile state
  const [username, setUsername] = useState(user?.username ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ username, avatar_url: avatarUrl || null });
      addToast("success", "Profile updated successfully");
    } catch {
      addToast("error", "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      addToast("success", "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      <h1 className="font-display text-2xl font-extrabold text-text mb-6">Settings</h1>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface border border-border mb-6 max-w-xs">
        <button
          onClick={() => setTab("profile")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === "profile" ? "gradient-primary text-primary-fg shadow-lg shadow-primary/20" : "text-text-muted hover:text-text"
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Profile
        </button>
        <button
          onClick={() => setTab("security")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === "security" ? "gradient-primary text-primary-fg shadow-lg shadow-primary/20" : "text-text-muted hover:text-text"
          }`}
        >
          <Lock className="w-4 h-4" />
          Security
        </button>
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <div className="rounded-2xl bg-surface border border-border p-6 animate-scale-in">
          {/* Avatar preview */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-primary-fg font-display text-2xl font-extrabold shadow-lg">
                {username.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center">
                <Camera className="w-3.5 h-3.5 text-text-muted" />
              </div>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-text">{username || "User"}</h2>
              <p className="text-sm text-text-subtle">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your display name"
            />
            <Input
              label="Avatar URL"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
            />
            <div className="relative">
              <Mail className="absolute left-3.5 top-9 w-4 h-4 text-text-subtle pointer-events-none" />
              <Input label="Email" type="email" value={user?.email ?? ""} disabled className="pl-11" />
            </div>
            <p className="text-xs text-text-subtle">Email cannot be changed in demo mode</p>

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={savingProfile}>
                {!savingProfile && <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Security tab */}
      {tab === "security" && (
        <div className="space-y-6 animate-scale-in">
          {/* Change password */}
          <div className="rounded-2xl bg-surface border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-bold text-text">Change Password</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />

              {passwordError && (
                <div className="px-4 py-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
                  {passwordError}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button type="submit" loading={savingPassword}>
                  {!savingPassword && <Lock className="w-4 h-4" />}
                  Update Password
                </Button>
              </div>
            </form>
          </div>

          {/* Account info */}
          <div className="rounded-2xl bg-surface border border-border p-6">
            <h3 className="font-display text-sm font-bold text-text mb-3">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Account ID</span>
                <span className="text-text-subtle font-mono">{user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Role</span>
                <span className="text-primary font-medium capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Member since</span>
                <span className="text-text-subtle">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
