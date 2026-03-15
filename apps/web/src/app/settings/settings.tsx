"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChangeEmailSchema,
  ChangeEmailSchemaType,
} from "@spnd/shared-types/auth";
import { GoogleIcon } from "@spnd/ui/components/company-icons/google";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@spnd/ui/components/ui/alert";
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
import { CheckCircle, Info, Mail, SquarePen } from "lucide-react";
import { startTransition, useActionState, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  changeEmail,
  linkGoogleOAuth,
  signOut,
  unlinkGoogleOAuth,
} from "../actions/auth";

function SignOutGlobalDialog() {
  const [open, setOpen] = useState<boolean>(false);

  const [signOutState, signOutAction, signOutPending] = useActionState(
    () => signOut({ scope: "global" }),
    { success: false, message: "", errors: [] },
  );

  const handleClick = async () => {
    startTransition(() => {
      signOutAction();
    });
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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
        {signOutState.errors &&
          signOutState.errors.map((error) => (
            <p className="text-destructive text-end text-sm" key={error}>
              {error}
            </p>
          ))}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={signOutPending} onClick={handleClick}>
            {signOutPending && <Spinner />}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SignOutOthersDialog() {
  const [open, setOpen] = useState<boolean>(false);

  const [signOutState, signOutAction, signOutPending] = useActionState(
    () => signOut({ scope: "others" }),
    { success: false, message: "", errors: [] },
  );

  const handleClick = async () => {
    startTransition(() => {
      signOutAction();
    });
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
        {signOutState.errors &&
          signOutState.errors.map((error) => (
            <p className="text-destructive text-end text-sm" key={error}>
              {error}
            </p>
          ))}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={signOutPending} onClick={handleClick}>
            {signOutPending && <Spinner />}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ChangeEmailForm({ email }: { email: string }) {
  const [changeEmailState, changeEmailAction, changeEmailPending] =
    useActionState(changeEmail, { success: false, message: "", errors: [] });

  const changeEmailForm = useForm<ChangeEmailSchemaType>({
    resolver: zodResolver(ChangeEmailSchema),
    defaultValues: {
      email: email,
    },
    mode: "all",
  });

  const changeEmailFormRef = useRef<HTMLFormElement>(null);

  function changeEmailOnSubmit() {
    startTransition(() =>
      changeEmailAction(new FormData(changeEmailFormRef.current!)),
    );
  }

  return (
    <>
      {changeEmailState.success && changeEmailState.message && (
        <CardContent>
          <Alert>
            <CheckCircle />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{changeEmailState.message}</AlertDescription>
          </Alert>
        </CardContent>
      )}
      <CardFooter>
        <form
          id="change-email"
          ref={changeEmailFormRef}
          action={changeEmailAction}
          onSubmit={(e) => changeEmailForm.handleSubmit(changeEmailOnSubmit)(e)}
          className="flex w-full items-end justify-between"
        >
          <FieldGroup className="w-full max-w-xs">
            <Controller
              name="email"
              control={changeEmailForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    <Mail size={16} />
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="new@example.com"
                    autoComplete="email"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  {changeEmailState.errors &&
                    changeEmailState.errors.map((error) => (
                      <FieldError key={error}>{error}</FieldError>
                    ))}
                </Field>
              )}
            />
          </FieldGroup>
          <Button
            type="submit"
            form="change-email"
            disabled={
              changeEmailPending ||
              !changeEmailForm.formState.isValid ||
              !changeEmailForm.formState.isDirty ||
              changeEmailState.success
            }
          >
            Submit
            {changeEmailPending && <Spinner />}
          </Button>
        </form>
      </CardFooter>
    </>
  );
}

function LinkGoogleOAuth() {
  const [open, setOpen] = useState<boolean>(false);

  const [linkGoogleState, likeGoogleAction, linkGooglePending] = useActionState(
    linkGoogleOAuth,
    { success: false, message: "", errors: [] },
  );

  const handleClick = async () => {
    startTransition(() => {
      likeGoogleAction();
    });
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
        {linkGoogleState.errors &&
          linkGoogleState.errors.map((error) => (
            <p className="text-destructive text-end text-sm" key={error}>
              {error}
            </p>
          ))}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={linkGooglePending} onClick={handleClick}>
            {linkGooglePending && <Spinner />}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function UnlinkGoogleOAuth() {
  const [open, setOpen] = useState<boolean>(false);

  const [unlinkGoogleState, unlikeGoogleAction, unlinkGooglePending] =
    useActionState(unlinkGoogleOAuth, {
      success: false,
      message: "",
      errors: [],
    });

  const handleClick = async () => {
    startTransition(() => {
      unlikeGoogleAction();
    });
    setOpen(false);
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
        {unlinkGoogleState.errors &&
          unlinkGoogleState.errors.map((error) => (
            <p className="text-destructive text-end text-sm" key={error}>
              {error}
            </p>
          ))}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={unlinkGooglePending}
            onClick={handleClick}
          >
            {unlinkGooglePending && <Spinner />}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function Settings({
  email,
  hasGoogleIdentity,
}: {
  email: string;
  hasGoogleIdentity: boolean;
}) {
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
            <ChangeEmailForm email={email} />
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
                  <Badge variant={hasGoogleIdentity ? "default" : "outline"}>
                    {hasGoogleIdentity ? "Connected" : "Not connected"}
                  </Badge>
                </ItemContent>
                <ItemActions>
                  {hasGoogleIdentity ? (
                    <UnlinkGoogleOAuth />
                  ) : (
                    <LinkGoogleOAuth />
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
            <CardFooter className="space-x-4">
              <SignOutOthersDialog />
              <SignOutGlobalDialog />
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
