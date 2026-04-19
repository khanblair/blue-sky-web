import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./client-providers";
import { Navbar } from "@/components/Navbar";
import { FloatingPostButton } from "@/components/FloatingPostButton";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

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
      <head>
        {/* Capture beforeinstallprompt as early as possible — before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.__pwaInstallPrompt = null;
          window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            window.__pwaInstallPrompt = e;
            window.dispatchEvent(new Event('pwaPromptReady'));
          });
        `}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ServiceWorkerRegistration />
        <ClientProviders>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-8 text-default-400 text-sm border-t border-divider/50 mt-12">
              <span className="opacity-70">Powered by Convex, OpenRouter, and HeroUI</span>
            </footer>
            <FloatingPostButton />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
