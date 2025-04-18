// app/components/ThemeSwitcher.tsx
"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "./ThemeProvider";

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const { currentTheme, themes, setTheme } = useTheme();

  const handleThemeChange = (theme: string) => {
    setTheme(theme);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-10 w-10 rounded-full p-0 flex items-center justify-center"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--background)",
          }}
        >
          <Palette className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: "var(--foreground)" }}>
            Choose Theme
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-4">
          {Object.entries(themes).map(([key, theme]) => (
            <div
              key={key}
              className={`
                p-4 rounded-xl cursor-pointer border-2 transition-all flex flex-col gap-2
                ${currentTheme === key ? "scale-105" : "hover:border-gray-300"}
              `}
              style={{
                backgroundColor: theme.background,
                color: theme.foreground,
                borderColor:
                  currentTheme === key
                    ? theme.primary
                    : "rgba(128, 128, 128, 0.2)",
              }}
              onClick={() => handleThemeChange(key)}
            >
              <div className="font-medium mb-2">{theme.name}</div>
              <div className="flex gap-2">
                <div
                  className="h-5 w-5 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                ></div>
                <div
                  className="h-5 w-5 rounded-full"
                  style={{ backgroundColor: theme.secondary }}
                ></div>
                <div
                  className="h-5 w-5 rounded-full"
                  style={{ backgroundColor: theme.accent }}
                ></div>
              </div>
              {/* Preview text in theme colors */}
              <div className="mt-2 text-xs" style={{ color: theme.foreground }}>
                Sample text
              </div>
              <div className="mt-1 text-xs flex gap-2">
                <span style={{ color: theme.primary }}>Primary</span>
                <span style={{ color: theme.secondary }}>Secondary</span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
