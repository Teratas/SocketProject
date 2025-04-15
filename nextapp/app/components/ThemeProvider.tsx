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
};

const themes: Record<string, Theme> = {
  light: {
    name: "Light",
    background: "#ffffff",
    foreground: "#171717",
    primary: "#3b82f6",
    secondary: "#10b981",
  },
  dark: {
    name: "Dark",
    background: "#171717",
    foreground: "#ffffff",
    primary: "#3b82f6",
    secondary: "#10b981",
  },
  blue: {
    name: "Blue",
    background: "#1e3a8a",
    foreground: "#ffffff",
    primary: "#60a5fa",
    secondary: "#34d399",
  },
  green: {
    name: "Green",
    background: "#064e3b",
    foreground: "#ffffff",
    primary: "#34d399",
    secondary: "#60a5fa",
  },
  purple: {
    name: "Purple",
    background: "#4c1d95",
    foreground: "#ffffff",
    primary: "#8b5cf6",
    secondary: "#ec4899",
  },
};

type ThemeContextType = {
  currentTheme: string;
  themes: Record<string, Theme>;
  setTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: "light",
  themes,
  setTheme: () => {},
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
      console.log("Applying theme:", currentTheme, theme);
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
    }
  }, [currentTheme]);

  const setTheme = (theme: string) => {
    if (themes[theme]) {
      console.log("Setting theme to:", theme);
      setCurrentTheme(theme);
      setCookie("theme", theme);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themes, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
