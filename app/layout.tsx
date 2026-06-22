import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers";
import "./globals.css";
import SubscriptionTracker from "./components/subscription-tracker";
import NavAuthButton from "./components/nav-auth-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Tutor",
  description: "Hands-free AI tutoring companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header
              className="border-b border-white/8 surface backdrop-blur"
              style={{ background: "var(--background)" }}>
              <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
                <Link href="/" className="text-xl font-semibold text-white">
                  <span className="accent">AI</span> Tutor
                </Link>
                <nav className="flex items-center gap-6 text-sm">
                  <Link href="/pricing" className="hover:text-accent">
                    Pricing
                  </Link>
                  <Link href="/dashboard" className="hover:text-accent">
                    Dashboard
                  </Link>
                  <SubscriptionTracker />
                  <NavAuthButton />
                </nav>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-white/10 surface py-6 text-center text-sm text-muted">
              © {new Date().getFullYear()} AI Tutor. All rights reserved.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
