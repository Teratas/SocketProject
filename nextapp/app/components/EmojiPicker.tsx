// app/components/EmojiPicker.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import EmojiPickerReact, { EmojiClickData, Theme } from "emoji-picker-react";
import { Smile } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const { currentTheme } = useTheme();

  // Determine if we should use dark theme based on app theme
  const isDarkTheme = ["dark", "blue", "green", "purple"].includes(
    currentTheme
  );

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
    <div className="relative h-full flex items-center" ref={pickerRef}>
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-700/50 transition-colors focus:outline-none"
        type="button"
        style={{
          backgroundColor: "transparent", // Make background transparent to match parent
        }}
      >
        <Smile className="h-6 w-6 text-white" />
      </button>

      {showPicker && (
        <div
          className="absolute"
          style={{
            zIndex: 9999,
            position: "fixed",
            bottom: "80px",
            right: "80px",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
          }}
        >
          <EmojiPickerReact
            onEmojiClick={handleEmojiClick}
            theme={isDarkTheme ? Theme.DARK : Theme.LIGHT}
            searchPlaceHolder="Search emoji..."
            width={320}
            height={400}
            previewConfig={{
              showPreview: true,
              defaultCaption: "Click to add emoji",
            }}
            skinTonesDisabled
            lazyLoadEmojis={false}
          />
        </div>
      )}
    </div>
  );
}
