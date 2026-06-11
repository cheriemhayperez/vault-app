"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User } from "lucide-react";

import { AuthField } from "@/components/auth/auth-field";
import { AuthFormError } from "@/components/auth/auth-form-error";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { VaultLogo } from "@/components/auth/vault-logo";
import { supabase } from "@/lib/supabaseClient";

interface VaultAuthPageProps {
  initialSignUp?: boolean;
}

const desktopOverlayTransition =
  "md:transition-[left,border-radius] md:duration-700 md:ease-in-out md:will-change-[left,border-radius] motion-reduce:md:transition-none";

const desktopPanelTransition =
  "md:transition-[opacity,transform] md:duration-700 md:ease-in-out md:will-change-[opacity,transform] motion-reduce:md:transition-none motion-reduce:md:transform-none";

const mobileSlideTransition =
  "max-md:transition-all max-md:duration-500 max-md:ease-in-out max-md:will-change-[top,border-radius] motion-reduce:max-md:transition-none";

const mobileFormTransition =
  "max-md:transition-all max-md:duration-500 max-md:ease-in-out max-md:will-change-[opacity,transform] motion-reduce:max-md:transition-none motion-reduce:max-md:transform-none";

const mobileFormActive =
  "max-md:opacity-100 max-md:pointer-events-auto";
const mobileFormInactive =
  "max-md:opacity-0 max-md:pointer-events-none";

const syncAuthPath = (signUp: boolean) => {
  const path = signUp ? "/signup" : "/login";
  window.history.replaceState(window.history.state, "", path);
};

const desktopFormPanelClass =
  "md:absolute md:inset-y-0 md:z-[1] md:flex md:w-1/2 md:flex-col md:justify-center md:overflow-visible md:px-10 md:py-10";

const mobileFormShell =
  "max-md:absolute max-md:inset-0 max-md:z-10 max-md:flex max-md:flex-col max-md:overflow-hidden";

const mobilePromoReserve = "hidden shrink-0 max-md:block max-md:h-[10.5rem]";

const mobileFormBodyClass =
  "min-h-0 flex-1 overflow-hidden bg-white max-md:overflow-hidden md:flex-none md:bg-transparent md:overflow-visible";

const mobileFormInnerClass =
  "mx-auto flex w-full min-w-0 max-w-md flex-col max-md:items-center max-md:px-5 max-md:py-3 max-md:text-center md:mx-0 md:max-w-none md:h-full md:overflow-visible";

const mobileAuthHeaderLoginClass =
  "flex w-full flex-col items-center max-md:mt-5 md:contents";

const mobileAuthHeaderSignUpClass =
  "flex w-full flex-col items-center max-md:mt-5 md:contents";

const promoButtonClass =
  "inline-flex min-w-[9.5rem] items-center justify-center rounded-full border-2 border-white/90 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10";

