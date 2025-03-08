import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import Favicon from "@/components/ui/Favicon";
import { Navigation } from "@/components/layout/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextGenFut",
  description: "Connect with players and scouts in your area",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Favicon />
      </head>
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-grow">{children}</main>
          <footer className="bg-gray-100 py-6">
            <div className="container mx-auto px-4">
              <p className="text-center text-gray-600 text-sm">
                &copy; {new Date().getFullYear()} NextGenFut. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
