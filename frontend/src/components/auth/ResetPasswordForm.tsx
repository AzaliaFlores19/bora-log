"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Tv, Lock, ArrowRight, Check } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/hooks/useToast";
import * as authService from "@/services/auth.service";

export function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      addToast("success", "Password updated");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset the password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[100dvh] bg-bg flex items-center justify-center p-5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-24 w-[32rem] h-[32rem] rounded-full bg-primary/15 blur-[150px]" />
        <div className="absolute -bottom-40 -right-24 w-[32rem] h-[32rem] rounded-full bg-accent/15 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-[400px]">
        <div className="rounded-[24px] bg-surface border border-border shadow-2xl shadow-black/25 overflow-hidden animate-fade-in-up">
          <div className="h-1.5 gradient-primary" />
          <div className="px-7 py-7">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Tv className="w-5 h-5 text-primary-fg" />
              </div>
              <span className="font-display text-lg font-extrabold gradient-text">Bora-Log</span>
            </div>

            {!token ? (
              <div>
                <h1 className="font-display text-xl font-extrabold text-text">Link expired</h1>
                <p className="text-text-muted text-sm mt-1.5 mb-5">
                  This reset link is invalid or has expired. Request a new one from the sign-in screen.
                </p>
                <Link
                  href="/login"
                  className="w-full inline-flex justify-center py-3 rounded-2xl bg-surface-hover border border-border text-text font-semibold text-sm hover:border-primary/40 transition-all"
                >
                  Back to sign in
                </Link>
              </div>
            ) : done ? (
              <div>
                <div className="w-14 h-14 rounded-2xl gradient-primary-soft border border-primary/25 flex items-center justify-center text-primary mb-5">
                  <Check className="w-7 h-7" />
                </div>
                <h1 className="font-display text-xl font-extrabold text-text">Password updated</h1>
                <p className="text-text-muted text-sm mt-1.5">Taking you back to sign in…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                <div className="mb-1">
                  <h1 className="font-display text-xl font-extrabold text-text">Set a new password</h1>
                  <p className="text-text-muted text-sm mt-1.5">Choose a new password for your account.</p>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle z-10" />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm text-text placeholder:text-text-subtle bg-bg/40 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle z-10" />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm text-text placeholder:text-text-subtle bg-bg/40 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>

                {error && (
                  <div className="px-3.5 py-2.5 rounded-2xl bg-error/10 border border-error/30 text-error text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl gradient-primary text-primary-fg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                >
                  {loading ? (
                    <Spinner size={18} />
                  ) : (
                    <>
                      Update password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