export const VaultAuthPage = ({
  initialSignUp = false,
}: VaultAuthPageProps) => {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const isLogin = !isSignUp;

  useEffect(() => {
    setIsSignUp(initialSignUp);
  }, [initialSignUp]);

  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpNotice, setSignUpNotice] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const switchToSignUp = () => {
    setLoginError(null);
    setLoginNotice(null);
    setSignUpNotice(null);
    setIsSignUp(true);
    syncAuthPath(true);
  };

  const switchToLogin = () => {
    setSignUpError(null);
    setSignUpNotice(null);
    setIsSignUp(false);
    syncAuthPath(false);
  };

  const handleSignUpSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSignUpError(null);
    setSignUpNotice(null);

    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError("Passwords do not match.");
      return;
    }

    setIsSigningUp(true);

    try {
      const trimmedName = signUpName.trim();
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail.trim(),
        password: signUpPassword,
        options: {
          data: {
            full_name: trimmedName,
            name: trimmedName,
          },
        },
      });

      if (error) {
        setSignUpError(error.message);
        return;
      }

      if (data.user) {
        const registeredEmail = signUpEmail.trim();

        if (data.session) {
          await supabase.auth.signOut();
        }

        setSignUpPassword("");
        setSignUpConfirmPassword("");
        setLoginEmail(registeredEmail);
        setLoginNotice(
          data.session
            ? "Account created successfully. Please log in with your email and password."
            : "Account created. Check your email to confirm your address, then log in.",
        );
        setIsSignUp(false);
        syncAuthPath(false);
        return;
      }

      setSignUpError("Unable to create account. Please try again.");
    } catch {
      setSignUpError("Something went wrong. Please try again.");
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    setLoginNotice(null);
    setIsLoggingIn(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) {
        setLoginError(error.message);
        return;
      }

      router.push("/dashboard");
    } catch {
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-start justify-center overflow-x-hidden bg-gradient-to-br from-violet-50/80 via-slate-100 to-sky-100/70 px-4 py-6 max-md:fixed max-md:inset-0 max-md:h-screen max-md:w-screen max-md:items-center max-md:overflow-hidden max-md:px-5 max-md:py-8 sm:items-center sm:py-10">
      <div
        className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl max-md:scale-75 max-md:opacity-70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-8 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl max-md:scale-75 max-md:opacity-70"
        aria-hidden
      />

      <div className="relative my-auto w-full max-w-[920px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_-18px_rgba(76,29,149,0.35)] max-md:flex max-md:h-[calc(100dvh-2rem)] max-md:max-h-[760px] max-md:max-w-[380px] max-md:flex-col max-md:rounded-3xl max-md:shadow-xl md:h-[620px]">
        <div className="relative isolate h-full w-full overflow-hidden rounded-2xl bg-white max-md:rounded-3xl md:h-[620px]">
          {/* Mobile — solid white form zone behind promo + forms */}
          <div
            className="absolute inset-0 z-0 bg-white md:hidden"
            aria-hidden
          />

          {/* Mobile — sliding 40% promo panel */}
          <div
            className={`absolute left-0 right-0 z-30 flex h-[10.5rem] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-violet-900 via-indigo-950 to-slate-950 px-6 text-center text-white md:hidden ${mobileSlideTransition} ${
              isLogin
                ? "top-0 rounded-t-3xl rounded-b-[2.5rem]"
                : "bottom-0 top-auto rounded-b-3xl rounded-t-[2.5rem]"
            }`}
          >
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center ${mobileFormTransition} ${
                isLogin
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <h2 className="text-xl font-bold tracking-tight">
                Hello, Welcome!
              </h2>
              <p className="mt-2 max-w-xs text-sm text-violet-100/90">
                Don&apos;t have an account?
              </p>
              <button
                type="button"
                onClick={switchToSignUp}
                className={`mt-5 ${promoButtonClass}`}
              >
                Register
              </button>
            </div>

            <div
              className={`absolute inset-0 flex flex-col items-center justify-center ${mobileFormTransition} ${
                isSignUp
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <h2 className="text-xl font-bold tracking-tight">
                Welcome Back!
              </h2>
              <p className="mt-2 max-w-xs text-sm text-violet-100/90">
                Already have an account?
              </p>
              <button
                type="button"
                onClick={switchToLogin}
                className={`mt-5 ${promoButtonClass}`}
              >
                Login
              </button>
            </div>
          </div>

          {/* Login form — bottom 60% (ref: image 3) */}
          <section
            aria-hidden={isSignUp}
            className={`${desktopFormPanelClass} ${desktopPanelTransition} ${mobileFormShell} ${mobileFormTransition} md:right-0 ${
              isLogin ? mobileFormActive : mobileFormInactive
            } ${
              isLogin
                ? "md:pointer-events-auto md:translate-x-0 md:opacity-100"
                : "md:pointer-events-none md:translate-x-6 md:opacity-0"
            }`}
          >
            <div className={mobilePromoReserve} aria-hidden />
            <div className={mobileFormBodyClass}>
              <div className={`${mobileFormInnerClass} max-md:justify-start md:flex-none`}>
              <div className={mobileAuthHeaderLoginClass}>
                <VaultLogo
                  className="mb-2 max-md:h-9 max-md:w-auto md:mb-6"
                  height={44}
                />
                <h1 className="w-full text-center text-xl font-bold tracking-tight text-slate-900 md:text-left md:text-2xl">
                  Login
                </h1>
              </div>
              <p className="mt-1 hidden text-sm text-slate-500 md:block">
                Welcome back to your finance dashboard
              </p>

              <form
                onSubmit={handleLoginSubmit}
                className="mt-3 w-full min-w-0 space-y-2 max-md:mt-3 md:mt-6 md:space-y-3.5"
                aria-label="Login form"
              >
                <AuthFormError message={loginError} />
                <AuthFormError message={loginNotice} variant="success" />
                <AuthField
                  label="Email"
                  type="email"
                  name="login-email"
                  placeholder="Email"
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  icon={<Mail className="size-4" strokeWidth={2} />}
                />
                <div className="space-y-1.5 md:space-y-2">
                  <AuthField
                    label="Password"
                    type="password"
                    name="login-password"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    icon={<Lock className="size-4" strokeWidth={2} />}
                  />
                  <div className="flex justify-end max-md:justify-center">
                    <Link
                      href="#"
                      className="text-xs font-medium text-slate-500 transition hover:text-violet-600"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="mt-1 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-indigo-800 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-600 hover:to-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoggingIn ? "Signing in…" : "Login"}
                </button>
              </form>

              <SocialAuthButtons dividerText="or login with social platforms" />
              </div>
            </div>
          </section>

          {/* Sign Up form — top 60% (ref: image 4) */}
          <section
            aria-hidden={!isSignUp}
            className={`${desktopFormPanelClass} ${desktopPanelTransition} ${mobileFormShell} ${mobileFormTransition} md:left-0 ${
              isSignUp ? mobileFormActive : mobileFormInactive
            } ${
              isSignUp
                ? "md:pointer-events-auto md:translate-x-0 md:opacity-100"
                : "md:pointer-events-none md:-translate-x-6 md:opacity-0"
            }`}
          >
            <div className={mobileFormBodyClass}>
              <div className={`${mobileFormInnerClass} max-md:justify-start md:flex-none`}>
              <div className={mobileAuthHeaderSignUpClass}>
                <VaultLogo
                  className="mb-2 max-md:h-9 max-md:w-auto md:mb-6"
                  height={44}
                />
                <h1 className="w-full text-center text-xl font-bold tracking-tight text-slate-900 md:text-left md:text-2xl">
                  Sign Up
                </h1>
              </div>
              <p className="mt-1 hidden text-sm text-slate-500 md:block">
                Create your Vault account in seconds
              </p>

              <form
                onSubmit={handleSignUpSubmit}
                className="mt-2 w-full min-w-0 space-y-1.5 max-md:mt-2 md:mt-6 md:space-y-3.5"
                aria-label="Sign up form"
              >
                <AuthFormError message={signUpError} />
                <AuthFormError message={signUpNotice} variant="success" />
                <AuthField
                  label="Name"
                  type="text"
                  name="signup-name"
                  placeholder="Full name"
                  autoComplete="name"
                  value={signUpName}
                  onChange={(event) => setSignUpName(event.target.value)}
                  icon={<User className="size-4" strokeWidth={2} />}
                  className="!h-10"
                />
                <AuthField
                  label="Email"
                  type="email"
                  name="signup-email"
                  placeholder="Email"
                  autoComplete="email"
                  value={signUpEmail}
                  onChange={(event) => setSignUpEmail(event.target.value)}
                  icon={<Mail className="size-4" strokeWidth={2} />}
                  className="!h-10"
                />
                <AuthField
                  label="Password"
                  type="password"
                  name="signup-password"
                  placeholder="Password"
                  autoComplete="new-password"
                  value={signUpPassword}
                  onChange={(event) => setSignUpPassword(event.target.value)}
                  icon={<Lock className="size-4" strokeWidth={2} />}
                  className="!h-10"
                />
                <AuthField
                  label="Confirm Password"
                  type="password"
                  name="signup-confirm-password"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  value={signUpConfirmPassword}
                  onChange={(event) =>
                    setSignUpConfirmPassword(event.target.value)
                  }
                  icon={<Lock className="size-4" strokeWidth={2} />}
                  className="!h-10"
                />

                <button
                  type="submit"
                  disabled={isSigningUp}
                  className="mt-1 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-indigo-800 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-600 hover:to-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSigningUp ? "Creating account…" : "Create Account"}
                </button>
              </form>

              <SocialAuthButtons dividerText="or register with social platforms" />
              </div>
            </div>
            <div className={mobilePromoReserve} aria-hidden />
          </section>

          {/* Desktop promotional panel — unchanged split slide */}
          <div
            className={`hidden md:absolute md:top-0 md:bottom-0 md:z-10 md:flex md:w-1/2 md:flex-col md:items-center md:justify-center md:bg-gradient-to-br md:from-violet-800 md:via-violet-900 md:to-indigo-950 md:px-8 md:text-center md:text-white ${desktopOverlayTransition} ${
              isSignUp
                ? "md:left-1/2 md:rounded-r-2xl md:rounded-l-[5rem]"
                : "md:left-0 md:rounded-l-2xl md:rounded-r-[5rem]"
            }`}
          >
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center px-8 ${desktopPanelTransition} ${
                isSignUp
                  ? "pointer-events-none translate-x-8 opacity-0"
                  : "pointer-events-auto translate-x-0 opacity-100"
              }`}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Hello, Welcome!
              </h2>
              <p className="mt-3 max-w-xs text-sm text-violet-100/90 sm:text-base">
                Don&apos;t have an account?
              </p>
              <button
                type="button"
                onClick={switchToSignUp}
                className={`mt-8 ${promoButtonClass}`}
              >
                Register
              </button>
            </div>

            <div
              className={`absolute inset-0 flex flex-col items-center justify-center px-8 ${desktopPanelTransition} ${
                isSignUp
                  ? "pointer-events-auto translate-x-0 opacity-100"
                  : "pointer-events-none -translate-x-8 opacity-0"
              }`}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome Back!
              </h2>
              <p className="mt-3 max-w-xs text-sm text-violet-100/90 sm:text-base">
                Already have an account?
              </p>
              <button
                type="button"
                onClick={switchToLogin}
                className={`mt-8 ${promoButtonClass}`}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
