import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./client-providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingPostButton } from "@/components/FloatingPostButton";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { InstallPWAPopup } from "@/components/ServiceWorkerRegistration";
import { ScrollToTop } from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "BlueSky AI - Intelligent Posting",
  description: "Automate your Bluesky presence with AI-powered content generation.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BlueSky AI",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ServiceWorkerRegistration />
        <ClientProviders>
          <div className="relative min-h-screen flex flex-col">
<Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <FloatingPostButton />
            <ScrollToTop />
            <InstallPWAPopup />
          </div>
          {/* MobileNav removed — navigation is handled by the hamburger menu in Navbar */}
        </ClientProviders>
      </body>
    </html>
  );
}
