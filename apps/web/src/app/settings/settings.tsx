"use client";

import { createClient } from "@/lib/supabase/client";
import { GoogleIcon } from "@spnd/ui/components/company-icons/google";
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
import { Spinner } from "@spnd/ui/components/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@spnd/ui/components/ui/tabs";
import { User } from "@supabase/supabase-js";
import { AlertCircle, CheckCircle2, Info, Mail, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Google icon as an inline SVG component
const supabase = createClient();

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
            {loading && <Spinner />}
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
            {loading && <Spinner />}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ChangeEmail({ email }: { email: string }) {
  const [newEmail, setNewEmail] = useState(email ?? "");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const changeEmail = async () => {
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
      setEmailSuccess(false);
      return;
    } else setEmailSuccess(true);
    setEmailLoading(false);
  };

  return (
    <>
      {emailSuccess && (
        <CardContent>
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Emails have been sent to the old and new email address.
            </AlertDescription>
          </Alert>
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
            disabled={emailLoading || newEmail === email || emailSuccess}
            onClick={changeEmail}
          >
            {emailLoading && <Spinner />}
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

  const linkGoogle = async () => {
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
          <Button data-testid="google-link-btn" variant="outline">
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
          <AlertDialogAction disabled={loading} onClick={linkGoogle}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function UnlinkGoogleOAuth() {
  const router = useRouter();
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
    router.refresh();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button data-testid="google-unlink-btn" variant="outline">
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

export default function Settings({ user }: { user: User }) {
  const userIdentities =
    user.identities?.map((identity) => identity.provider) ?? [];

  const hasGoogle = userIdentities.includes("google") ?? false;
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
            <ChangeEmail email={user.email!} />
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sign-in Methods</CardTitle>
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
              <CardTitle>Account Security</CardTitle>
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
