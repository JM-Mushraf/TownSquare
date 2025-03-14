import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', setTheme: () => null });

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'theme',
  attribute = 'class',
  enableSystem = true,
}) {
  const [theme, setThemeState] = useState(() => {
    // Initialize from localStorage or default
    if (typeof window !== 'undefined') {
      try {
        const storedTheme = localStorage.getItem(storageKey);
        if (storedTheme) return storedTheme;
        
        if (enableSystem) {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          return systemTheme;
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    }
    
    return defaultTheme;
  });
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark');
    
    // Add the current theme class
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    // Update the data-theme attribute if specified
    if (attribute === 'class') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute(attribute, theme);
    }
  }, [theme, attribute, mounted]);
  
  const setTheme = (newTheme) => {
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch (error) {
      console.error('Error setting theme in localStorage:', error);
    }
    
    setThemeState(newTheme);
  };
  
  // Handle system theme changes
  useEffect(() => {
    if (!enableSystem) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [enableSystem, theme]);
  
  const value = {
    theme,
    setTheme,
    systemTheme: typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' 
      : undefined
  };
  
  // Prevent flash of incorrect theme
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};