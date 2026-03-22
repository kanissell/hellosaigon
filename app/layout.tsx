import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#030810",
};

export const metadata: Metadata = {
  title: "HelloSaigon - Your Local Saigon Concierge",
  description: "Your personal local life concierge for Ho Chi Minh City. Curated recommendations for food, coffee, services, and experiences from someone who actually lives here.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HelloSaigon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
