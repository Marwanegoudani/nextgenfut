import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Providers from "./providers";
import Logo from "@/components/ui/Logo";
import Favicon from "@/components/ui/Favicon";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextGenFut - Football Platform for Players and Scouts",
  description: "A platform for football enthusiasts to organize matches, rate performances, and discover new talents.",
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
        <Providers>
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <Logo size="medium" />
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-600 hover:text-green-600 transition-colors">Home</Link>
                <Link href="/matches" className="text-gray-600 hover:text-green-600 transition-colors">Matches</Link>
                <Link href="/scouts" className="text-gray-600 hover:text-green-600 transition-colors">Scouts</Link>
                <Link href="/auth/login" className="text-gray-600 hover:text-green-600 transition-colors">Sign In</Link>
                <Link 
                  href="/auth/register" 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </nav>
              <button className="md:hidden text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </header>
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="bg-gray-800 text-white py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <Logo className="mb-4" textColor="text-white" />
                  <p className="text-gray-300">
                    The ultimate platform for football enthusiasts to organize matches, rate performances, and discover new talents.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
                    <li><Link href="/matches" className="text-gray-300 hover:text-white transition-colors">Matches</Link></li>
                    <li><Link href="/scouts" className="text-gray-300 hover:text-white transition-colors">Scouts</Link></li>
                    <li><Link href="/auth/login" className="text-gray-300 hover:text-white transition-colors">Sign In</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Contact</h3>
                  <p className="text-gray-300">
                    Have questions or feedback? <br />
                    <a href="mailto:info@nextgenfut.com" className="text-green-400 hover:text-green-300 transition-colors">
                      info@nextgenfut.com
                    </a>
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} NextGenFut. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
