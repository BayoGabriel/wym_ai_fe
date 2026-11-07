/* --------------------------------------------------------------------------
   Tenant accent — derives a contrast-safe accent scale from an org's
   primaryColor so a bad brand colour can't break readability.
   -------------------------------------------------------------------------- */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

function hslCss(h: number, s: number, l: number) {
  return `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
}

function channelLuminance(c: number) {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(r: number, g: number, b: number) {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

function contrast(l1: number, l2: number) {
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function hslToRgb(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0]
    : h < 120 ? [x, c, 0]
    : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c]
    : h < 300 ? [x, 0, c]
    : [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

function hslLuminance(h: number, s: number, l: number) {
  const c = hslToRgb(h, s, l);
  return luminance(c.r, c.g, c.b);
}

const WHITE_L = 1;
const INK_L = luminance(14, 20, 14);

export type TenantAccent = {
  accent: string;
  strong: string;
  soft: string;
  text: string;
};

/**
 * Turns any hex colour into a readable accent ramp.
 * Light theme: darkens until white text hits WCAG AA (≥4.5), else falls back
 * to near-black text. Dark theme: lightens until ink text hits AA.
 */
export function deriveTenantAccent(input: string, dark: boolean): TenantAccent | null {
  const rgb = hexToRgb(input);
  if (!rgb) return null;
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const sat = Math.min(Math.max(s, 0.35), 0.85);

  if (!dark) {
    let L = Math.min(Math.max(l, 0.16), 0.52);
    while (L > 0.16 && contrast(hslLuminance(h, sat, L), WHITE_L) < 4.5) L -= 0.02;
    const onWhite = contrast(hslLuminance(h, sat, L), WHITE_L) >= 4.5;
    return {
      accent: hslCss(h, sat, L),
      strong: hslCss(h, sat, Math.max(L - 0.12, 0.08)),
      soft: hslCss(h, Math.min(sat * 0.55, 0.5), 0.93),
      text: onWhite ? '#ffffff' : '#14190f',
    };
  }

  let L = Math.min(Math.max(l, 0.45), 0.72);
  while (L < 0.72 && contrast(hslLuminance(h, sat, L), INK_L) < 4.5) L += 0.02;
  const onInk = contrast(hslLuminance(h, sat, L), INK_L) >= 4.5;
  return {
    accent: hslCss(h, sat, L),
    strong: hslCss(h, sat, Math.min(L + 0.12, 0.85)),
    soft: hslCss(h, Math.min(sat * 0.6, 0.55), 0.2),
    text: onInk ? '#0c1a12' : '#f2efe8',
  };
}
