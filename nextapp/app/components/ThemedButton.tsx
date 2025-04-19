// app/components/ThemedButton.tsx
"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ThemedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "accent" | "outline";
  className?: string;
  disabled?: boolean;
}

export function ThemedButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
}: ThemedButtonProps) {
  // Compute style based on variant
  const getStyle = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: `var(--primary)`,
          color: `var(--background)`,
        };
      case "secondary":
        return {
          backgroundColor: `var(--secondary)`,
          color: `var(--background)`,
        };
      case "accent":
        return {
          backgroundColor: `var(--accent)`,
          color: `var(--background)`,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: `var(--foreground)`,
          border: `2px solid var(--primary)`,
        };
      default:
        return {};
    }
  };

  return (
    <Button
      onClick={onClick}
      className={`transition-colors ${className}`}
      style={getStyle()}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}
