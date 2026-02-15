export const COLOR_HEX: Record<string, string> = {
  black: '#1a1a1a',
  white: '#f5f5f5',
  gray: '#9ca3af',
  navy: '#1e3a5f',
  blue: '#3b82f6',
  'light-blue': '#93c5fd',
  red: '#ef4444',
  burgundy: '#7f1d1d',
  pink: '#f472b6',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  olive: '#6b7c3e',
  brown: '#92400e',
  tan: '#d2b48c',
  beige: '#f5f0e1',
  cream: '#fdf6e3',
  purple: '#a855f7',
  lavender: '#c4b5fd',
  teal: '#14b8a6',
  coral: '#fb7185',
  gold: '#d4a017',
  silver: '#c0c0c0',
  denim: '#4b6fa5',
};

export function getColorHex(color: string | { hex?: string } | undefined): string {
  if (!color) return '#9ca3af';
  if (typeof color === 'object' && color.hex) return color.hex;
  return COLOR_HEX[color as string] ?? '#9ca3af';
}

export function getContrastColor(hex: string): 'black' | 'white' {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? 'black' : 'white';
}
