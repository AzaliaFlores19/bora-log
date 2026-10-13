"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Tv,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  Bookmark,
  Star,
  Film,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Spinner } from "@/components/ui/Spinner";

interface AuthPageProps {
  initialMode?: "login" | "signup";
}

export function AuthPage({ initialMode = "login" }: AuthPageProps) {
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        addToast("success", "Welcome back");
      } else {
        await signUp(email, password, username);
        addToast("success", "Your account is ready");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode: "login" | "signup") {
    setMode(nextMode);
    setError(null);
  }

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Soft ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-24 w-[30rem] h-[30rem] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute -bottom-32 -left-24 w-[30rem] h-[30rem] rounded-full bg-accent/10 blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[24rem] h-[24rem] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      {/* Floating decorative icons */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <Tv className="absolute top-[14%] left-[12%] w-7 h-7 text-primary/15 rotate-[-12deg]" />
        <Heart className="absolute top-[22%] right-[14%] w-6 h-6 text-accent/15 rotate-[18deg]" />
        <Star className="absolute bottom-[24%] left-[16%] w-5 h-5 text-warning/20 rotate-[8deg]" />
        <Bookmark className="absolute bottom-[18%] right-[18%] w-6 h-6 text-primary/15 rotate-[-6deg]" />
        <Film className="absolute top-[45%] left-[8%] w-8 h-8 text-text-subtle/15 rotate-[22deg]" />
      </div>

      {/* === Auth Card === */}
      <div className="relative w-full max-w-[400px] animate-fade-in-up">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-5">
          <div className="relative mb-2.5">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Tv className="w-6 h-6 text-primary-fg" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Heart className="w-2 h-2 text-accent" />
            </span>
          </div>
          <h1 className="font-display text-lg font-extrabold text-text tracking-tight">Bora-Log</h1>
        </div>

        {/* Card body */}
        <div className="relative rounded-3xl bg-surface/90 backdrop-blur-xl border border-border shadow-2xl shadow-black/20 overflow-hidden">
          {/* Top accent strip */}
          <div className="h-1 gradient-primary" />

          {/* Header section */}
          <div className="px-7 pt-6 pb-4 text-center">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.22em] mb-1">
              {mode === "login" ? "Admit One" : "New Ticket"}
            </p>
            <h2 className="font-display text-xl font-extrabold text-text tracking-tight">
              {mode === "login" ? "Welcome back" : "Join the club"}
            </h2>
            <p className="text-text-subtle text-[13px] mt-1">
              {mode === "login" ? "Pick up where you left off." : "Build your cozy TV library."}
            </p>
          </div>

          {/* Single perforated divider */}
          <div className="relative h-4 ticket-perforation mx-3">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-bg" />
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-bg" />
          </div>

          {/* Form section */}
          <div className="px-7 pb-7 pt-3">
            {/* Sliding pill tab */}
            <div className="relative flex gap-1 p-1 rounded-xl bg-bg/50 mb-5">
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-surface shadow-sm border border-border transition-transform duration-300 ease-out ${mode === "signup" ? "translate-x-[calc(100%+8px)]" : "translate-x-0"}`}
              />
              <button
                onClick={() => switchMode("login")}
                className={`relative flex-1 py-2 rounded-lg text-[13px] font-semibold transition-colors duration-200 ${mode === "login" ? "text-text" : "text-text-muted hover:text-text"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode("signup")}
                className={`relative flex-1 py-2 rounded-lg text-[13px] font-semibold transition-colors duration-200 ${mode === "signup" ? "text-text" : "text-text-muted hover:text-text"}`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <div className="auth-input-wrap">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle z-10" />
                  <input
                    type="text"
                    name="username"
                    placeholder="Pick a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-lg text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/15"
                    required
                  />
                  <div className="auth-input-glow" />
                </div>
              )}
              <div className="auth-input-wrap">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle z-10" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/15"
                  required
                />
                <div className="auth-input-glow" />
              </div>
              <div className="auth-input-wrap">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 rounded-lg text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/15"
                  required
                />
                <div className="auth-input-glow" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-muted transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="px-3.5 py-2.5 rounded-lg bg-error/10 border border-error/30 text-error text-sm flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-error mt-1.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-3 rounded-xl gradient-primary text-primary-fg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
              >
                {loading ? (
                  <Spinner size={18} />
                ) : (
                  <>
                    {mode === "login" ? "Enter the library" : "Claim your ticket"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch mode link */}
            <p className="text-center text-sm text-text-subtle mt-4">
              {mode === "login" ? "Don't have a ticket yet?" : "Already have a ticket?"}
              <button
                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                className="text-primary font-semibold hover:underline ml-1 transition-colors"
              >
                {mode === "login" ? "Get one" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-text-subtle mt-4">
          By continuing you agree to keep your watch log cozy and kind.
        </p>
      </div>
    </main>
  );
}
