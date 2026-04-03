"use client";

import { useState, useEffect } from "react";
import { getTheme } from "@/lib/theme";
import AppSidebar from "@/components/AppSidebar";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getTheme());
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ minHeight: "100vh" }}>{children}</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AppSidebar theme={theme} setTheme={setTheme} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
