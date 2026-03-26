import React, { useState } from 'react';
import { useColorTheme, type ColorToken } from '../../context/ColorThemeContext';
import { colorUtils } from '../../utils/colorUtils';

interface ColorPickerProps {
  colorName: ColorToken;
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
    '#098399', '#f15f44', '#d9d9d9', '#465fff', '#12b76a',
    '#f79009', '#f04438', '#0ba5ec',
    '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#06b6d6',
    '#3b82f6', '#a855f7', '#ec4899', '#84cc16', '#f97316'
  ];

  const handleColorSelect = (color: string) => {
    updateColor(colorName, color);
    onColorChange?.(color);
    setIsOpen(false);
  };

  const currentColor = colors[colorName] || '#465fff';

  return (
    <div className="relative">
      <label className="block text-sm font-gilroy-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm hover:border-gray-400 transition-colors"
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
          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-gilroy-regular font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="#465fff"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="grid grid-cols-5 gap-2 mb-3">
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
          
          <div>
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
