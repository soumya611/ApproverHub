# Dynamic Color System Implementation Guide

## Overview
This guide shows you how to implement a dynamic color system in your React project using CSS custom properties (CSS variables) and React context for theme management.

## Method 1: CSS Custom Properties (Recommended)

### Step 1: Define Dynamic Color Variables

Add this to your `src/index.css` file:

```css
@theme {
  /* Dynamic Color System */
  --color-primary: #465fff;        /* Main brand color */
  --color-primary-light: #7592ff;  /* Lighter variant */
  --color-primary-dark: #3641f5;   /* Darker variant */
  
  --color-secondary: #12b76a;       /* Secondary color */
  --color-secondary-light: #32d583; /* Lighter variant */
  --color-secondary-dark: #039855;  /* Darker variant */
  
  --color-accent: #f79009;          /* Accent color */
  --color-accent-light: #fdb022;    /* Lighter variant */
  --color-accent-dark: #dc6803;     /* Darker variant */
  
  --color-success: #12b76a;         /* Success state */
  --color-warning: #f79009;         /* Warning state */
  --color-error: #f04438;           /* Error state */
  --color-info: #0ba5ec;            /* Info state */
  
  /* Dynamic Background Colors */
  --color-bg-primary: #ffffff;     /* Primary background */
  --color-bg-secondary: #f9fafb;    /* Secondary background */
  --color-bg-tertiary: #f2f4f7;     /* Tertiary background */
  
  /* Dynamic Text Colors */
  --color-text-primary: #101828;    /* Primary text */
  --color-text-secondary: #475467;  /* Secondary text */
  --color-text-tertiary: #98a2b3;   /* Tertiary text */
  --color-text-inverse: #ffffff;    /* Inverse text */
  
  /* Dynamic Border Colors */
  --color-border-primary: #e4e7ec;   /* Primary border */
  --color-border-secondary: #d0d5dd; /* Secondary border */
  --color-border-focus: #465fff;     /* Focus border */
}
```

### Step 2: Create Color Theme Context

Create `src/context/ColorThemeContext.tsx`:

```tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Color theme types
export type ColorTheme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange';

interface ColorThemeContextType {
  theme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
  colors: ColorPalette;
  updateColor: (colorName: string, colorValue: string) => void;
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

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

// Predefined color themes
const colorThemes: Record<ColorTheme, ColorPalette> = {
  light: {
    primary: '#465fff',
    secondary: '#12b76a',
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

  // Update CSS custom properties when theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Update CSS variables
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
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

  const updateColor = (colorName: string, colorValue: string) => {
    const root = document.documentElement;
    root.style.setProperty(`--color-${colorName}`, colorValue);
    
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
```

### Step 3: Create Color Utility Functions

Create `src/utils/colorUtils.ts`:

```tsx
// Color utility functions
export const colorUtils = {
  // Convert hex to RGB
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  // Convert RGB to hex
  rgbToHex: (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  // Generate color variations
  generateColorVariations: (baseColor: string) => {
    const rgb = colorUtils.hexToRgb(baseColor);
    if (!rgb) return {};

    const { r, g, b } = rgb;
    
    return {
      50: colorUtils.rgbToHex(Math.min(255, r + 200), Math.min(255, g + 200), Math.min(255, b + 200)),
      100: colorUtils.rgbToHex(Math.min(255, r + 150), Math.min(255, g + 150), Math.min(255, b + 150)),
      200: colorUtils.rgbToHex(Math.min(255, r + 100), Math.min(255, g + 100), Math.min(255, b + 100)),
      300: colorUtils.rgbToHex(Math.min(255, r + 50), Math.min(255, g + 50), Math.min(255, b + 50)),
      400: colorUtils.rgbToHex(Math.min(255, r + 25), Math.min(255, g + 25), Math.min(255, b + 25)),
      500: baseColor,
      600: colorUtils.rgbToHex(Math.max(0, r - 25), Math.max(0, g - 25), Math.max(0, b - 25)),
      700: colorUtils.rgbToHex(Math.max(0, r - 50), Math.max(0, g - 50), Math.max(0, b - 50)),
      800: colorUtils.rgbToHex(Math.max(0, r - 100), Math.max(0, g - 100), Math.max(0, b - 100)),
      900: colorUtils.rgbToHex(Math.max(0, r - 150), Math.max(0, g - 150), Math.max(0, b - 150)),
    };
  },

  // Get contrast color (black or white)
  getContrastColor: (hexColor: string): string => {
    const rgb = colorUtils.hexToRgb(hexColor);
    if (!rgb) return '#000000';
    
    const { r, g, b } = rgb;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  },

  // Generate random color
  generateRandomColor: (): string => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  },

  // Validate hex color
  isValidHex: (hex: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  },
};
```

### Step 4: Create Color Picker Component

Create `src/components/common/ColorPicker.tsx`:

