/**
 * Pure color and contrast utility functions for WCAG compliance checking.
 * No DOM dependencies - these functions operate on primitive values only.
 */

'use strict';

/**
 * Converts a single color channel value (0-255) to a 2-digit hex string.
 */
function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

/**
 * Parses an rgb/rgba CSS color string into {r, g, b, a} components.
 */
function parseRgb(rgbString) {
  const isRgba = rgbString.indexOf('rgba') !== -1;
  const cleaned = rgbString.replace(/rgba?\(|\)|\s/g, '');
  const parts = cleaned.split(',');
  return {
    r: parseInt(parts[0], 10),
    g: parseInt(parts[1], 10),
    b: parseInt(parts[2], 10),
    a: isRgba ? parseFloat(parts[3]) : 1
  };
}

/**
 * Converts an rgb/rgba CSS string to a hex color code.
 */
function rgbToHex(rgbString) {
  const { r, g, b } = parseRgb(rgbString);
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/**
 * Converts an sRGB gamma-encoded channel value (0-1) to linear RGB.
 */
function sRGBtoLin(colorChannel) {
  if (colorChannel <= 0.04045) {
    return colorChannel / 12.92;
  }
  return Math.pow((colorChannel + 0.055) / 1.055, 2.4);
}

/**
 * Calculates relative luminance from RGB values (0-255 each).
 * Uses WCAG 2.x formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function calculateLuminance(red, green, blue) {
  const R = sRGBtoLin(red / 255.0);
  const G = sRGBtoLin(green / 255.0);
  const B = sRGBtoLin(blue / 255.0);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Computes the WCAG contrast ratio between two CSS color strings.
 * Returns a value between 1 and 21.
 */
function calculateContrast(color1, color2) {
  const c1 = parseRgb(color1);
  const c2 = parseRgb(color2);

  let r1 = c1.r, g1 = c1.g, b1 = c1.b;
  let r2 = c2.r, g2 = c2.g, b2 = c2.b;

  // Handle transparent foreground: treat as white
  if (c1.a === 0) { r1 = 255; g1 = 255; b1 = 255; }
  // Handle transparent background: treat as white
  if (c2.a === 0) { r2 = 255; g2 = 255; b2 = 255; }

  const lum1 = calculateLuminance(r1, g1, b1);
  const lum2 = calculateLuminance(r2, g2, b2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Rounds a contrast value to 2 decimal places.
 */
function roundContrast(contrast) {
  return Math.round((contrast + Number.EPSILON) * 100) / 100;
}

/**
 * Checks if contrast meets WCAG AA compliance for text elements.
 */
function getIsAACompliant(contrast, fontSize, fontWeight) {
  const isLargeText = fontSize >= 18.0 || (fontSize >= 14.0 && fontWeight >= 700);
  return contrast >= (isLargeText ? 3.0 : 4.5);
}

/**
 * Checks if contrast meets WCAG AAA compliance for text elements.
 */
function getIsAAACompliant(contrast, fontSize, fontWeight) {
  const isLargeText = fontSize >= 18.0 || (fontSize >= 14.0 && fontWeight >= 700);
  return contrast >= (isLargeText ? 4.5 : 7.0);
}

/**
 * Checks if contrast meets WCAG AA compliance for non-text elements.
 */
function getIsNonTextAACompliant(contrast) {
  return contrast >= 3.0;
}

/**
 * Checks if contrast meets WCAG AAA compliance for non-text elements.
 */
function getIsNonTextAAACompliant(contrast) {
  return contrast >= 3.0;
}

/**
 * Returns a human-readable text size label based on font metrics.
 */
function getTextSizeString(fontSize, fontWeight) {
  if (fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700)) {
    return 'Large Text';
  }
  return 'Small Text';
}

// Export for Node.js testing; no-op in browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    componentToHex,
    parseRgb,
    rgbToHex,
    sRGBtoLin,
    calculateLuminance,
    calculateContrast,
    roundContrast,
    getIsAACompliant,
    getIsAAACompliant,
    getIsNonTextAACompliant,
    getIsNonTextAAACompliant,
    getTextSizeString
  };
}
