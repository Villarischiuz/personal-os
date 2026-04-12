import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { QuickCaptureOverlay } from "@/components/global/QuickCaptureOverlay";
import { BurnoutBanner } from "@/components/global/BurnoutBanner";
import { AICopilot } from "@/components/global/AICopilot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PersonalOS — Calendario",
  description: "Cognitive efficiency & physical performance dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full overflow-x-hidden`}
    >
      <body className="min-h-full overflow-x-hidden bg-[hsl(222,47%,6%)] text-white antialiased md:pl-56">
        <Sidebar />
        {/* Main content — offset for sidebar on desktop */}
        <main className="min-h-screen min-w-0 max-w-full px-4 py-6 pb-[220px] md:px-10 md:py-10 md:pb-10">
          {children}
        </main>
        <QuickCaptureOverlay />
        <BurnoutBanner />
        <AICopilot />
      </body>
    </html>
  );
}
