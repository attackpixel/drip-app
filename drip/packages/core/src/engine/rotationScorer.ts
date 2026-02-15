import type { ClothingItem } from '../types';

/**
 * Score based on how recently an item was worn.
 * Items not worn recently get higher scores (0-40 range).
 */
export function recencyScore(item: ClothingItem): number {
  if (!item.last_worn_at) return 40; // Never worn = max score

  const daysSinceWorn = Math.floor(
    (Date.now() - new Date(item.last_worn_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceWorn === 0) return 0;
  if (daysSinceWorn === 1) return 5;
  if (daysSinceWorn <= 3) return 15;
  if (daysSinceWorn <= 7) return 25;
  if (daysSinceWorn <= 14) return 35;
  return 40;
}

/**
 * Score based on variety — items worn fewer times overall get a small bonus.
 * Range: 0-10.
 */
export function varietyScore(item: ClothingItem, allItems: ClothingItem[]): number {
  if (allItems.length === 0) return 5;

  const maxWorn = Math.max(...allItems.map((i) => i.times_worn), 1);
  const ratio = item.times_worn / maxWorn;

  return Math.round((1 - ratio) * 10);
}
