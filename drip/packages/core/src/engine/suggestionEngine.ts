import type { ClothingItem, ColorOption, WeatherData, OutfitSlot, Occasion } from '../types';
import { OCCASION_FORMALITY } from '../types/outfit';
import { isWeatherAppropriate, weatherFitScore, needsOuterwear } from './weatherRules';
import { recencyScore, varietyScore } from './rotationScorer';
import { areColorsCompatible } from './colorHarmony';

function getColorNames(colors: ColorOption[]): string[] {
  return colors.map((c) => c.name.toLowerCase());
}

export interface SuggestionResult {
  items: { item: ClothingItem; slot: OutfitSlot; score: number }[];
  confidence: number; // 0-1
  reasons: string[];
}

interface SuggestionOptions {
  weather?: WeatherData | null;
  occasion?: Occasion | null;
  excludeItemIds?: string[];
}

type SlotKey = 'top' | 'bottom' | 'shoes' | 'outerwear';

function scoreItem(
  item: ClothingItem,
  allItems: ClothingItem[],
  weather: WeatherData | null,
  targetFormality: number
): number {
  let score = 0;

  // Recency (0-40)
  score += recencyScore(item);

  // Weather fit (0-30)
  if (weather) {
    score += weatherFitScore(item, weather);
  } else {
    score += 15; // neutral
  }

  // Formality match (0-20)
  const formalityDiff = Math.abs(item.formality_level - targetFormality);
  score += Math.max(0, 20 - formalityDiff * 5);

  // Variety (0-10)
  score += varietyScore(item, allItems);

  return score;
}

function selectBestForSlot(
  candidates: ClothingItem[],
  allItems: ClothingItem[],
  weather: WeatherData | null,
  targetFormality: number,
  selectedColors: string[][],
  excludeIds: Set<number>
): { item: ClothingItem; score: number } | null {
  const scored = candidates
    .filter((c) => !excludeIds.has(c.id))
    .map((item) => ({
      item,
      score: scoreItem(item, allItems, weather, targetFormality),
    }))
    .sort((a, b) => b.score - a.score);

  // Prefer color-compatible items
  for (const candidate of scored) {
    if (selectedColors.length === 0 || areColorsCompatible(getColorNames(candidate.item.colors), selectedColors.flat())) {
      return candidate;
    }
  }

  // Fall back to highest scoring regardless of color
  return scored[0] ?? null;
}

export function generateSuggestion(
  wardrobe: ClothingItem[],
  options: SuggestionOptions = {}
): SuggestionResult {
  const { weather = null, occasion = null, excludeItemIds = [] } = options;
  const excludeIds = new Set(excludeItemIds.map(Number));
  const reasons: string[] = [];

  const targetFormality = occasion ? OCCASION_FORMALITY[occasion] : 2;

  // Filter weather-appropriate items
  let pool = wardrobe.filter((i) => i.is_active);
  if (weather) {
    const weatherFiltered = pool.filter((i) => isWeatherAppropriate(i, weather));
    if (weatherFiltered.length > 0) {
      pool = weatherFiltered;
      reasons.push(`Filtered for ${Math.round(weather.temp_f)}°F ${weather.condition.toLowerCase()} weather`);
    }
  }

  // Group by category → slot mapping
  const tops = pool.filter((i) => i.category === 'tops');
  const bottoms = pool.filter((i) => i.category === 'bottoms');
  const shoes = pool.filter((i) => i.category === 'shoes');
  const outerwear = pool.filter((i) => i.category === 'outerwear');
  const dresses = pool.filter((i) => i.category === 'dresses');

  const result: SuggestionResult['items'] = [];
  const selectedColors: string[][] = [];
  const usedIds = new Set(excludeIds);

  // Decide: dress or top+bottom
  const useDress = dresses.length > 0 && Math.random() > 0.7;

  if (useDress) {
    const dress = selectBestForSlot(dresses, pool, weather, targetFormality, selectedColors, usedIds);
    if (dress) {
      result.push({ item: dress.item, slot: 'dress', score: dress.score });
      selectedColors.push(getColorNames(dress.item.colors));
      usedIds.add(dress.item.id);
      reasons.push('Suggested a dress for variety');
    }
  } else {
    // Top
    const top = selectBestForSlot(tops, pool, weather, targetFormality, selectedColors, usedIds);
    if (top) {
      result.push({ item: top.item, slot: 'top', score: top.score });
      selectedColors.push(getColorNames(top.item.colors));
      usedIds.add(top.item.id);
    }

    // Bottom
    const bottom = selectBestForSlot(bottoms, pool, weather, targetFormality, selectedColors, usedIds);
    if (bottom) {
      result.push({ item: bottom.item, slot: 'bottom', score: bottom.score });
      selectedColors.push(getColorNames(bottom.item.colors));
      usedIds.add(bottom.item.id);
    }
  }

  // Shoes
  const shoe = selectBestForSlot(shoes, pool, weather, targetFormality, selectedColors, usedIds);
  if (shoe) {
    result.push({ item: shoe.item, slot: 'shoes', score: shoe.score });
    selectedColors.push(getColorNames(shoe.item.colors));
    usedIds.add(shoe.item.id);
  }

  // Outerwear (if needed)
  if (weather && needsOuterwear(weather) && outerwear.length > 0) {
    const outer = selectBestForSlot(outerwear, pool, weather, targetFormality, selectedColors, usedIds);
    if (outer) {
      result.push({ item: outer.item, slot: 'outerwear', score: outer.score });
      reasons.push('Added outerwear for the weather');
    }
  }

  if (occasion) {
    reasons.push(`Styled for ${occasion} occasion`);
  }

  // Confidence based on how many slots we filled
  const expectedSlots = useDress ? 2 : 3; // dress+shoes or top+bottom+shoes
  const confidence = Math.min(1, result.length / expectedSlots);

  if (result.length === 0) {
    reasons.push('Not enough items in wardrobe — add more clothes!');
  }

  return { items: result, confidence, reasons };
}
