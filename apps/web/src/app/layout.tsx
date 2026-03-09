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
      <body className="flex min-h-dvh flex-col bg-white p-4 text-gray-900">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
