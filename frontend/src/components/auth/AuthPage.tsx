"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Tv,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Spinner } from "@/components/ui/Spinner";
import * as authService from "@/services/auth.service";
import { MOOD_ICONS } from "@/lib/mood-icons";
import { MOOD_LABELS } from "@/lib/constants";
import type { Mood } from "@/types";

interface AuthPageProps {
  initialMode?: "login" | "signup";
}

type Screen = "signin" | "signup" | "forgot" | "sent";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The mood characters are the product's essence (how a title made you feel),
// so they become the signature of the auth screen.
const MOODS: { mood: Mood; color: string; rotate: number }[] = [
  { mood: "happy", color: "#fbbf24", rotate: -10 },
  { mood: "cozy", color: "#fb923c", rotate: 7 },
  { mood: "romantic", color: "#ec4899", rotate: -5 },
  { mood: "thrilled", color: "#a855f7", rotate: 9 },
  { mood: "nerdy", color: "#38bdf8", rotate: -8 },
  { mood: "thoughtful", color: "#4ade80", rotate: 5 },
  { mood: "adventurous", color: "#14b8a6", rotate: -4 },
];

export function AuthPage({ initialMode = "login" }: AuthPageProps) {
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  const [screen, setScreen] = useState<Screen>(initialMode === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  function switchScreen(next: Screen) {
    setScreen(next);
    setError(null);
    setFieldErrors({});
  }

  function validateAuth() {
    const errs: typeof fieldErrors = {};
    if (screen === "signup" && !username.trim()) errs.username = "Choose a username";
    if (!email.trim()) errs.email = "Email is required";
    else if (!EMAIL_RE.test(email.trim())) errs.email = "Enter a valid email address";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "At least 6 characters";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleAuth(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validateAuth()) return;

    setLoading(true);
    try {
      if (screen === "signin") {
        await signIn(email.trim(), password);
        addToast("success", "Welcome back");
      } else {
        await signUp(email.trim(), password, username.trim());
        addToast("success", "Your watch log is ready");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !EMAIL_RE.test(email.trim())) {
      setFieldErrors({ email: "Enter a valid email address" });
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSentEmail(email.trim());
      setScreen("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reset link");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (hasError?: boolean) =>
    `w-full pl-11 py-3 rounded-2xl text-sm text-text placeholder:text-text-subtle bg-bg/40 border transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
      hasError ? "border-error/60" : "border-border focus:border-primary/50"
    }`;

  const isAuth = screen === "signin" || screen === "signup";
  const title =
    screen === "signin"
      ? "Good to see you again"
      : screen === "signup"
        ? "Start your watch log"
        : screen === "forgot"
          ? "Reset your password"
          : "Check your inbox";
  const subtitle =
    screen === "signin"
      ? "Your watch log is right where you left it."
      : screen === "signup"
        ? "Track what you watch and how it made you feel."
        : screen === "forgot"
          ? "We'll email you a link to get back in."
          : `If an account exists for ${sentEmail}, a reset link is on its way.`;

  return (
    <main className="relative min-h-[100dvh] bg-bg flex p-4 sm:p-6 lg:p-8">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-24 w-[32rem] h-[32rem] rounded-full bg-primary/15 blur-[150px]" />
        <div className="absolute -bottom-40 -right-24 w-[32rem] h-[32rem] rounded-full bg-accent/15 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl m-auto">
        {/* Diary spread */}
        <div className="relative rounded-[24px] lg:rounded-[28px] bg-surface border border-border shadow-2xl shadow-black/25 overflow-hidden animate-fade-in-up">
          {/* Top accent strip */}
          <div className="h-1.5 gradient-primary" />

          {/* Center spine + perforation (desktop) */}
          <div aria-hidden className="hidden lg:block">
            <div className="absolute left-1/2 top-10 bottom-10 -translate-x-1/2 border-l border-dashed border-border" />
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-bg" />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-bg" />
          </div>

          <div className="grid lg:grid-cols-2">
            {/* ── Left page: brand + mood constellation ─────────── */}
            <section className="relative px-6 pt-6 pb-2 sm:px-10 sm:pt-8 lg:py-12 flex flex-col justify-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Tv className="w-5 h-5 text-primary-fg" />
                </div>
                <span className="font-display text-lg font-extrabold gradient-text">Bora-Log</span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-text leading-[1.12] mt-5 sm:mt-6">
                How did it make
                <br />
                you <span className="gradient-text">feel?</span>
              </h1>
              <p className="hidden sm:block text-text-muted text-sm mt-3 max-w-xs">
                A cozy diary for the shows you watch.
              </p>

              {/* Mood constellation */}
              <div className="mt-5 lg:mt-8 flex flex-nowrap lg:flex-wrap gap-2 sm:gap-2.5 lg:gap-3 max-w-full lg:max-w-[280px]">
                {MOODS.map(({ mood, color, rotate }, i) => {
                  const Icon = MOOD_ICONS[mood];
                  return (
                    <div
                      key={mood}
                      className={i >= 5 ? "hidden sm:block" : ""}
                      style={{ transform: `rotate(${rotate}deg)` }}
                    >
                      <div className="animate-float" style={{ animationDelay: `${i * 0.35}s` }}>
                        <div
                          title={MOOD_LABELS[mood]}
                          className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-2xl border transition-transform duration-200 hover:scale-110"
                          style={{ background: `${color}1f`, borderColor: `${color}33`, color }}
                        >
                          <Icon className="w-[18px] h-[18px]" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── Right page: the form ─────────────────────────── */}
            <section className="relative px-6 pb-6 pt-1 sm:px-10 sm:pb-8 lg:py-12 flex items-center">
              <div className="w-full max-w-[360px] mx-auto">
                <div className="mb-6">
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-text tracking-tight">{title}</h2>
                  <p className="text-text-muted text-sm mt-1.5">{subtitle}</p>
                </div>

                {/* Segmented control (auth only) */}
                {isAuth && (
                  <div className="relative flex gap-1 p-1 rounded-2xl bg-bg/50 border border-border mb-5">
                    <div
                      className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl gradient-primary shadow-sm transition-transform duration-300 ease-out ${
                        screen === "signup" ? "translate-x-[calc(100%+8px)]" : "translate-x-0"
                      }`}
                    />
                    <button
                      onClick={() => switchScreen("signin")}
                      className={`relative flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors duration-200 ${
                        screen === "signin" ? "text-primary-fg" : "text-text-muted hover:text-text"
                      }`}
                    >
                      Sign in
                    </button>
                    <button
                      onClick={() => switchScreen("signup")}
                      className={`relative flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors duration-200 ${
                        screen === "signup" ? "text-primary-fg" : "text-text-muted hover:text-text"
                      }`}
                    >
                      Create account
                    </button>
                  </div>
                )}

                {/* ── Sign in / Sign up ─────────────────────────── */}
                {isAuth && (
                  <form onSubmit={handleAuth} className="space-y-3 sm:space-y-3.5" noValidate>
                    {screen === "signup" && (
                      <div>
                        <div className="relative">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle z-10" />
                          <input
                            type="text"
                            autoComplete="username"
                            placeholder="Pick a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            aria-invalid={!!fieldErrors.username}
                            className={inputClass(!!fieldErrors.username)}
                          />
                        </div>
                        {fieldErrors.username && <p className="mt-1.5 text-xs text-error pl-1">{fieldErrors.username}</p>}
                      </div>
                    )}

                    <div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle z-10" />
                        <input
                          type="email"
                          autoComplete="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          aria-invalid={!!fieldErrors.email}
                          className={inputClass(!!fieldErrors.email)}
                        />
                      </div>
                      {fieldErrors.email && <p className="mt-1.5 text-xs text-error pl-1">{fieldErrors.email}</p>}
                    </div>

                    <div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle z-10" />
                        <input
                          type={showPassword ? "text" : "password"}
                          autoComplete={screen === "signin" ? "current-password" : "new-password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          aria-invalid={!!fieldErrors.password}
                          className={`${inputClass(!!fieldErrors.password)} !pr-11`}
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

                      {screen === "signin" && (
                        <div className="flex justify-end mt-2">
                          <button
                            type="button"
                            onClick={() => switchScreen("forgot")}
                            className="text-xs font-medium text-text-subtle hover:text-primary transition-colors"
                          >
                            Forgot your password?
                          </button>
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="px-3.5 py-2.5 rounded-2xl bg-error/10 border border-error/30 text-error text-sm flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-error mt-1.5 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-1 py-3 rounded-2xl gradient-primary text-primary-fg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                    >
                      {loading ? (
                        <Spinner size={18} />
                      ) : (
                        <>
                          {screen === "signin" ? "Sign in" : "Create account"}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* ── Forgot password ───────────────────────────── */}
                {screen === "forgot" && (
                  <form onSubmit={handleForgot} className="space-y-3 sm:space-y-3.5" noValidate>
                    <div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle z-10" />
                        <input
                          type="email"
                          autoComplete="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          aria-invalid={!!fieldErrors.email}
                          className={inputClass(!!fieldErrors.email)}
                        />
                      </div>
                      {fieldErrors.email && <p className="mt-1.5 text-xs text-error pl-1">{fieldErrors.email}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-2xl gradient-primary text-primary-fg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                    >
                      {loading ? (
                        <Spinner size={18} />
                      ) : (
                        <>
                          Send reset link
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => switchScreen("signin")}
                      className="w-full flex items-center justify-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors py-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to sign in
                    </button>
                  </form>
                )}

                {/* ── Sent confirmation ─────────────────────────── */}
                {screen === "sent" && (
                  <div>
                    <div className="w-14 h-14 rounded-2xl gradient-primary-soft border border-primary/25 flex items-center justify-center text-primary mb-5">
                      <Check className="w-7 h-7" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setScreen("signin");
                        setPassword("");
                        setError(null);
                      }}
                      className="w-full py-3 rounded-2xl bg-surface-hover border border-border text-text font-semibold text-sm hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                    >
                      Back to sign in
                    </button>
                  </div>
                )}

                {/* Footer switch */}
                {isAuth && (
                  <p className="text-center text-sm text-text-subtle mt-5">
                    {screen === "signin" ? "New here?" : "Already have a log?"}
                    <button
                      onClick={() => switchScreen(screen === "signin" ? "signup" : "signin")}
                      className="text-primary font-semibold hover:underline ml-1 transition-colors"
                    >
                      {screen === "signin" ? "Create an account" : "Sign in"}
                    </button>
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
