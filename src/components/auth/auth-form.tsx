"use client";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register" | "forgot" | "reset";

function safeNext() {
  const requested = new URLSearchParams(window.location.search).get("next");
  return requested?.startsWith("/") && !requested.startsWith("//")
    ? requested
    : "/garage";
}

function callbackUrl(next: string) {
  const callback = new URL("/auth/callback", window.location.origin);
  callback.searchParams.set("next", next);
  return callback.toString();
}

export function AuthForm({
  mode,
  configured,
}: {
  mode: AuthMode;
  configured: boolean;
}) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmedMinimumAge, setConfirmedMinimumAge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!configured || mode === "reset") return;
    void createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) router.replace(safeNext());
      });
  }, [configured, mode, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setMessage("");

    if (!configured) {
      setError(t("errors.unconfigured"));
      return;
    }
    if ((mode === "register" || mode === "reset") && password.length < 8) {
      setError(t("errors.length"));
      return;
    }
    if (
      (mode === "register" || mode === "reset") &&
      password !== confirmPassword
    ) {
      setError(t("errors.match"));
      return;
    }
    if (mode === "register" && !acceptedTerms) {
      setError(t("errors.terms"));
      return;
    }
    if (mode === "register" && !confirmedMinimumAge) {
      setError(t("errors.age"));
      return;
    }

    setLoading(true);
    try {
      const client = createClient();
      if (mode === "login") {
        const { data, error: authError } = await client.auth.signInWithPassword(
          {
            email,
            password,
          },
        );
        if (authError) throw authError;
        if (!data.session) throw new Error(t("errors.generic"));
        window.location.replace(safeNext());
      }

      if (mode === "register") {
        const { data, error: authError } = await client.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name.trim(),
              minimum_age_acknowledged_at: new Date().toISOString(),
              minimum_age_version: "2026-10-06",
            },
            emailRedirectTo: callbackUrl("/garage"),
          },
        });
        if (authError) throw authError;
        if (data.session) {
          window.location.replace("/garage");
        } else {
          setMessage(t("messages.created"));
        }
      }

      if (mode === "forgot") {
        const { error: authError } = await client.auth.resetPasswordForEmail(
          email,
          { redirectTo: callbackUrl("/reset-password") },
        );
        if (authError) throw authError;
        setMessage(t("messages.resetSent"));
      }

      if (mode === "reset") {
        const { error: authError } = await client.auth.updateUser({ password });
        if (authError) throw authError;
        setMessage(t("messages.updated"));
        window.setTimeout(() => router.replace("/garage"), 900);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  const needsEmail = mode !== "reset";
  const needsPassword = mode !== "forgot";

  return (
    <main
      id="main-content"
      className="relative min-h-[calc(100dvh-4.5rem)] overflow-hidden bg-[#080808] px-4 py-5 text-[#f5f2ed] sm:min-h-[calc(100dvh-5rem)] sm:px-7 sm:py-7"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_17%,rgba(231,45,69,0.2),transparent_27%),radial-gradient(circle_at_18%_88%,rgba(231,45,69,0.1),transparent_24%)]" />
      <div className="relative mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-7xl flex-col">
        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_0.78fr] lg:py-16">
          <section className="hidden max-w-xl lg:block">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#ff667a] uppercase">
              {t("private")}
            </p>
            <h2 className="mt-6 text-7xl font-medium tracking-[-0.065em] text-balance">
              {t("oneAccount")}
              <br />
              {t("wholeBuild")}
            </h2>
            <p className="mt-7 max-w-md text-base leading-7 text-white/42">
              {t("accountDescription")}
            </p>
          </section>

          <section className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-[#111111]/95 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[#ff667a] uppercase">
              {t(`${mode}.eyebrow`)}
            </p>
            <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em]">
              {t(`${mode}.title`)}
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/42">
              {t(`${mode}.description`)}
            </p>

            <form
              className="mt-8 space-y-4"
              onSubmit={submit}
              onInvalid={(event) => {
                const field = event.target as HTMLInputElement;
                setError(field.validationMessage || t("errors.invalid"));
              }}
            >
              {mode === "register" && (
                <Field
                  label={t("name")}
                  icon={<UserRound className="size-4" />}
                >
                  <input
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t("namePlaceholder")}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                  />
                </Field>
              )}

              {needsEmail && (
                <Field label={t("email")} icon={<Mail className="size-4" />}>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                  />
                </Field>
              )}

              {needsPassword && (
                <Field
                  label={mode === "reset" ? t("newPassword") : t("password")}
                  icon={<LockKeyhole className="size-4" />}
                  action={
                    <button
                      type="button"
                      aria-label={
                        showPassword ? t("hidePassword") : t("showPassword")
                      }
                      onClick={() => setShowPassword((current) => !current)}
                      className="text-white/30 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  }
                >
                  <input
                    required
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t("passwordPlaceholder")}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                  />
                </Field>
              )}

              {(mode === "register" || mode === "reset") && (
                <Field
                  label={t("confirmPassword")}
                  icon={<LockKeyhole className="size-4" />}
                >
                  <input
                    required
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder={t("confirmPlaceholder")}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                  />
                </Field>
              )}

              {mode === "login" && (
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-white/45 transition hover:text-white"
                  >
                    {t("forgotLink")}
                  </Link>
                </div>
              )}

              {mode === "register" && (
                <div className="space-y-3 rounded-xl border border-white/8 bg-white/[0.025] p-4">
                  <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/45">
                    <input
                      required
                      type="checkbox"
                      checked={confirmedMinimumAge}
                      onChange={(event) =>
                        setConfirmedMinimumAge(event.target.checked)
                      }
                      className="mt-0.5 size-4 shrink-0 accent-[#e72d45]"
                    />
                    <span>{t("confirmAge")}</span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-white/45">
                    <input
                      required
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(event) =>
                        setAcceptedTerms(event.target.checked)
                      }
                      className="mt-0.5 size-4 shrink-0 accent-[#e72d45]"
                    />
                    <span>
                      {t("accept")}{" "}
                      <Link href="/terms" className="text-white/70 underline">
                        {t("terms")}
                      </Link>{" "}
                      {t("and")}{" "}
                      <Link href="/privacy" className="text-white/70 underline">
                        {t("privacy")}
                      </Link>
                      .
                    </span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-white transition hover:bg-[#f33d55] disabled:opacity-50"
              >
                {loading ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4" />
                )}
                {t(`${mode}.action`)}
              </button>
            </form>

            {message && (
              <p className="mt-5 flex gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/6 p-4 text-xs leading-5 text-emerald-100/75">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> {message}
              </p>
            )}
            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-red-300/15 bg-red-300/6 p-4 text-xs leading-5 text-red-100/75"
              >
                {error}
              </p>
            )}

            {mode === "login" && (
              <p className="mt-7 text-center text-xs text-white/35">
                {t("newToCapcar")}{" "}
                <Link
                  href="/register"
                  className="font-medium text-white/75 hover:text-white"
                >
                  {t("createAccount")}
                </Link>
              </p>
            )}
            {mode === "register" && (
              <p className="mt-7 text-center text-xs text-white/35">
                {t("haveAccount")}{" "}
                <Link
                  href="/login"
                  className="font-medium text-white/75 hover:text-white"
                >
                  {t("signIn")}
                </Link>
              </p>
            )}
            {(mode === "forgot" || mode === "reset") && (
              <p className="mt-7 text-center text-xs text-white/35">
                <Link
                  href="/login"
                  className="font-medium text-white/75 hover:text-white"
                >
                  {t("backToSignIn")}
                </Link>
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  icon,
  action,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block rounded-xl border border-white/10 bg-black/20 px-4 py-3 transition focus-within:border-[#e72d45]/60">
      <span className="mb-2 flex items-center justify-between text-[10px] font-semibold tracking-[0.12em] text-white/30 uppercase">
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        {action}
      </span>
      {children}
    </label>
  );
}
