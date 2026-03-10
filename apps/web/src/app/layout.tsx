import Header from "@/components/header";
import { AuthProvider } from "@/context/auth";
import "@spnd/ui/globals.css";
import type { Metadata } from "next";

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
      <body className="flex min-h-dvh flex-col bg-white px-4 py-4 text-gray-900 md:px-8">
        <AuthProvider>
          <Header />
          <main className="my-8 space-y-4">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
