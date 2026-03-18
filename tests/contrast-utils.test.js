const {
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
} = require('../lib/contrast-utils');

describe('componentToHex', () => {
  test('converts 0 to "00"', () => {
    expect(componentToHex(0)).toBe('00');
  });

  test('converts 255 to "ff"', () => {
    expect(componentToHex(255)).toBe('ff');
  });

  test('pads single digit hex values', () => {
    expect(componentToHex(10)).toBe('0a');
  });

  test('converts 128 to "80"', () => {
    expect(componentToHex(128)).toBe('80');
  });
});

describe('parseRgb', () => {
  test('parses rgb string', () => {
    expect(parseRgb('rgb(255, 0, 128)')).toEqual({ r: 255, g: 0, b: 128, a: 1 });
  });

  test('parses rgba string', () => {
    expect(parseRgb('rgba(100, 200, 50, 0.5)')).toEqual({ r: 100, g: 200, b: 50, a: 0.5 });
  });

  test('parses rgba with zero alpha', () => {
    expect(parseRgb('rgba(0, 0, 0, 0)')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  test('handles no spaces', () => {
    expect(parseRgb('rgb(10,20,30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 });
  });
});

describe('rgbToHex', () => {
  test('converts white', () => {
    expect(rgbToHex('rgb(255, 255, 255)')).toBe('#ffffff');
  });

  test('converts black', () => {
    expect(rgbToHex('rgb(0, 0, 0)')).toBe('#000000');
  });

  test('converts red', () => {
    expect(rgbToHex('rgb(255, 0, 0)')).toBe('#ff0000');
  });

  test('converts rgba (ignores alpha)', () => {
    expect(rgbToHex('rgba(0, 128, 255, 0.5)')).toBe('#0080ff');
  });
});

describe('sRGBtoLin', () => {
  test('returns 0 for input 0', () => {
    expect(sRGBtoLin(0)).toBe(0);
  });

  test('returns 1 for input 1', () => {
    expect(sRGBtoLin(1)).toBeCloseTo(1, 5);
  });

  test('handles threshold value correctly', () => {
    expect(sRGBtoLin(0.04045)).toBeCloseTo(0.04045 / 12.92, 10);
  });

  test('uses linear formula below threshold', () => {
    expect(sRGBtoLin(0.02)).toBeCloseTo(0.02 / 12.92, 10);
  });

  test('uses power formula above threshold', () => {
    const result = sRGBtoLin(0.5);
    const expected = Math.pow((0.5 + 0.055) / 1.055, 2.4);
    expect(result).toBeCloseTo(expected, 10);
  });
});

describe('calculateLuminance', () => {
  test('white has luminance of 1', () => {
    expect(calculateLuminance(255, 255, 255)).toBeCloseTo(1, 2);
  });

  test('black has luminance of 0', () => {
    expect(calculateLuminance(0, 0, 0)).toBe(0);
  });

  test('pure red has expected luminance', () => {
    expect(calculateLuminance(255, 0, 0)).toBeCloseTo(0.2126, 2);
  });

  test('pure green has expected luminance', () => {
    expect(calculateLuminance(0, 255, 0)).toBeCloseTo(0.7152, 2);
  });

  test('pure blue has expected luminance', () => {
    expect(calculateLuminance(0, 0, 255)).toBeCloseTo(0.0722, 2);
  });
});

describe('calculateContrast', () => {
  test('black on white gives 21:1', () => {
    const contrast = calculateContrast('rgb(0, 0, 0)', 'rgb(255, 255, 255)');
    expect(contrast).toBeCloseTo(21, 0);
  });

  test('white on white gives 1:1', () => {
    const contrast = calculateContrast('rgb(255, 255, 255)', 'rgb(255, 255, 255)');
    expect(contrast).toBeCloseTo(1, 0);
  });

  test('same colors give 1:1', () => {
    const contrast = calculateContrast('rgb(128, 128, 128)', 'rgb(128, 128, 128)');
    expect(contrast).toBeCloseTo(1, 0);
  });

  test('order of colors does not matter', () => {
    const c1 = calculateContrast('rgb(0, 0, 0)', 'rgb(255, 255, 255)');
    const c2 = calculateContrast('rgb(255, 255, 255)', 'rgb(0, 0, 0)');
    expect(c1).toBeCloseTo(c2, 5);
  });

  test('transparent color (alpha=0) treated as white', () => {
    const contrast = calculateContrast('rgba(0, 0, 0, 0)', 'rgb(0, 0, 0)');
    expect(contrast).toBeCloseTo(21, 0);
  });

  test('handles typical gray on white', () => {
    const contrast = calculateContrast('rgb(118, 118, 118)', 'rgb(255, 255, 255)');
    expect(contrast).toBeGreaterThan(3);
    expect(contrast).toBeLessThan(5);
  });
});

describe('roundContrast', () => {
  test('rounds to 2 decimal places', () => {
    expect(roundContrast(4.567)).toBe(4.57);
  });

  test('rounds down correctly', () => {
    expect(roundContrast(3.141)).toBe(3.14);
  });

  test('preserves integers', () => {
    expect(roundContrast(21)).toBe(21);
  });

  test('handles single decimal', () => {
    expect(roundContrast(4.5)).toBe(4.5);
  });
});

describe('getIsAACompliant', () => {
  test('large text (>=18px) passes at 3.0 contrast', () => {
    expect(getIsAACompliant(3.0, 18, 400)).toBe(true);
  });

  test('large text fails below 3.0', () => {
    expect(getIsAACompliant(2.9, 18, 400)).toBe(false);
  });

  test('bold text (>=14px, >=700 weight) passes at 3.0', () => {
    expect(getIsAACompliant(3.0, 14, 700)).toBe(true);
  });

  test('bold text at 13px is not large text', () => {
    expect(getIsAACompliant(3.0, 13, 700)).toBe(false);
  });

  test('small text passes at 4.5', () => {
    expect(getIsAACompliant(4.5, 12, 400)).toBe(true);
  });

  test('small text fails below 4.5', () => {
    expect(getIsAACompliant(4.4, 12, 400)).toBe(false);
  });

  test('small text at boundary (17px normal weight) needs 4.5', () => {
    expect(getIsAACompliant(4.5, 17, 400)).toBe(true);
    expect(getIsAACompliant(3.0, 17, 400)).toBe(false);
  });
});

describe('getIsAAACompliant', () => {
  test('large text passes at 4.5', () => {
    expect(getIsAAACompliant(4.5, 18, 400)).toBe(true);
  });

  test('large text fails below 4.5', () => {
    expect(getIsAAACompliant(4.4, 18, 400)).toBe(false);
  });

  test('bold large text (>=14px, >=700 weight) passes at 4.5', () => {
    expect(getIsAAACompliant(4.5, 14, 700)).toBe(true);
  });

  test('small text passes at 7.0', () => {
    expect(getIsAAACompliant(7.0, 12, 400)).toBe(true);
  });

  test('small text fails below 7.0', () => {
    expect(getIsAAACompliant(6.9, 12, 400)).toBe(false);
  });
});

describe('getIsNonTextAACompliant', () => {
  test('passes at 3.0', () => {
    expect(getIsNonTextAACompliant(3.0)).toBe(true);
  });

  test('fails below 3.0', () => {
    expect(getIsNonTextAACompliant(2.9)).toBe(false);
  });

  test('passes well above threshold', () => {
    expect(getIsNonTextAACompliant(10)).toBe(true);
  });
});

describe('getIsNonTextAAACompliant', () => {
  test('passes at 3.0', () => {
    expect(getIsNonTextAAACompliant(3.0)).toBe(true);
  });

  test('fails below 3.0', () => {
    expect(getIsNonTextAAACompliant(2.9)).toBe(false);
  });
});

describe('getTextSizeString', () => {
  test('returns "Large Text" for font >= 18px', () => {
    expect(getTextSizeString(18, 400)).toBe('Large Text');
  });

  test('returns "Large Text" for bold font >= 14px', () => {
    expect(getTextSizeString(14, 700)).toBe('Large Text');
  });

  test('returns "Small Text" for font < 18px normal weight', () => {
    expect(getTextSizeString(16, 400)).toBe('Small Text');
  });

  test('returns "Small Text" for small bold text', () => {
    expect(getTextSizeString(13, 700)).toBe('Small Text');
  });

  test('returns "Large Text" for large bold text', () => {
    expect(getTextSizeString(20, 700)).toBe('Large Text');
  });
});

describe('integration: contrast calculations match known WCAG values', () => {
  test('WCAG example: #777 on #fff should be around 4.48:1', () => {
    const contrast = roundContrast(calculateContrast('rgb(119, 119, 119)', 'rgb(255, 255, 255)'));
    expect(contrast).toBeCloseTo(4.48, 1);
  });

  test('#777 on white fails AAA for small text', () => {
    const contrast = roundContrast(calculateContrast('rgb(119, 119, 119)', 'rgb(255, 255, 255)'));
    expect(getIsAACompliant(contrast, 12, 400)).toBe(false);
    expect(getIsAAACompliant(contrast, 12, 400)).toBe(false);
  });

  test('#777 on white passes AA for large text', () => {
    const contrast = roundContrast(calculateContrast('rgb(119, 119, 119)', 'rgb(255, 255, 255)'));
    expect(getIsAACompliant(contrast, 18, 400)).toBe(true);
  });
});
