import React, { createContext, useContext, useState, ReactNode } from "react";

interface ThemeContextType {
  theme: string;
  isLight: boolean;
  darkModeHandler: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [isLight, setIsLight] = useState(true);

  const darkModeHandler = () => {
    setTheme(theme === "light" ? "dark" : "light");
    setIsLight(!isLight);
    document.body.classList.toggle("dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, isLight, darkModeHandler }}>
      {children}
    </ThemeContext.Provider>
  );
};
