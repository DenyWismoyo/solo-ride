import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { GoogleMapsProvider } from "@/components/map/GoogleMapsProvider";
import { ToastProvider } from "@/components/ui/toast";
import { OfflineBanner } from "@/components/layout/OfflineBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ride-Solo — Smart Hub & Ekosistem Lokal Surakarta",
  description: "Platform kolaborasi komunitas lokal, ojek bebas komisi, mitra UMKM, logistik industri, dan layanan publik Surakarta.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-tenant="sigap"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <ThemeProvider>
          <GoogleMapsProvider>
            <AuthProvider>
              <ToastProvider>
                <OfflineBanner />
                {children}
              </ToastProvider>
            </AuthProvider>
          </GoogleMapsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

