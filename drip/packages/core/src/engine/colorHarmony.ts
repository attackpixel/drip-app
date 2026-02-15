const NEUTRALS = new Set(['black', 'white', 'gray', 'navy', 'beige', 'cream', 'tan', 'brown']);

const COMPATIBLE_COLORS: Record<string, string[]> = {
  blue: ['white', 'gray', 'navy', 'beige', 'brown', 'tan', 'cream', 'light-blue', 'denim'],
  'light-blue': ['white', 'navy', 'gray', 'beige', 'brown', 'blue', 'denim', 'coral'],
  red: ['white', 'black', 'navy', 'gray', 'denim', 'beige'],
  burgundy: ['white', 'black', 'navy', 'gray', 'beige', 'cream', 'tan', 'olive'],
  pink: ['white', 'gray', 'navy', 'blue', 'denim', 'cream', 'beige', 'lavender'],
  green: ['white', 'beige', 'brown', 'tan', 'navy', 'cream', 'black'],
  olive: ['white', 'beige', 'brown', 'tan', 'cream', 'black', 'burgundy', 'navy'],
  orange: ['white', 'navy', 'blue', 'brown', 'beige', 'denim'],
  yellow: ['navy', 'blue', 'gray', 'white', 'denim', 'brown'],
  purple: ['white', 'gray', 'black', 'beige', 'cream', 'lavender', 'pink'],
  lavender: ['white', 'gray', 'navy', 'cream', 'purple', 'pink', 'beige'],
  teal: ['white', 'beige', 'cream', 'navy', 'coral', 'brown'],
  coral: ['white', 'navy', 'teal', 'beige', 'cream', 'denim', 'light-blue'],
  gold: ['black', 'navy', 'white', 'burgundy', 'brown', 'cream'],
  silver: ['black', 'white', 'gray', 'navy', 'blue', 'purple'],
  denim: ['white', 'black', 'gray', 'beige', 'brown', 'red', 'blue', 'light-blue', 'coral', 'olive'],
};

export function areColorsCompatible(colorsA: string[], colorsB: string[]): boolean {
  // Neutrals match everything
  if (colorsA.every((c) => NEUTRALS.has(c)) || colorsB.every((c) => NEUTRALS.has(c))) {
    return true;
  }

  // Check if any color in A is compatible with any color in B
  for (const a of colorsA) {
    if (NEUTRALS.has(a)) continue;
    for (const b of colorsB) {
      if (NEUTRALS.has(b)) continue;
      if (a === b) return true; // Same color family
      const compat = COMPATIBLE_COLORS[a];
      if (compat?.includes(b)) return true;
      const compatB = COMPATIBLE_COLORS[b];
      if (compatB?.includes(a)) return true;
    }
  }

  return false;
}

export function colorHarmonyScore(allColors: string[][]): number {
  if (allColors.length <= 1) return 1;

  let compatible = 0;
  let total = 0;

  for (let i = 0; i < allColors.length; i++) {
    for (let j = i + 1; j < allColors.length; j++) {
      total++;
      if (areColorsCompatible(allColors[i], allColors[j])) {
        compatible++;
      }
    }
  }

  return total === 0 ? 1 : compatible / total;
}
