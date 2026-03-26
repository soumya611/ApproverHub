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

  // Lighten a color
  lighten: (hex: string, amount: number): string => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return hex;
    
    const { r, g, b } = rgb;
    return colorUtils.rgbToHex(
      Math.min(255, r + amount),
      Math.min(255, g + amount),
      Math.min(255, b + amount)
    );
  },

  // Darken a color
  darken: (hex: string, amount: number): string => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return hex;
    
    const { r, g, b } = rgb;
    return colorUtils.rgbToHex(
      Math.max(0, r - amount),
      Math.max(0, g - amount),
      Math.max(0, b - amount)
    );
  },

  // Get color from CSS custom property
  getCSSColor: (propertyName: string): string => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--color-${propertyName}`)
      .trim();
  },

  // Set color to CSS custom property
  setCSSColor: (propertyName: string, colorValue: string): void => {
    document.documentElement.style.setProperty(`--color-${propertyName}`, colorValue);
  },
};
