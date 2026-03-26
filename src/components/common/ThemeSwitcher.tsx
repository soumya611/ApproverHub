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
      <h3 className="text-lg font-gilroy-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
        Theme Switcher
      </h3>
      
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
            <span className="text-sm font-gilroy-medium">{themeOption.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
