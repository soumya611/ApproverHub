# Gilroy Font Implementation Guide

## Overview
The Gilroy font family has been implemented across the entire site with dynamic font weights. All font files are located in `src/assets/fonts/` and the font system is configured in `src/index.css`.

## Font Weights Available

### Standard Weights
- **Thin**: `font-gilroy-thin` (100)
- **UltraLight**: `font-gilroy-ultralight` (200)
- **Light**: `font-gilroy-light` (300)
- **Regular**: `font-gilroy-regular` (400) - Default
- **Medium**: `font-gilroy-medium` (500)
- **SemiBold**: `font-gilroy-semibold` (600)
- **Bold**: `font-gilroy-bold` (700)
- **ExtraBold**: `font-gilroy-extrabold` (800)
- **Heavy**: `font-gilroy-heavy` (850)
- **Black**: `font-gilroy-black` (900)

### Italic Variants
- **Thin Italic**: `font-gilroy-thin-italic` (100)
- **UltraLight Italic**: `font-gilroy-ultralight-italic` (200)
- **Light Italic**: `font-gilroy-light-italic` (300)
- **Regular Italic**: `font-gilroy-regular-italic` (400)
- **Medium Italic**: `font-gilroy-medium-italic` (500)
- **SemiBold Italic**: `font-gilroy-semibold-italic` (600)
- **Bold Italic**: `font-gilroy-bold-italic` (700)
- **ExtraBold Italic**: `font-gilroy-extrabold-italic` (800)
- **Heavy Italic**: `font-gilroy-heavy-italic` (850)
- **Black Italic**: `font-gilroy-black-italic` (900)

## How to Use

### 1. Basic Usage
```jsx
// Regular text (default)
<p className="font-gilroy-regular">This is regular text</p>

// Medium weight
<h2 className="font-gilroy-medium">This is medium text</h2>

// Bold text
<h1 className="font-gilroy-bold">This is bold text</h1>
```

### 2. With Tailwind Classes
```jsx
// Combining with other Tailwind classes
<div className="text-lg font-gilroy-semibold text-gray-800">
  Large semibold text
</div>

// With responsive design
<h1 className="text-xl sm:text-2xl font-gilroy-bold text-center">
  Responsive bold heading
</h1>
```

### 3. Italic Text
```jsx
// Regular italic
<p className="font-gilroy-regular-italic">This is italic text</p>

// Bold italic
<em className="font-gilroy-bold-italic">This is bold italic text</em>
```

### 4. Dynamic Font Weights
You can also use standard Tailwind font weight classes with the default Gilroy font:

```jsx
// These will use Gilroy with the specified weight
<p className="font-thin">Thin text (100)</p>
<p className="font-light">Light text (300)</p>
<p className="font-normal">Normal text (400)</p>
<p className="font-medium">Medium text (500)</p>
<p className="font-semibold">Semibold text (600)</p>
<p className="font-bold">Bold text (700)</p>
<p className="font-extrabold">Extra bold text (800)</p>
<p className="font-black">Black text (900)</p>
```

## Implementation Details

### CSS Configuration
The font system is configured in `src/index.css`:

1. **Font Faces**: All Gilroy font files are loaded with `@font-face` declarations
2. **Default Font**: Gilroy is set as the default font family for the entire site
3. **Custom Utilities**: Custom Tailwind utilities are created for each font weight
4. **Font Display**: `font-display: swap` is used for better performance

### File Structure
```
src/assets/fonts/
├── Gilroy-Thin.ttf
├── Gilroy-ThinItalic.ttf
├── Gilroy-UltraLight.ttf
├── Gilroy-UltraLightItalic.ttf
├── Gilroy-Light.ttf
├── Gilroy-LightItalic.ttf
├── Gilroy-Regular.ttf
├── Gilroy-RegularItalic.ttf
├── Gilroy-Medium.ttf
├── Gilroy-MediumItalic.ttf
├── Gilroy-SemiBold.ttf
├── Gilroy-SemiBoldItalic.ttf
├── Gilroy-Bold.ttf
├── Gilroy-BoldItalic.ttf
├── Gilroy-ExtraBold.ttf
├── Gilroy-ExtraBoldItalic.ttf
├── Gilroy-Heavy.ttf
├── Gilroy-HeavyItalic.ttf
├── Gilroy-Black.ttf
└── Gilroy-BlackItalic.ttf
```

## Best Practices

### 1. Font Weight Selection
- **Headings**: Use `font-gilroy-bold` or `font-gilroy-semibold` for main headings
- **Subheadings**: Use `font-gilroy-medium` for subheadings
- **Body Text**: Use `font-gilroy-regular` for body text
- **Captions**: Use `font-gilroy-light` for captions and small text

### 2. Performance Considerations
- Font files are loaded with `font-display: swap` for better performance
- Only the weights you use will be loaded by the browser
- Consider using font preloading for critical weights

### 3. Accessibility
- Ensure sufficient contrast between text and background
- Use appropriate font sizes for readability
- Consider users with visual impairments when selecting font weights

## Examples in Current Codebase

### Workflow Card Implementation
```jsx
// Stage badge
<div className="bg-[#FFEAE6] text-[#F15F44] text-[12px] font-gilroy-medium px-2 py-0.5 rounded-md">
  S1
</div>

// Title
<h4 className="font-gilroy-medium text-[#212121] text-[16px] leading-tight">
  Compliance
</h4>

// Date text
<span className="text-[12px] font-gilroy-regular text-[#676767]">
  27 to 31 Dec 25
</span>

// Status badge
<div className="bg-green-600 text-white text-[11px] font-gilroy-medium px-3 py-1 rounded-full">
  Approved
</div>
```

## Troubleshooting

### Font Not Loading
1. Check if font files exist in `src/assets/fonts/`
2. Verify the file paths in `@font-face` declarations
3. Check browser console for 404 errors

### Font Weight Not Applied
1. Ensure you're using the correct class name (e.g., `font-gilroy-medium`)
2. Check if the font file for that weight exists
3. Verify CSS is properly compiled

### Performance Issues
1. Consider using `font-display: swap` (already implemented)
2. Preload critical font weights
3. Use font subsetting for smaller file sizes

## Migration from Previous Fonts

If you were using other fonts before:

1. **Replace font classes**: Change `font-outfit` to `font-gilroy-medium` (or appropriate weight)
2. **Update font weights**: Replace numeric weights with semantic names
3. **Test across devices**: Ensure fonts load properly on all target devices

## Future Enhancements

- Add font subsetting for smaller file sizes
- Implement font loading optimization
- Add more font variants if needed
- Consider variable font implementation
