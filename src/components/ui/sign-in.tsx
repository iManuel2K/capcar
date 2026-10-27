"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { SignInPhotoPanel, type SignInPhoto } from "./sign-in-photo-panel";
import styles from "./sign-in.module.css";

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

const defaultLabels = {
  email: "Email address",
  emailPlaceholder: "Enter your email address",
  password: "Password",
  passwordPlaceholder: "Enter your password",
  showPassword: "Show password",
  hidePassword: "Hide password",
  rememberMe: "Keep me signed in",
  resetPassword: "Reset password",
  signIn: "Sign in",
  continueWith: "Or continue with",
  google: "Continue with Google",
  newAccount: "New to CapCar?",
  createAccount: "Create account",
};

export interface SignInPageProps {
  title?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  heroImageSrc?: string;
  heroImageAlt?: string;
  heroContent?: ReactNode;
  testimonials?: Testimonial[];
  photo?: SignInPhoto;
  brand?: ReactNode;
  footer?: ReactNode;
  labels?: Partial<typeof defaultLabels>;
  email?: string;
  password?: string;
  onEmailChange?: (value: string) => void;
  onPasswordChange?: (value: string) => void;
  onSignIn?: (event: FormEvent<HTMLFormElement>) => void;
  onInvalid?: (event: FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  onRememberMeChange?: (checked: boolean) => void;
  resetPasswordHref?: string;
  createAccountHref?: string;
  loading?: boolean;
  message?: string;
  error?: string;
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z"
      />
    </svg>
  );
}

function GlassInputWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="border-input bg-background/35 focus-within:border-primary focus-within:ring-primary/30 rounded-lg border transition-colors focus-within:ring-2">
      {children}
    </div>
  );
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  return (
    <figure
      className="capcar-sign-in-testimonial border-border bg-card/70 min-w-0 flex-1 rounded-3xl border p-5 backdrop-blur-xl"
      style={{ animationDelay: `${300 + index * 50}ms` }}
    >
      <figcaption className="flex items-center gap-3">
        <Image
          src={testimonial.avatarSrc}
          width={40}
          height={40}
          unoptimized
          alt=""
          className="size-10 rounded-2xl object-cover"
        />
        <div className="min-w-0 text-sm">
          <p className="font-medium">{testimonial.name}</p>
          <p className="text-muted-foreground">{testimonial.handle}</p>
        </div>
      </figcaption>
      <blockquote className="text-foreground/90 mt-3 text-sm leading-relaxed">
        {testimonial.text}
      </blockquote>
    </figure>
  );
}

