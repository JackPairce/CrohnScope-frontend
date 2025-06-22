"use client";
//

import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render the toggle on the client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render placeholder while loading to avoid layout shift
    return <div className="w-8 h-8 p-2"></div>;
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 hover:scale-110"
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/*  */}
      <div className="relative w-5 h-5">
        <Image
          src="/svgs/sun.svg"
          alt="Light mode"
          width={20}
          height={20}
          className={`absolute inset-0 transform transition-all duration-300 svg-icon ${
            theme === "dark" ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
          }`}
        />
        <Image
          src="/svgs/moon.svg"
          alt="Dark mode"
          width={20}
          height={20}
          className={`absolute inset-0 transform transition-all duration-300 svg-icon ${
            theme === "dark" ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"
          }`}
        />
      </div>
    </button>
  );
}
