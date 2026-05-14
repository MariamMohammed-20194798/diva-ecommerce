"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/lib/api";

type Mode = "signin" | "signup";
type Step = "email" | "otp";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
      return message.join(", ");
    }
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }
  return "Something went wrong. Please try again.";
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const headerText = useMemo(() => {
    if (step === "otp") return "Enter OTP";
    return mode === "signin" ? "Signin" : "Signup";
  }, [mode, step]);

  const validateEmailStep = () => {
    if (!emailPattern.test(email)) {
      return "Please enter a valid email address.";
    }
    if (mode === "signup" && name.trim().length === 0) {
      return "Please enter your full name.";
    }
    return null;
  };

  const validateOtpStep = () => {
    if (otp.length !== 6) {
      return "OTP must be exactly 6 digits.";
    }
    return null;
  };

  const handleSendOtp = async () => {
    setError(null);
    setSuccess(null);

    const validationError = validateEmailStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/send-otp", {
        email,
        type: mode === "signin" ? "LOGIN" : "SIGNUP",
        ...(mode === "signup" && { name })
      });
      setSuccess("OTP sent to your email.");
      setStep("otp");
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setSuccess(null);

    const validationError = validateOtpStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/verify-otp", {
        email,
        code: otp,
        type: mode === "signin" ? "LOGIN" : "SIGNUP",
        ...(mode === "signup" && { name })
      });
      const accessToken = response.data?.accessToken as string | undefined;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      }

      setSuccess("Signed in successfully. Redirecting...");
      router.push("/");
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === "email") {
      await handleSendOtp();
    } else {
      await handleVerifyOtp();
    }
  };

  const onModeChange = (nextMode: Mode) => {
    setMode(nextMode);
    setStep("email");
    setError(null);
    setSuccess(null);
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <section className="w-full max-w-sm rounded-xl bg-card/50 p-6 shadow-sm backdrop-blur-sm">
        <h1 className="text-xl font-semibold text-center mb-4">{headerText}</h1>
        <form className="space-y-3" onSubmit={onSubmit}>
          {step === "email" && (
            <>
              {mode === "signup" && (
                <label className="block">
                  <span className="sr-only">Full Name</span>
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Full Name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring/40"
                    disabled={isSubmitting}
                    suppressHydrationWarning
                  />
                </label>
              )}
              <label className="block">
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring/40"
                  disabled={isSubmitting}
                  suppressHydrationWarning
                />
              </label>
            </>
          )}

          {step === "otp" && (
            <>
              <p className="text-sm text-center text-muted-foreground mb-4">
                We sent a code to <strong>{email}</strong>.
              </p>
              <label className="block">
                <span className="sr-only">OTP</span>
                <input
                  type="text"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  maxLength={6}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-center tracking-widest text-lg outline-none transition focus:ring-2 focus:ring-ring/40"
                  disabled={isSubmitting}
                  suppressHydrationWarning
                />
              </label>
            </>
          )}

          {(error || success) && (
            <p
              className={`mt-3 text-center text-xs ${error ? "text-red-600" : "text-emerald-700"}`}
              role={error ? "alert" : "status"}
            >
              {error ?? success}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 w-full rounded-lg bg-black text-white text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            suppressHydrationWarning
          >
            {isSubmitting
              ? "Please wait..."
              : step === "email"
                ? "Continue"
                : "Verify & Login"}
          </button>
        </form>

        {step === "otp" && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSendOtp}
              className="text-sm text-muted-foreground underline transition hover:text-black"
              suppressHydrationWarning
            >
              Resend OTP
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setStep("email");
                setOtp("");
                setError(null);
                setSuccess(null);
              }}
              className="text-sm text-muted-foreground underline transition hover:text-black"
              suppressHydrationWarning
            >
              Change email
            </button>
          </div>
        )}

        {step === "email" && (
          <>
            <div className="my-3 text-center text-sm text-muted-foreground">or</div>

            <div className="mt-4">
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => onModeChange("signup")}
                  className="h-10 w-full rounded-lg bg-black text-sm font-semibold text-white transition hover:opacity-90"
                  suppressHydrationWarning
                >
                  Create an account
                </button>
              )}
              {mode === "signup" && (
                <button
                  type="button"
                  onClick={() => onModeChange("signin")}
                  className="h-10 w-full rounded-lg bg-black text-sm font-semibold text-white transition hover:opacity-90"
                  suppressHydrationWarning
                >
                  Signin to your account
                </button>
              )}
            </div>
          </>
        )}

        <p className="mt-4 text-[11px] text-muted-foreground text-center">
          By continuing, you agree to our <a href="/terms" className="text-muted-foreground underline">Terms of service</a>.
        </p>
      </section>
    </main>
  );
}