export function SignInPage({
  title = "Welcome back",
  description = "Access your account and continue your journey with CapCar.",
  eyebrow,
  heroImageSrc,
  heroImageAlt = "",
  heroContent,
  testimonials = [],
  photo,
  brand,
  footer,
  labels,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onInvalid,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  onRememberMeChange,
  resetPasswordHref,
  createAccountHref,
  loading = false,
  message,
  error,
}: SignInPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const id = useId();
  const copy = { ...defaultLabels, ...labels };
  const hasHero = Boolean(
    photo || heroImageSrc || heroContent || testimonials.length,
  );
  const actionClass =
    "text-primary hover:text-primary-hover inline-flex min-h-11 items-center rounded text-sm underline-offset-4 hover:underline";

  return (
    <main id="main-content" className={styles.page} data-has-photo={hasHero}>
      {photo ? (
        <SignInPhotoPanel photo={photo} />
      ) : (
        hasHero && (
          <section className={styles.fallbackHero}>
            {heroContent}
            {heroImageSrc && (
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={heroImageSrc}
                  alt={heroImageAlt}
                  fill
                  unoptimized={!heroImageSrc.startsWith("/")}
                  sizes="(max-width: 1023px) 100vw, 53vw"
                  className="object-contain"
                />
              </div>
            )}
            {testimonials.length > 0 && (
              <div className="grid gap-4 xl:grid-cols-2">
                {testimonials.slice(0, 3).map((testimonial, index) => (
                  <TestimonialCard
                    key={`${testimonial.name}-${index}`}
                    testimonial={testimonial}
                    index={index}
                  />
                ))}
              </div>
            )}
          </section>
        )
      )}
      <section
        aria-labelledby={`${id}-title`}
        className={`capcar-light-section ${styles.formPanel}`}
      >
        {brand && <div className={styles.brand}>{brand}</div>}
        <div className={styles.formContent}>
          <div className="capcar-sign-in-element">
            {eyebrow && (
              <p className="text-primary mb-5 text-xs font-semibold tracking-[0.16em] uppercase">
                {eyebrow}
              </p>
            )}
            <h1
              id={`${id}-title`}
              className="text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl"
            >
              {title}
            </h1>
            <p className="text-muted-foreground mt-3 text-sm leading-6 md:text-base">
              {description}
            </p>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!loading) onSignIn?.(event);
            }}
            onInvalid={onInvalid}
            aria-busy={loading}
            aria-describedby={error ? `${id}-error` : undefined}
            className="capcar-sign-in-element mt-7 space-y-4"
            style={{ animationDelay: "50ms" }}
          >
            <div className="space-y-2">
              <label
                htmlFor={`${id}-email`}
                className="text-muted-foreground text-sm font-medium"
              >
                {copy.email}
              </label>
              <GlassInputWrapper>
                <input
                  id={`${id}-email`}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => onEmailChange?.(event.target.value)}
                  placeholder={copy.emailPlaceholder}
                  className="placeholder:text-muted-foreground min-h-12 w-full rounded-lg bg-transparent p-3 text-base focus:outline-none"
                />
              </GlassInputWrapper>
            </div>
            <div className="space-y-2">
              <label
                htmlFor={`${id}-password`}
                className="text-muted-foreground text-sm font-medium"
              >
                {copy.password}
              </label>
              <GlassInputWrapper>
                <div className="relative">
                  <input
                    id={`${id}-password`}
                    name="password"
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => onPasswordChange?.(event.target.value)}
                    placeholder={copy.passwordPlaceholder}
                    className="placeholder:text-muted-foreground min-h-12 w-full rounded-lg bg-transparent p-3 pr-16 text-base focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? copy.hidePassword : copy.showPassword
                    }
                    aria-pressed={showPassword}
                    aria-controls={`${id}-password`}
                    onClick={() => setShowPassword((current) => !current)}
                    className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-2 my-auto grid size-11 place-items-center rounded-xl transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" className="size-5" />
                    ) : (
                      <Eye aria-hidden="true" className="size-5" />
                    )}
                  </button>
                </div>
              </GlassInputWrapper>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
              {onRememberMeChange && (
                <label className="flex min-h-11 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    onChange={(event) =>
                      onRememberMeChange(event.target.checked)
                    }
                    className="accent-primary size-4"
                  />
                  <span>{copy.rememberMe}</span>
                </label>
              )}
              {resetPasswordHref ? (
                <Link
                  href={resetPasswordHref}
                  className={`${actionClass} ml-auto`}
                >
                  {copy.resetPassword}
                </Link>
              ) : onResetPassword ? (
                <button
                  type="button"
                  onClick={onResetPassword}
                  className={`${actionClass} ml-auto`}
                >
                  {copy.resetPassword}
                </button>
              ) : null}
            </div>
            {error && (
              <p
                id={`${id}-error`}
                role="alert"
                className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border p-4 text-sm leading-6"
              >
                {error}
              </p>
            )}
            {message && (
              <p
                role="status"
                className="border-border bg-card/70 rounded-xl border p-4 text-sm leading-6"
              >
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !onSignIn}
              className="bg-primary text-primary-foreground hover:bg-primary-hover min-h-12 w-full rounded-lg px-5 py-3 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <span
                  aria-hidden="true"
                  className="border-primary-foreground/30 border-t-primary-foreground mr-3 inline-block size-4 rounded-full border-2 motion-safe:animate-spin"
                />
              )}
              {copy.signIn}
            </button>
          </form>

          {onGoogleSignIn && (
            <div
              className="capcar-sign-in-element mt-6 space-y-6"
              style={{ animationDelay: "100ms" }}
            >
              <div className="text-muted-foreground flex items-center gap-4 text-sm">
                <span className="border-border flex-1 border-t" />
                <span>{copy.continueWith}</span>
                <span className="border-border flex-1 border-t" />
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={onGoogleSignIn}
                className="border-border bg-card/40 hover:bg-secondary flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border px-4 py-4 transition-colors disabled:opacity-60"
              >
                <GoogleIcon />
                {copy.google}
              </button>
            </div>
          )}
          {(createAccountHref || onCreateAccount) && (
            <p
              className="capcar-sign-in-element text-muted-foreground mt-6 text-center text-sm"
              style={{ animationDelay: "150ms" }}
            >
              {copy.newAccount}{" "}
              {createAccountHref ? (
                <Link href={createAccountHref} className={actionClass}>
                  {copy.createAccount}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onCreateAccount}
                  className={actionClass}
                >
                  {copy.createAccount}
                </button>
              )}
            </p>
          )}
        </div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </section>
    </main>
  );
}
