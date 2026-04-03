// ─── Arthur · Mission Control System — Shared Theme & Utilities ───
// All components import from here for consistent theming

export interface ThemeColors {
  bg: string;
  sidebar: string;
  card: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  textDim: string;
  accent: string;
  overlay: string;
  input: string;
  inputBorder: string;
  toastBg: string;
  toastText: string;
}

export const THEMES: Record<'light' | 'dark', ThemeColors> = {
  light: {
    bg: "#F4F6F8", sidebar: "#FFFFFF", card: "#FFFFFF", cardBorder: "#E8EAED",
    text: "#1B2631", textMuted: "#5D6D7E", textDim: "#95A5A6", accent: "#1B9C85",
    overlay: "rgba(0,0,0,0.35)", input: "#F8F9FA", inputBorder: "#D5D8DC",
    toastBg: "#1B2631", toastText: "#ECF0F1",
  },
  dark: {
    bg: "#0B1929", sidebar: "#0A1628", card: "rgba(255,255,255,0.03)", cardBorder: "rgba(255,255,255,0.06)",
    text: "#ECF0F1", textMuted: "#5D6D7E", textDim: "#3D5066", accent: "#1B9C85",
    overlay: "rgba(0,0,0,0.6)", input: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.1)",
    toastBg: "#1B9C85", toastText: "#fff",
  },
};

export const THEME_KEY = "dk-pmos-theme";

export function getTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  try { 
    const stored = window.localStorage.getItem(THEME_KEY);
    return (stored === 'dark' ? 'dark' : 'light');
  } catch (e) { 
    return "light"; 
  }
}

export function setThemeStorage(theme: 'light' | 'dark'): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(THEME_KEY, theme); } catch (e) {}
}

// Stage data shared across components
export interface StageNav {
  id: number;
  title: string;
  status: string;
  color: string;
  icon: string;
  progress: number;
  total: number;
}

export const STAGES_NAV: StageNav[] = [
  { id: 0, title: "Problem Validator", status: "active", color: "#E74C3C", icon: "🔬", progress: 12, total: 12 },
  { id: 1, title: "Strategy Architect", status: "active", color: "#E67E22", icon: "🧭", progress: 10, total: 10 },
  { id: 2, title: "Opportunity Scout", status: "active", color: "#F1C40F", icon: "🎯", progress: 11, total: 11 },
  { id: 3, title: "Design & MVP", status: "active", color: "#2ECC71", icon: "✏️", progress: 0, total: 7 },
  { id: 4, title: "Planning & Roadmap", status: "active", color: "#3498DB", icon: "🗺", progress: 0, total: 8 },
  { id: 5, title: "Build & Ship", status: "active", color: "#9B59B6", icon: "🚀", progress: 0, total: 7 },
  { id: 6, title: "Scale & Optimize", status: "active", color: "#1ABC9C", icon: "💎", progress: 0, total: 7 },
  { id: 7, title: "Maturity & Maintenance", status: "active", color: "#C0392B", icon: "📊", progress: 0, total: 7 },
  { id: 8, title: "Portfolio & Investment", status: "active", color: "#34495E", icon: "🏛️", progress: 0, total: 7 },
];

export interface User {
  name: string;
  email: string;
  initials: string;
  plan: string;
}

export const USER: User = { 
  name: "David Khin", 
  email: "dkhin@hyvemyanmar.com", 
  initials: "DK", 
  plan: "Pro" 
};
