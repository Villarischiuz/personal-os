import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { ServiceWorkerRegister } from "@/components/global/ServiceWorkerRegister";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "fralife",
  description: "Il tuo OS personale anti-dispersione",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "fralife" },
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0a1628",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${geistSans.variable} ${geistMono.variable} h-full overflow-x-hidden`}>
      <body className="min-h-full overflow-x-hidden bg-[hsl(222,47%,6%)] text-white antialiased md:pl-56">
        <ServiceWorkerRegister />
        <Sidebar />
        <main
          className="min-h-screen min-w-0 max-w-full px-4 py-6 md:!pb-10 md:px-10 md:py-10"
          style={{ paddingBottom: "calc(120px + env(safe-area-inset-bottom, 0px))" }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
