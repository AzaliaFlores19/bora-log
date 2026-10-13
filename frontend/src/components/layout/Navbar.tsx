"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Search, LayoutGrid, Tv, Settings, Shield, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Avatar } from "@/components/ui/Avatar";

export function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const navItems = [
    { label: "Dashboard", icon: LayoutGrid, href: "/dashboard" },
    { label: "Search", icon: Search, href: "/search" },
  ];

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-fg transition-colors">
              <Tv className="w-5 h-5" />
            </div>
            <span className="font-display text-xl font-extrabold gradient-text hidden sm:inline">
              Bora-Log
            </span>
          </Link>

          {/* Nav items */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-text-muted hover:text-text hover:bg-surface-hover"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            {user && (
              <div ref={menuRef} className="relative flex items-center gap-3 pl-2 border-l border-border">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <Avatar name={user.username} color={user.avatar_color} size={36} />
                  <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-surface border border-border shadow-xl animate-scale-in overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-text">{user.username}</p>
                      <p className="text-xs text-text-subtle">{user.email}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                            user.role === "admin" ? "bg-primary/10 text-primary" : "bg-bg/50 text-text-subtle"
                          }`}
                        >
                          {user.role === "admin" ? "Admin" : "User"}
                        </span>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/settings"
                        onClick={() => setMenuOpen(false)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          pathname === "/settings"
                            ? "text-primary bg-primary/5"
                            : "text-text-muted hover:text-text hover:bg-surface-hover"
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>

                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            pathname === "/admin"
                              ? "text-primary bg-primary/5"
                              : "text-text-muted hover:text-text hover:bg-surface-hover"
                          }`}
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-border py-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
