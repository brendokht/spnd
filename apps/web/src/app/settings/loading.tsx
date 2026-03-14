import { Alert, AlertDescription } from "@spnd/ui/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@spnd/ui/components/ui/card";
import { Skeleton } from "@spnd/ui/components/ui/skeleton";
import { Info, Mail } from "lucide-react";

export default function SettingsSkeleton() {
  return (
    <>
      <h1 className="text-xl font-bold">Settings</h1>
      <div className="text-muted-foreground bg-muted mb-2 inline-flex items-center justify-center rounded-lg p-0.75">
        <p className="bg-input/30 border-input inline-flex rounded-md border px-2 py-0.75 text-sm font-medium text-white">
          Account
        </p>
        <p className="border border-transparent px-2 text-sm font-medium">
          Security
        </p>
      </div>
      <Card className="max-h-72 w-full">
        <CardHeader>
          <CardTitle>Change Email</CardTitle>
          <CardDescription>
            Change the email associated to your account.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center gap-2">
              <Mail size={16} />
              Email
            </div>
            <div className="flex w-full justify-between">
              <Skeleton className="h-8.5 w-72" />
              <Skeleton className="h-8.5 w-24" />
            </div>
          </div>
        </CardFooter>
      </Card>
      <Card className="max-h-72 w-full">
        <CardHeader>
          <CardTitle>Sign-in Methods</CardTitle>
          <CardDescription>
            The ways you can sign in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center justify-between border border-transparent px-4 py-4">
            <div className="flex gap-2">
              <Skeleton className="size-4 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-20 rounded-4xl" />
              <Skeleton className="size-10 rounded-md" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Alert>
            <Info />
            <AlertDescription>
              You can also use Magic Link sign in with your Google
              account&apos;s email if you initially signed up with your Google
              account.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    </>
  );
}
