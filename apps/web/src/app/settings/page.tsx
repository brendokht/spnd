"use client";

import { useAuth } from "@/context/auth";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription } from "@spnd/ui/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@spnd/ui/components/ui/alert-dialog";
import { Badge } from "@spnd/ui/components/ui/badge";
import { Button } from "@spnd/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@spnd/ui/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@spnd/ui/components/ui/field";
import { Input } from "@spnd/ui/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@spnd/ui/components/ui/item";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@spnd/ui/components/ui/tabs";
import { AlertCircle, CheckCircle2, Info, Mail, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Google icon as an inline SVG component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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
  );
}

function SignOutGlobalDialog({
  setSecurityError,
}: {
  setSecurityError: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const signOutEverywhere = async () => {
    setSecurityError(null);
    setLoading(true);
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) {
      setSecurityError(error.message);
      setLoading(false);
    } else {
      router.push("/login");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="destructive">Sign out of all sessions</Button>}
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will sign you out of all sessions, including your current one.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={signOutEverywhere}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SignOutOthersDialog({
  setSecurityError,
  setOthersSuccess,
}: {
  setSecurityError: React.Dispatch<React.SetStateAction<string | null>>;
  setOthersSuccess: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const signOutOthers = async () => {
    setSecurityError(null);
    setOthersSuccess(false);
    setLoading(true);
    const { error } = await supabase.auth.signOut({ scope: "others" });
    if (error) setSecurityError(error.message);
    else setOthersSuccess(true);
    setLoading(false);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Button variant="outline">Sign out of other sessions</Button>}
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will sign you out of all other sessions, not including your
            current one.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={signOutOthers}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ChangeEmail() {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState(user?.email ?? "");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      setNewEmail(user.email);
    }
  }, [user?.email]);

  const changeEmail = async () => {
    console.log("changeEmail 1", emailSuccess);
    setEmailError(null);
    setEmailSuccess(false);
    setEmailLoading(true);
    const { error } = await supabase.auth.updateUser(
      {
        email: newEmail,
      },
      { emailRedirectTo: "http://localhost:3000/settings" },
    );
    if (error) {
      setEmailError(error.message);
    } else setEmailSuccess(true);
    setEmailLoading(false);
  };

  return (
    <>
      {(emailSuccess || emailError) && (
        <CardContent>
          {emailSuccess && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Emails have been sent to the old and new email address.
              </AlertDescription>
            </Alert>
          )}
          {emailError && (
            <Alert variant={"destructive"}>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Emails have been sent to the old and new email address.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      )}
      <CardFooter>
        <div className="flex w-full items-end justify-between">
          <FieldSet className="w-full max-w-xs">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">
                  <Mail size={16} />
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  onChange={(e) => setNewEmail(e.target.value)}
                  value={newEmail}
                  placeholder="example@spnd.com"
                />
                <FieldError>{emailError}</FieldError>
              </Field>
            </FieldGroup>
          </FieldSet>
          <Button
            disabled={emailLoading || newEmail === user?.email || emailSuccess}
            onClick={changeEmail}
          >
            Submit
          </Button>
        </div>
      </CardFooter>
    </>
  );
}

function LinkGoogleOAuth({ hasGoogle }: { hasGoogle: boolean }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const unlinkGoogle = async () => {
    if (hasGoogle) {
      setError("Google identity found, no need to link");
      setLoading(false);
      return;
    }

    const { error: linkError } = await supabase.auth.linkIdentity({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/settings",
      },
    });

    if (linkError) {
      setError(linkError.message);
      setLoading(false);
      return;
    }
    await supabase.auth.refreshSession();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size={"icon"}>
            <SquarePen />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Would you like to link Google?</AlertDialogTitle>
          <AlertDialogDescription>
            This will link your chosen Google account with your Spnd Account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p className="text-destructive text-sm">{error}</p>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={unlinkGoogle}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function UnlinkGoogleOAuth() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const unlinkGoogle = async () => {
    const { data, error: getIdentitiesError } =
      await supabase.auth.getUserIdentities();

    if (getIdentitiesError) {
      setError(getIdentitiesError.message);
      setLoading(false);
      return;
    }

    const googleIdentity = data!.identities.find(
      (identity) => identity.provider === "google",
    );

    if (!googleIdentity) {
      setError("No Google identity found");
      setLoading(false);
      return;
    }

    const { error: unlinkError } =
      await supabase.auth.unlinkIdentity(googleIdentity);

    if (unlinkError) {
      if (unlinkError.code === "single_identity_not_deletable")
        setError(
          "You must change the email associated with this account to unlink your Google account.",
        );
      else setError(unlinkError.message);
      setLoading(false);
      return;
    }
    setOpen(false);
    window.location.reload();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size={"icon"}>
            <SquarePen />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Would you like to unlink Google?</AlertDialogTitle>
          <AlertDialogDescription>
            This will unlink your Google account with your Spnd Account. You
            must have Magic Link enabled to do this.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p className="text-destructive text-sm">{error}</p>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={unlinkGoogle}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function SettingsPage() {
  const { userIdentities } = useAuth();

  const hasGoogle = userIdentities?.includes("google") ?? false;
  // Account security state
  const [othersSuccess, setOthersSuccess] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  return (
    <>
      <h1 className="text-xl font-bold">Settings</h1>
      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Email</CardTitle>
              <CardDescription>
                Change the email associated to your account.
              </CardDescription>
            </CardHeader>
            <ChangeEmail />
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sign-in methods</CardTitle>
              <CardDescription>
                The ways you can sign in to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Item>
                <ItemMedia variant={"icon"}>
                  <GoogleIcon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Google</ItemTitle>
                  <ItemDescription>
                    Sign in with your Google account
                  </ItemDescription>
                </ItemContent>
                <ItemContent>
                  <Badge variant={hasGoogle ? "default" : "outline"}>
                    {hasGoogle ? "Connected" : "Not connected"}
                  </Badge>
                </ItemContent>
                <ItemActions>
                  {hasGoogle ? (
                    <UnlinkGoogleOAuth />
                  ) : (
                    <LinkGoogleOAuth hasGoogle={hasGoogle} />
                  )}
                </ItemActions>
              </Item>
            </CardContent>
            <CardFooter>
              <Alert>
                <Info />
                <AlertDescription>
                  You can also use Magic Link sign in with your Google
                  account&apos;s email if you initially signed up with your
                  Google account.
                </AlertDescription>
              </Alert>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Account security</CardTitle>
              <CardDescription>Manage your active sessions.</CardDescription>
            </CardHeader>
            {securityError ||
              (othersSuccess && (
                <CardContent>
                  {securityError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{securityError}</AlertDescription>
                    </Alert>
                  )}
                  {othersSuccess && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        All other sessions have been signed out.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              ))}
            <CardFooter className="space-x-4">
              <SignOutOthersDialog
                setOthersSuccess={setOthersSuccess}
                setSecurityError={setSecurityError}
              />
              <SignOutGlobalDialog setSecurityError={setSecurityError} />
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
