"use client";
//

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    // Remove transitions initially
    document.documentElement.classList.add("no-transitions");

    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle(
        "theme-light",
        savedTheme === "light"
      );
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      // Check for OS dark mode preference if no saved theme
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("theme-light", !prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }

    // Enable transitions after initial theme is set
    requestAnimationFrame(() => {
      document.documentElement.classList.remove("no-transitions");
      document.documentElement.classList.add("dark-mode-ready");
    });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";

    // Add transition class before theme change
    document.documentElement.classList.add("theme-transitioning");

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // Toggle theme-light class for our CSS variables
    document.documentElement.classList.toggle(
      "theme-light",
      newTheme === "light"
    );

    // Toggle dark class for Tailwind's dark mode
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 300);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
