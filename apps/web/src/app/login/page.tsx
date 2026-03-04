"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(searchParams.get("error"));
  const [info, setInfo] = useState<"sent" | null>(null);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const signIn = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.refresh();
      router.push("/");
    }
  };

  const sendMagicLink = async () => {
    setError(null);
    setInfo(null);
    setMagicLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    else setInfo("sent");
    setMagicLoading(false);
  };

  const verifyOtp = async () => {
    setError(null);
    setOtpLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    if (error) {
      setError(error.message);
      setOtpLoading(false);
    } else {
      router.refresh();
      router.push("/");
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Sign in</h1>

        {error && (
          <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {info === "sent" && (
          <div className="space-y-3 rounded border border-blue-200 bg-blue-50 px-3 py-3 text-sm text-blue-700">
            <div>
              <p className="font-medium">Magic link sent!</p>
              <p className="mt-0.5 text-blue-600">
                Check your email for a sign-in link or enter the code below.
                {process.env.NODE_ENV === "development" && (
                  <>
                    {" "}
                    Using local dev?{" "}
                    <a
                      href="http://localhost:54324"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline underline-offset-4"
                    >
                      Open Inbucket to view it.
                    </a>
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && otp.length === 6 && verifyOtp()
                }
                className="w-full rounded border border-blue-300 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-500"
              />
              <button
                onClick={verifyOtp}
                disabled={otpLoading || otp.length !== 6}
                className="flex shrink-0 items-center justify-center rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {otpLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify"
                )}
              </button>
            </div>
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && signIn()}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && signIn()}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
        />

        <button
          onClick={signIn}
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center rounded bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </button>

        <button
          onClick={sendMagicLink}
          disabled={magicLoading || !email}
          className="flex w-full cursor-pointer items-center justify-center rounded border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {magicLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send magic link
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400">
            <span className="bg-white px-2">or</span>
          </div>
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={googleLoading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </button>

        <p className="text-center text-sm text-gray-500">
          {"Don't have an account?"}
          <Link
            href="/register"
            className="ml-1 text-gray-900 underline underline-offset-4 hover:text-[#0000FF]"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
