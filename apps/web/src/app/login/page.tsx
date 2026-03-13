"use client";

import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@spnd/ui/components/ui/alert";
import { Button } from "@spnd/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@spnd/ui/components/ui/card";
import { Input } from "@spnd/ui/components/ui/input";
import { Label } from "@spnd/ui/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(searchParams.get("error"));
  const [info, setInfo] = useState<"sent" | null>(null);
  const [magicLoading, setMagicLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const supabase = createClient();

  const sendMagicLink = async () => {
    setError(null);
    setInfo(null);
    setMagicLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) setError(err.message);
    else setInfo("sent");
    setMagicLoading(false);
  };

  const verifyOtp = async () => {
    setError(null);
    setOtpLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    if (err) {
      setError(err.message);
      setOtpLoading(false);
    } else {
      router.refresh();
      router.push("/");
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your email to receive a magic link.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {info === "sent" && (
            <Alert>
              <AlertDescription className="space-y-3">
                <p>
                  <span className="font-medium">Magic link sent!</span> Check
                  your email or enter the code below.
                  {process.env.NODE_ENV === "development" && (
                    <>
                      {" "}
                      <a
                        href="http://localhost:54324"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 hover:text-blue-600!"
                      >
                        Open Inbucket
                      </a>
                    </>
                  )}
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && otp.length === 6 && verifyOtp()
                    }
                  />
                  <Button
                    onClick={verifyOtp}
                    disabled={otpLoading || otp.length !== 6}
                    className="shrink-0"
                  >
                    {otpLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && email && sendMagicLink()}
            />
          </div>

          <Button
            className="hover:bg-primary/70 w-full cursor-pointer"
            onClick={sendMagicLink}
            disabled={magicLoading || !email}
          >
            {magicLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send magic link
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-muted-foreground mx-auto text-xs">or</span>
          </div>

          <Button
            variant="outline"
            className="w-full cursor-pointer hover:border-gray-400 hover:bg-gray-100"
            onClick={signInWithGoogle}
            disabled={googleLoading}
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
          </Button>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-muted-foreground text-sm">
            {"Don't have an account?"}
            <Link
              href="/register"
              className="text-foreground ml-1 underline underline-offset-4 hover:text-blue-600"
            >
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
