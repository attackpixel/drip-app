export interface WeatherData {
  temp_f: number;
  temp_c: number;
  feels_like_f: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  wind_mph: number;
  location_name: string;
}

export interface WeatherCache {
  location_key: string;
  fetched_at: string;
  expires_at: string;
  data: WeatherData;
}

export interface LocationInfo {
  lat: number;
  lng: number;
  name: string;
}

export type TemperatureUnit = 'fahrenheit' | 'celsius';

export function tempDisplay(temp_f: number, unit: TemperatureUnit): string {
  if (unit === 'celsius') {
    return `${Math.round((temp_f - 32) * (5 / 9))}°C`;
  }
  return `${Math.round(temp_f)}°F`;
}

export type TempRange = 'freezing' | 'cold' | 'cool' | 'mild' | 'warm' | 'hot';

export function getTempRange(temp_f: number): TempRange {
  if (temp_f < 32) return 'freezing';
  if (temp_f < 45) return 'cold';
  if (temp_f < 60) return 'cool';
  if (temp_f < 75) return 'mild';
  if (temp_f < 90) return 'warm';
  return 'hot';
}
