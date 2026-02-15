import type { ClothingItem, WeatherData, TempRange } from '../types';
import { getTempRange } from '../types/weather';

const WARMTH_BY_TEMP: Record<TempRange, { min: number; max: number }> = {
  freezing: { min: 4, max: 5 },
  cold: { min: 3, max: 5 },
  cool: { min: 2, max: 4 },
  mild: { min: 1, max: 3 },
  warm: { min: 1, max: 2 },
  hot: { min: 1, max: 1 },
};

export function isWeatherAppropriate(item: ClothingItem, weather: WeatherData): boolean {
  const range = getTempRange(weather.temp_f);
  const { min, max } = WARMTH_BY_TEMP[range];
  return item.warmth_level >= min && item.warmth_level <= max;
}

export function weatherFitScore(item: ClothingItem, weather: WeatherData): number {
  const range = getTempRange(weather.temp_f);
  const { min, max } = WARMTH_BY_TEMP[range];
  const mid = (min + max) / 2;
  const distance = Math.abs(item.warmth_level - mid);
  const maxDistance = (max - min) / 2 + 1;
  return Math.max(0, 30 - Math.round((distance / maxDistance) * 30));
}

export function needsOuterwear(weather: WeatherData): boolean {
  return weather.temp_f < 60 || weather.condition === 'Rain' || weather.condition === 'Snow';
}

export function needsAccessories(weather: WeatherData): string[] {
  const accessories: string[] = [];
  if (weather.temp_f < 40) accessories.push('Scarf', 'Hat');
  if (weather.condition === 'Rain') accessories.push('Umbrella');
  if (weather.condition === 'Clear' && weather.temp_f > 70) accessories.push('Sunglasses');
  return accessories;
}
