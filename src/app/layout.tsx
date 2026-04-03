"use client";

import { useState, useEffect } from "react";
import { DM_Sans, DM_Mono, Playfair_Display } from "next/font/google";
import { getTheme } from "@/lib/theme";
import AppSidebar from "@/components/AppSidebar";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-dm-sans",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-playfair",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getTheme());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable} ${playfair.variable}`}>
      <head>
        <title>Arthur MCS — Mission Control System</title>
        <meta name="description" content="Arthur Mission Control System for Product Managers" />
      </head>
      <body>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <AppSidebar theme={theme} setTheme={setTheme} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
