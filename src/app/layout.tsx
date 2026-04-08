import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/app/theme-provider";
import { Navigation } from "@/components/app/Navigation";
import { SupportChat } from "@/components/app/support-chat";
import { Analytics } from "@vercel/analytics/next";
import { createClient } from "@/lib/db/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Habit Tracker",
  description: "My Personal habit and goal tracking app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navigation userEmail={user?.email ?? null} />
          <main>{children}</main>
          <SupportChat isAuthenticated={!!user} />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
