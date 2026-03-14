"use client";

import { createClient } from "@/lib/supabase/client";
import { GoogleIcon } from "@spnd/ui/components/company-icons/google";
import { Alert, AlertDescription } from "@spnd/ui/components/ui/alert";
import { Button } from "@spnd/ui/components/ui/button";
import { Input } from "@spnd/ui/components/ui/input";
import { Label } from "@spnd/ui/components/ui/label";
import { Separator } from "@spnd/ui/components/ui/separator";
import { Spinner } from "@spnd/ui/components/ui/spinner";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<"sent" | null>(null);
  const [magicLoading, setMagicLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const signUpWithGoogle = async () => {
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
    <>
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
              <span className="font-medium">Magic link sent!</span> Check your
              email or enter the code below.
              {process.env.NODE_ENV === "development" && (
                <>
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
                {otpLoading ? <Spinner /> : "Verify"}
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
        {magicLoading && <Spinner />}
        Continue with email
      </Button>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs">or</span>
        <Separator className="flex-1" />
      </div>

      <Button
        variant="outline"
        className="w-full cursor-pointer hover:border-gray-400 hover:bg-gray-100"
        onClick={signUpWithGoogle}
        disabled={googleLoading}
      >
        {googleLoading ? <Spinner /> : <GoogleIcon />}
        Continue with Google
      </Button>
    </>
  );
}
