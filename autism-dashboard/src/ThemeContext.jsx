import React, { createContext, useState, useContext } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

// Define color themes
export const THEMES = {
  light: {
    name: "Light Mode",
    bgMain: "#f8f9fa",
    bgSidebar: "rgba(255, 255, 255, 0.7)",
    bgCard: "#ffffff",
    borderColor: "#e9ecef",
    textPrimary: "#212529",
    textSecondary: "#6c757d",
    accentColor: "#0d6efd",
    hoverBg: "#f1f3f5",
  },
  dark: {
    name: "Dark Mode",
    bgMain: "#1a1a1a",
    bgSidebar: "rgba(20, 20, 20, 0.9)",
    bgCard: "#2d2d2d",
    borderColor: "#3d3d3d",
    textPrimary: "#ffffff",
    textSecondary: "#a0a0a0",
    accentColor: "#4a9eff",
    hoverBg: "#3d3d3d",
  },
  ocean: {
    name: "Ocean Blue",
    bgMain: "#e8f4f8",
    bgSidebar: "rgba(15, 77, 117, 0.8)",
    bgCard: "#f0f9fc",
    borderColor: "#b8e1ec",
    textPrimary: "#0f4d75",
    textSecondary: "#458ba8",
    accentColor: "#0088cc",
    hoverBg: "#d4eef5",
  },
  forest: {
    name: "Forest Green",
    bgMain: "#f0f5f0",
    bgSidebar: "rgba(34, 87, 44, 0.85)",
    bgCard: "#f8fbf8",
    borderColor: "#c8dcc9",
    textPrimary: "#1b4620",
    textSecondary: "#4a7c59",
    accentColor: "#2d9a3b",
    hoverBg: "#e0ede1",
  },
  sunset: {
    name: "Sunset Orange",
    bgMain: "#fef5f0",
    bgSidebar: "rgba(139, 59, 18, 0.85)",
    bgCard: "#fffaf6",
    borderColor: "#f5d9c8",
    textPrimary: "#5d2e0f",
    textSecondary: "#a85a2d",
    accentColor: "#ff6b35",
    hoverBg: "#fce6d6",
  },
  lavender: {
    name: "Lavender Purple",
    bgMain: "#f8f6fc",
    bgSidebar: "rgba(88, 40, 130, 0.85)",
    bgCard: "#faf9fd",
    borderColor: "#dfd3e8",
    textPrimary: "#44224c",
    textSecondary: "#7d5da1",
    accentColor: "#9966ff",
    hoverBg: "#ede5f5",
  },
  highContrast: {
    name: "High Contrast",
    bgMain: "#ffffff",
    bgSidebar: "#000000",
    bgCard: "#ffffff",
    borderColor: "#000000",
    textPrimary: "#000000",
    textSecondary: "#333333",
    accentColor: "#ffff00",
    hoverBg: "#f0f0f0",
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("neuroplay-theme");
    return saved || "light";
  });

  const currentTheme = THEMES[theme];

  const changeTheme = (newTheme) => {
    if (THEMES[newTheme]) {
      setTheme(newTheme);
      localStorage.setItem("neuroplay-theme", newTheme);
    }
  };

  const value = {
    theme,
    colors: currentTheme,
    changeTheme,
    availableThemes: Object.entries(THEMES).map(([key, value]) => ({
      id: key,
      name: value.name,
    })),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeContext;
