import { Header, HeaderSkeleton } from "@/components/header";
import { TooltipProvider } from "@spnd/ui/components/ui/tooltip";
import "@spnd/ui/globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Spnd",
  description: "Personal Finance Tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="dark flex min-h-dvh flex-col px-4 py-4 md:px-8">
        <TooltipProvider>
          <Suspense fallback={<HeaderSkeleton />}>
            <Header />
          </Suspense>
          <main className="my-8 space-y-4">{children}</main>
        </TooltipProvider>
      </body>
    </html>
  );
}
