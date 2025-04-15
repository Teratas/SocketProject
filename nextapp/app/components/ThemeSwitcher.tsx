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
          variant="outline"
        >
          <Palette className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Theme</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-4">
          {Object.entries(themes).map(([key, theme]) => (
            <div
              key={key}
              className={`
                p-4 rounded-xl cursor-pointer border-2 transition-all
                ${
                  currentTheme === key
                    ? "border-blue-500 scale-105"
                    : "border-gray-200 hover:border-gray-300"
                }
              `}
              style={{
                backgroundColor: theme.background,
                color: theme.foreground,
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
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
