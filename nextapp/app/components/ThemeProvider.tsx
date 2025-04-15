// app/components/ThemeProvider.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { setCookie, getCookie } from "cookies-next/client";

type Theme = {
  name: string;
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
};

const themes: Record<string, Theme> = {
  light: {
    name: "Light",
    background: "#ffffff",
    foreground: "#171717",
    primary: "#3b82f6",
    secondary: "#10b981",
    accent: "#f59e0b",
    muted: "#f3f4f6",
  },
  dark: {
    name: "Dark",
    background: "#171717",
    foreground: "#ffffff",
    primary: "#3b82f6",
    secondary: "#10b981",
    accent: "#f59e0b",
    muted: "#374151",
  },
  blue: {
    name: "Blue",
    background: "#1e3a8a",
    foreground: "#ffffff",
    primary: "#60a5fa",
    secondary: "#34d399",
    accent: "#fb923c",
    muted: "#1e40af",
  },
  green: {
    name: "Green",
    background: "#064e3b",
    foreground: "#ffffff",
    primary: "#34d399",
    secondary: "#60a5fa",
    accent: "#f59e0b",
    muted: "#065f46",
  },
  purple: {
    name: "Purple",
    background: "#4c1d95",
    foreground: "#ffffff",
    primary: "#8b5cf6",
    secondary: "#ec4899",
    accent: "#fbbf24",
    muted: "#5b21b6",
  },
};

type ThemeContextType = {
  currentTheme: string;
  themes: Record<string, Theme>;
  setTheme: (theme: string) => void;
  getCurrentTheme: () => Theme;
};

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: "light",
  themes,
  setTheme: () => {},
  getCurrentTheme: () => themes.light,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<string>("light");

  useEffect(() => {
    // Load theme from cookie on client-side
    const savedTheme = getCookie("theme") as string;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to CSS variables
    if (typeof window !== "undefined" && themes[currentTheme]) {
      const theme = themes[currentTheme];
      document.documentElement.style.setProperty(
        "--background",
        theme.background
      );
      document.documentElement.style.setProperty(
        "--foreground",
        theme.foreground
      );
      document.documentElement.style.setProperty("--primary", theme.primary);
      document.documentElement.style.setProperty(
        "--secondary",
        theme.secondary
      );
      document.documentElement.style.setProperty("--accent", theme.accent);
      document.documentElement.style.setProperty("--muted", theme.muted);

      // Apply class to body for additional styling hooks
      document.body.className = `theme-${currentTheme}`;
    }
  }, [currentTheme]);

  const setTheme = (theme: string) => {
    if (themes[theme]) {
      setCurrentTheme(theme);
      setCookie("theme", theme);
    }
  };

  const getCurrentTheme = () => {
    return themes[currentTheme];
  };

  return (
    <ThemeContext.Provider
      value={{ currentTheme, themes, setTheme, getCurrentTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
