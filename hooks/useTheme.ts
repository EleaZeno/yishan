import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'yishan_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(STORAGE_KEY) as Theme) || 'system';
    }
    return 'system';
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const resolveTheme = useCallback((t: Theme): 'light' | 'dark' => {
    if (t === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return t;
  }, []);

  const applyTheme = useCallback((t: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (t === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    setResolvedTheme(t);
  }, []);

  useEffect(() => {
    const resolved = resolveTheme(theme);
    applyTheme(resolved);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme(resolveTheme('system'));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, resolveTheme, applyTheme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(resolveTheme(t));
  }, [resolveTheme, applyTheme]);

  const toggleTheme = useCallback(() => {
    const nextTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
  };

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useSimpleTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const toggle = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
      
      const root = document.documentElement;
      if (next) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      return next;
    });
  }, []);

  return { isDark, toggle };
}
