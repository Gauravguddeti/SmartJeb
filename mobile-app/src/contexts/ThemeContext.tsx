/**
 * Theme context provider
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../constants/theme';

interface ThemeContextType {
  isDarkMode: boolean;
  theme: typeof lightTheme | typeof darkTheme;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
}

// Create the context
export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  theme: lightTheme,
  toggleTheme: () => {},
  setDarkMode: () => {},
});

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(deviceColorScheme === 'dark');
  
  // Update theme based on device settings
  useEffect(() => {
    setIsDarkMode(deviceColorScheme === 'dark');
  }, [deviceColorScheme]);
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };
  
  // Explicitly set dark mode
  const setDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
  };
  
  // Get the current theme object
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        theme,
        toggleTheme,
        setDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook for consuming the theme context
export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
