import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { colorUtils } from '../utils/colorUtils';

// Color theme types
export type ColorTheme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange';

interface ColorThemeContextType {
  theme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
  colors: ColorPalette;
  updateColor: (colorName: ColorToken, colorValue: string) => void;
}

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
}

export type ColorToken = keyof ColorPalette;

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

// Predefined color themes
const colorThemes: Record<ColorTheme, ColorPalette> = {
  light: {
    primary: '#098399',
    secondary: '#f15f44',
    accent: '#f79009',
    success: '#12b76a',
    warning: '#f79009',
    error: '#f04438',
    info: '#0ba5ec',
    bgPrimary: '#ffffff',
    bgSecondary: '#f9fafb',
    textPrimary: '#101828',
    textSecondary: '#475467',
  },
  dark: {
    primary: '#7592ff',
    secondary: '#32d583',
    accent: '#fdb022',
    success: '#32d583',
    warning: '#fdb022',
    error: '#f97066',
    info: '#36bffa',
    bgPrimary: '#0c111d',
    bgSecondary: '#1d2939',
    textPrimary: '#ffffff',
    textSecondary: '#d0d5dd',
  },
  blue: {
    primary: '#3b82f6',
    secondary: '#06b6d4',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    bgPrimary: '#ffffff',
    bgSecondary: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
  },
  green: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#f59e0b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d6',
    bgPrimary: '#ffffff',
    bgSecondary: '#f0fdf4',
    textPrimary: '#064e3b',
    textSecondary: '#047857',
  },
  purple: {
    primary: '#8b5cf6',
    secondary: '#a855f7',
    accent: '#f59e0b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d6',
    bgPrimary: '#ffffff',
    bgSecondary: '#faf5ff',
    textPrimary: '#581c87',
    textSecondary: '#7c3aed',
  },
  orange: {
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d6',
    bgPrimary: '#ffffff',
    bgSecondary: '#fffbeb',
    textPrimary: '#92400e',
    textSecondary: '#d97706',
  },
};

export const ColorThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ColorTheme>('light');
  const [colors, setColors] = useState<ColorPalette>(colorThemes.light);

  const applyColorScale = (colorName: "primary" | "secondary", baseColor: string) => {
    const root = document.documentElement;
    const scale = colorUtils.generateColorVariations(baseColor) as Record<string, string>;

    Object.entries(scale).forEach(([key, value]) => {
      root.style.setProperty(`--color-${colorName}-${key}`, value);
    });

    root.style.setProperty(`--color-${colorName}`, baseColor);
    root.style.setProperty(`--color-${colorName}-light`, scale["400"] ?? baseColor);
    root.style.setProperty(`--color-${colorName}-dark`, scale["600"] ?? baseColor);
  };

  // Update CSS custom properties when theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Update CSS variables
    applyColorScale("primary", colors.primary);
    applyColorScale("secondary", colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-error', colors.error);
    root.style.setProperty('--color-info', colors.info);
    root.style.setProperty('--color-bg-primary', colors.bgPrimary);
    root.style.setProperty('--color-bg-secondary', colors.bgSecondary);
    root.style.setProperty('--color-text-primary', colors.textPrimary);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    
    // Add theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
  }, [theme, colors]);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('colorTheme') as ColorTheme;
    if (savedTheme && colorThemes[savedTheme]) {
      setTheme(savedTheme);
      setColors(colorThemes[savedTheme]);
    }
  }, []);

  const handleSetTheme = (newTheme: ColorTheme) => {
    setTheme(newTheme);
    setColors(colorThemes[newTheme]);
    localStorage.setItem('colorTheme', newTheme);
  };

  const updateColor = (colorName: ColorToken, colorValue: string) => {
    const root = document.documentElement;
    if (colorName === "primary" || colorName === "secondary") {
      applyColorScale(colorName, colorValue);
    } else {
      root.style.setProperty(`--color-${colorName}`, colorValue);
    }
    
    // Update colors state
    setColors(prev => ({
      ...prev,
      [colorName]: colorValue,
    }));
  };

  return (
    <ColorThemeContext.Provider value={{
      theme,
      setTheme: handleSetTheme,
      colors,
      updateColor,
    }}>
      {children}
    </ColorThemeContext.Provider>
  );
};

export const useColorTheme = () => {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider');
  }
  return context;
};
