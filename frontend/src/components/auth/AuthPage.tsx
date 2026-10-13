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
  Clapperboard,
  Clock3,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Spinner } from "@/components/ui/Spinner";

interface AuthPageProps {
  initialMode?: "login" | "signup";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FEATURES = [
  { icon: Clapperboard, title: "Your whole library", text: "Movies and series in one cozy, filterable log." },
  { icon: Heart, title: "Mood by mood", text: "Tag how each title made you feel." },
  { icon: Clock3, title: "Time you invested", text: "From a quick episode to a full binge." },
];

export function AuthPage({ initialMode = "login" }: AuthPageProps) {
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  function switchMode(nextMode: "login" | "signup") {
    setMode(nextMode);
    setError(null);
    setFieldErrors({});
  }

  function validate() {
    const errs: typeof fieldErrors = {};
    if (mode === "signup" && !username.trim()) errs.username = "Choose a username";
    if (!email.trim()) errs.email = "Email is required";
    else if (!EMAIL_RE.test(email.trim())) errs.email = "Enter a valid email address";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "At least 6 characters";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email.trim(), password);
        addToast("success", "Welcome back");
      } else {
        await signUp(email.trim(), password, username.trim());
        addToast("success", "Your account is ready");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-text placeholder:text-text-subtle bg-bg/40 border transition-all focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <main className="min-h-screen bg-bg relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-24 w-[34rem] h-[34rem] rounded-full bg-primary/15 blur-[150px]" />
        <div className="absolute -bottom-40 -right-24 w-[34rem] h-[34rem] rounded-full bg-accent/15 blur-[150px]" />
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">
        {/* ── Visual panel ─────────────────────────────────────────── */}
        <section className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 xl:p-16 border-r border-border">
          <div className="absolute inset-0 opacity-[0.5]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15" />
            <div className="absolute top-[18%] left-[14%] w-8 h-8 text-primary/25 rotate-[-12deg]">
              <Tv className="w-full h-full" />
            </div>
            <div className="absolute top-[62%] right-[16%] w-10 h-10 text-accent/25 rotate-[16deg]">
              <Clapperboard className="w-full h-full" />
            </div>
            <div className="absolute bottom-[16%] left-[22%] w-6 h-6 text-warning/30 rotate-[10deg]">
              <Sparkles className="w-full h-full" />
            </div>
          </div>

          {/* Brand */}
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Tv className="w-6 h-6 text-primary-fg" />
            </div>
            <span className="font-display text-2xl font-extrabold gradient-text">Bora-Log</span>
          </div>

          {/* Headline */}
          <div className="relative max-w-md">
            <h1 className="font-display text-4xl xl:text-5xl font-extrabold text-text leading-[1.1] mb-4">
              Your media diary,
              <br />
              <span className="gradient-text">mood by mood.</span>
            </h1>
            <p className="text-text-muted text-lg mb-10">
              Catalog the movies and series you watch, how they made you feel and how much time they took.
            </p>

            <ul className="space-y-5">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-text">{title}</p>
                    <p className="text-sm text-text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-text-subtle">Keep your watch log cozy and kind.</p>
        </section>

        {/* ── Form panel ───────────────────────────────────────────── */}
        <section className="flex items-center justify-center p-5 sm:p-10">
          <div className="w-full max-w-[400px] animate-fade-in-up">
            {/* Compact brand for mobile */}
            <div className="lg:hidden flex flex-col items-center mb-6">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Tv className="w-6 h-6 text-primary-fg" />
              </div>
              <span className="font-display text-lg font-extrabold gradient-text mt-2">Bora-Log</span>
            </div>

            <div className="text-center mb-6">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.22em] mb-1">
                {mode === "login" ? "Admit One" : "New Ticket"}
              </p>
              <h2 className="font-display text-2xl font-extrabold text-text tracking-tight">
                {mode === "login" ? "Welcome back" : "Join the club"}
              </h2>
              <p className="text-text-subtle text-sm mt-1">
                {mode === "login" ? "Pick up where you left off." : "Build your cozy watch library."}
              </p>
            </div>

            {/* Segmented control */}
            <div className="relative flex gap-1 p-1 rounded-xl bg-surface border border-border mb-5">
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg gradient-primary shadow-sm transition-transform duration-300 ease-out ${
                  mode === "signup" ? "translate-x-[calc(100%+8px)]" : "translate-x-0"
                }`}
              />
              <button
                onClick={() => switchMode("login")}
                className={`relative flex-1 py-2 rounded-lg text-[13px] font-semibold transition-colors duration-200 ${
                  mode === "login" ? "text-primary-fg" : "text-text-muted hover:text-text"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode("signup")}
                className={`relative flex-1 py-2 rounded-lg text-[13px] font-semibold transition-colors duration-200 ${
                  mode === "signup" ? "text-primary-fg" : "text-text-muted hover:text-text"
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              {mode === "signup" && (
                <div>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle z-10" />
                    <input
                      type="text"
                      name="username"
                      autoComplete="username"
                      placeholder="Pick a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`${inputBase} ${fieldErrors.username ? "border-error/60" : "border-border focus:border-primary/50"}`}
                    />
                  </div>
                  {fieldErrors.username && <p className="mt-1.5 text-xs text-error pl-1">{fieldErrors.username}</p>}
                </div>
              )}

              <div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle z-10" />
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputBase} ${fieldErrors.email ? "border-error/60" : "border-border focus:border-primary/50"}`}
                  />
                </div>
                {fieldErrors.email && <p className="mt-1.5 text-xs text-error pl-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle z-10" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputBase} !pr-11 ${fieldErrors.password ? "border-error/60" : "border-border focus:border-primary/50"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-muted transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="mt-1.5 text-xs text-error pl-1">{fieldErrors.password}</p>}
              </div>

              {error && (
                <div className="px-3.5 py-2.5 rounded-xl bg-error/10 border border-error/30 text-error text-sm flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-error mt-1.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-3 rounded-xl gradient-primary text-primary-fg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
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

            <p className="text-center text-sm text-text-subtle mt-4">
              {mode === "login" ? "Don't have a ticket yet?" : "Already have a ticket?"}
              <button
                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                className="text-primary font-semibold hover:underline ml-1 transition-colors"
              >
                {mode === "login" ? "Get one" : "Sign in"}
              </button>
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-text-subtle">
              <Sparkles className="w-3.5 h-3.5 text-primary/70" />
              Demo: emails starting with <span className="font-mono text-text-muted">admin</span> get admin access
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