```tsx
import React, { useState } from 'react';
import { useColorTheme } from '../../context/ColorThemeContext';
import { colorUtils } from '../../utils/colorUtils';

interface ColorPickerProps {
  colorName: string;
  label?: string;
  onColorChange?: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  colorName, 
  label = colorName,
  onColorChange 
}) => {
  const { updateColor, colors } = useColorTheme();
  const [isOpen, setIsOpen] = useState(false);

  const predefinedColors = [
    '#465fff', '#12b76a', '#f79009', '#f04438', '#0ba5ec',
    '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#06b6d6',
    '#3b82f6', '#a855f7', '#ec4899', '#84cc16', '#f97316'
  ];

  const handleColorSelect = (color: string) => {
    updateColor(colorName, color);
    onColorChange?.(color);
    setIsOpen(false);
  };

  const currentColor = colors[colorName as keyof typeof colors] || '#465fff';

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: currentColor }}
          title={currentColor}
        />
        
        <input
          type="text"
          value={currentColor}
          onChange={(e) => {
            if (colorUtils.isValidHex(e.target.value)) {
              handleColorSelect(e.target.value);
            }
          }}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-mono"
          placeholder="#465fff"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="grid grid-cols-5 gap-2">
            {predefinedColors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          
          <div className="mt-3">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="w-full h-8 border border-gray-300 rounded cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

### Step 5: Create Theme Switcher Component

Create `src/components/common/ThemeSwitcher.tsx`:

```tsx
import React from 'react';
import { useColorTheme, ColorTheme } from '../../context/ColorThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useColorTheme();

  const themes: { name: ColorTheme; label: string; preview: string }[] = [
    { name: 'light', label: 'Light', preview: '#ffffff' },
    { name: 'dark', label: 'Dark', preview: '#0c111d' },
    { name: 'blue', label: 'Blue', preview: '#3b82f6' },
    { name: 'green', label: 'Green', preview: '#10b981' },
    { name: 'purple', label: 'Purple', preview: '#8b5cf6' },
    { name: 'orange', label: 'Orange', preview: '#f59e0b' },
  ];

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Theme Switcher</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {themes.map((themeOption) => (
          <button
            key={themeOption.name}
            onClick={() => setTheme(themeOption.name)}
            className={`p-3 rounded-lg border-2 transition-all ${
              theme === themeOption.name
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div
              className="w-full h-8 rounded mb-2"
              style={{ backgroundColor: themeOption.preview }}
            />
            <span className="text-sm font-medium">{themeOption.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
```

### Step 6: Usage Examples

#### In your main App component:

```tsx
import React from 'react';
import { ColorThemeProvider } from './context/ColorThemeContext';
import { ThemeSwitcher } from './components/common/ThemeSwitcher';
import { ColorPicker } from './components/common/ColorPicker';

function App() {
  return (
    <ColorThemeProvider>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <header className="p-4 border-b" style={{ borderColor: 'var(--color-border-primary)' }}>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Dynamic Color System
          </h1>
        </header>
        
        <main className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ThemeSwitcher />
            
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Custom Colors</h3>
              <div className="space-y-4">
                <ColorPicker colorName="primary" label="Primary Color" />
                <ColorPicker colorName="secondary" label="Secondary Color" />
                <ColorPicker colorName="accent" label="Accent Color" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ColorThemeProvider>
  );
}

export default App;
```

#### Using dynamic colors in components:

```tsx
import React from 'react';
import { useColorTheme } from '../context/ColorThemeContext';

export const DynamicComponent: React.FC = () => {
  const { colors } = useColorTheme();

  return (
    <div 
      className="p-4 rounded-lg"
      style={{ 
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border-primary)',
        color: 'var(--color-text-primary)'
      }}
    >
      <h2 style={{ color: 'var(--color-primary)' }}>
        Dynamic Primary Color
      </h2>
      
      <p style={{ color: 'var(--color-text-secondary)' }}>
        This text uses dynamic secondary color
      </p>
      
      <button 
        className="px-4 py-2 rounded-md font-medium"
        style={{ 
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-text-inverse)'
        }}
      >
        Dynamic Button
      </button>
    </div>
  );
};
```

## Method 2: Tailwind CSS Dynamic Colors

### Add to your `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          light: 'var(--color-secondary-light)',
          dark: 'var(--color-secondary-dark)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          light: 'var(--color-accent-light)',
          dark: 'var(--color-accent-dark)',
        },
      },
    },
  },
}
```

### Usage with Tailwind classes:

```tsx
<div className="bg-primary text-white">
  <h1 className="text-primary-dark">Dynamic Primary Color</h1>
  <button className="bg-secondary hover:bg-secondary-dark">
    Dynamic Secondary Button
  </button>
</div>
```

## Benefits of This Dynamic Color System

1. **Real-time Updates**: Colors change instantly across the entire app
2. **Theme Persistence**: User preferences are saved in localStorage
3. **Accessibility**: Proper contrast ratios maintained
4. **Performance**: Uses CSS custom properties for optimal performance
5. **Flexibility**: Easy to add new themes or modify existing ones
6. **Developer Experience**: Simple API for color management

## Next Steps

1. Wrap your app with `ColorThemeProvider`
2. Use `useColorTheme` hook in components
3. Apply CSS custom properties for dynamic styling
4. Add theme switcher to your UI
5. Customize color palettes as needed

This system gives you complete control over your app's color scheme with minimal performance impact!
