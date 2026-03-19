/**
 * Color utility functions for converting between hex and OKLCH formats
 */

/**
 * Converts hex color to OKLCH format using browser's CSS color conversion
 * @param hex - Hex color string (e.g., "#00d4aa" or "#00D4AA")
 * @returns OKLCH color string (e.g., "oklch(67.35% 0.153 159.64)")
 */
export function hexToOklch(hex: string): string {
  if (!hex || !hex.startsWith('#')) {
    return hex; // Return as-is if not a valid hex
  }

  // Normalize hex (ensure 6 digits)
  let normalizedHex = hex.replace('#', '');
  if (normalizedHex.length === 3) {
    normalizedHex = normalizedHex.split('').map(char => char + char).join('');
  }
  normalizedHex = '#' + normalizedHex;

  // Use browser's CSS color conversion if available
  if (typeof window !== 'undefined') {
    try {
      // Create a temporary element and set color
      const tempDiv = document.createElement('div');
      tempDiv.style.color = normalizedHex;
      document.body.appendChild(tempDiv);
      
      // Try to get computed color in OKLCH
      const computedColor = window.getComputedStyle(tempDiv).color;
      document.body.removeChild(tempDiv);
      
      // Convert RGB to OKLCH manually if browser doesn't support OKLCH
      // Parse RGB from computed color
      const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]) / 255;
        const g = parseInt(rgbMatch[2]) / 255;
        const b = parseInt(rgbMatch[3]) / 255;
        
        // Simplified conversion: RGB -> OKLCH approximation
        // This is a simplified version - for production, consider using a library like culori
        return rgbToOklchApprox(r, g, b);
      }
    } catch (e) {
      // Fallback to manual conversion
    }
  }

  // Manual conversion fallback
  return rgbToOklchApprox(
    parseInt(normalizedHex.substring(1, 3), 16) / 255,
    parseInt(normalizedHex.substring(3, 5), 16) / 255,
    parseInt(normalizedHex.substring(5, 7), 16) / 255
  );
}

/**
 * Approximate RGB to OKLCH conversion
 */
function rgbToOklchApprox(r: number, g: number, b: number): string {
  // Convert RGB to linear RGB
  const linearR = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const linearG = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const linearB = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Convert to OKLab (simplified)
  const l = 0.4122214708 * linearR + 0.5363325363 * linearG + 0.0514459929 * linearB;
  const m = 0.2119034982 * linearR + 0.6806995451 * linearG + 0.1073969566 * linearB;
  const s = 0.0883024619 * linearR + 0.2817188376 * linearG + 0.6299787005 * linearB;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const l_ok = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a_ok = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_ok = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // Convert OKLab to OKLCH
  const c = Math.sqrt(a_ok * a_ok + b_ok * b_ok);
  const h = Math.atan2(b_ok, a_ok) * (180 / Math.PI);
  const h_normalized = h < 0 ? h + 360 : h;

  return `oklch(${(l_ok * 100).toFixed(2)}% ${c.toFixed(3)} ${h_normalized.toFixed(2)})`;
}

/**
 * Converts OKLCH color to hex format using browser's CSS color conversion
 * @param oklch - OKLCH color string (e.g., "oklch(67.35% 0.153 159.64)")
 * @returns Hex color string (e.g., "#00d4aa")
 */
export function oklchToHex(oklch: string): string {
  if (!oklch) return '#000000';
  
  // If it's already hex, return as-is
  if (oklch.startsWith('#')) {
    return oklch;
  }
  
  // If not OKLCH format, try to use browser conversion
  if (!oklch.startsWith('oklch')) {
    return getHexForColorInput(oklch);
  }

  // Use browser's CSS color conversion if available
  if (typeof window !== 'undefined') {
    try {
      // Create a temporary element and set color to OKLCH
      const tempDiv = document.createElement('div');
      tempDiv.style.color = oklch;
      document.body.appendChild(tempDiv);
      
      // Get computed RGB color
      const computedColor = window.getComputedStyle(tempDiv).color;
      document.body.removeChild(tempDiv);
      
      // Convert RGB to hex
      const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
        const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
        const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
      }
    } catch (e) {
      // Fallback to manual conversion
    }
  }

  // Manual conversion fallback
  const match = oklch.match(/oklch\(([^)]+)\)/);
  if (!match) return '#000000';

  const values = match[1].split(/\s+/);
  const l = parseFloat(values[0].replace('%', '')) / 100;
  const c = parseFloat(values[1]);
  const h = parseFloat(values[2]) * (Math.PI / 180);

  // Convert OKLCH to OKLab
  const a_ok = c * Math.cos(h);
  const b_ok = c * Math.sin(h);
  const l_ok = l;

  // Convert OKLab to linear RGB
  const l_ = l_ok + 0.3963377774 * a_ok + 0.2158037573 * b_ok;
  const m_ = l_ok - 0.1055613458 * a_ok - 0.0638541728 * b_ok;
  const s_ = l_ok - 0.0894841775 * a_ok - 1.2914855480 * b_ok;

  const l_cubed = l_ * l_ * l_;
  const m_cubed = m_ * m_ * m_;
  const s_cubed = s_ * s_ * s_;

  // Convert to RGB
  const r = +4.0767416621 * l_cubed - 3.3077115913 * m_cubed + 0.2309699292 * s_cubed;
  const g = -1.2684380046 * l_cubed + 2.6097574011 * m_cubed - 0.3413193965 * s_cubed;
  const b = -0.0041960863 * l_cubed - 0.7034186147 * m_cubed + 1.7076147010 * s_cubed;

  // Convert linear RGB to RGB
  const r_clamped = Math.max(0, Math.min(1, r));
  const g_clamped = Math.max(0, Math.min(1, g));
  const b_clamped = Math.max(0, Math.min(1, b));

  const r_final = Math.round(r_clamped * 255);
  const g_final = Math.round(g_clamped * 255);
  const b_final = Math.round(b_clamped * 255);

  return `#${r_final.toString(16).padStart(2, '0')}${g_final.toString(16).padStart(2, '0')}${b_final.toString(16).padStart(2, '0')}`;
}

/**
 * Detects if a color string is in hex format
 */
export function isHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Detects if a color string is in OKLCH format
 */
export function isOklchColor(color: string): boolean {
  return /^oklch\(/.test(color);
}

/**
 * Normalizes a color value to ensure it's valid CSS color
 */
export function normalizeColor(color: string): string {
  if (!color) return color;
  
  // If it's hex, ensure it's valid
  if (isHexColor(color)) {
    return color;
  }
  
  // If it's OKLCH, return as-is
  if (isOklchColor(color)) {
    return color;
  }
  
  // Try to parse as hex if it looks like hex
  if (color.startsWith('#')) {
    return color;
  }
  
  // Return as-is (might be a CSS color name or other format)
  return color;
}

/**
 * Gets a hex color from any format for use in color input
 */
export function getHexForColorInput(color: string): string {
  if (isHexColor(color)) {
    return color;
  }
  
  if (isOklchColor(color)) {
    return oklchToHex(color);
  }
  
  // Try to create a temporary element to get computed color
  if (typeof window !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.style.color = color;
    document.body.appendChild(tempDiv);
    const computedColor = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    
    // Convert rgb/rgba to hex
    const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
  }
  
  return '#000000'; // Default fallback
}

