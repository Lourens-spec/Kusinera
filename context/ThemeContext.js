import React, { createContext, useContext, useMemo, useState } from "react";

const ThemeContext = createContext({ darkMode: false, setDarkMode: () => {} });

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const value = useMemo(() => ({ darkMode, setDarkMode }), [darkMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
