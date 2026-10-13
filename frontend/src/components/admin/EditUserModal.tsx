"use client";

import { useState, useEffect } from "react";
import { X, Shield, Eye } from "lucide-react";
import type { AdminUser, UserRole } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface EditUserModalProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onSave: (
    userId: string,
    updates: { username: string; email: string; role: UserRole },
  ) => Promise<void>;
}

export function EditUserModal({ user, open, onClose, onSave }: EditUserModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setRole(user.role);
    }
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !user) return null;

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(user!.id, { username, email, role });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-lg font-bold text-text">Edit User</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Avatar preview */}
          <div className="flex items-center gap-3 pb-2">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-fg font-display text-lg font-extrabold">
              {username.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-medium text-text">{user.username}</p>
              <p className="text-xs text-text-subtle">Editing profile</p>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-text-subtle uppercase tracking-wide mb-1.5">
              Username
            </label>
            <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-text-subtle uppercase tracking-wide mb-1.5">
              Email
            </label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-text-subtle uppercase tracking-wide mb-1.5">
              Role
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setRole("user")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex-1 ${
                  role === "user"
                    ? "border-primary/50 text-primary bg-primary/10"
                    : "border-border text-text-muted hover:border-primary/30 hover:text-text"
                }`}
              >
                <Eye className="w-4 h-4" />
                User
              </button>
              <button
                onClick={() => setRole("admin")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex-1 ${
                  role === "admin"
                    ? "border-primary/50 text-primary bg-primary/10"
                    : "border-border text-text-muted hover:border-primary/30 hover:text-text"
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !username.trim() || !email.trim()}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
