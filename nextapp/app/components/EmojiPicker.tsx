// app/components/EmojiPicker.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import EmojiPickerReact, { EmojiClickData } from "emoji-picker-react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setShowPicker(false);
  };

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      <Button
        onClick={() => setShowPicker(!showPicker)}
        variant="ghost"
        className="h-10 w-10 p-0 rounded-full"
        type="button"
        style={{
          backgroundColor: showPicker ? "var(--muted)" : "transparent",
        }}
      >
        <Smile className="h-6 w-6" />
      </Button>

      {showPicker && (
        <div
          className="absolute bottom-12 right-0"
          style={{
            zIndex: 9999, // Very high z-index to ensure it's above everything
            position: "fixed", // Change to fixed positioning
            bottom: "80px", // Adjust this value as needed
            right: "100px", // Adjust this value as needed
          }}
        >
          <EmojiPickerReact onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
}
