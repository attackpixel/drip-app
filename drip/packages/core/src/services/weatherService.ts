import { supabase } from './supabase';
import type { WeatherData, LocationInfo } from '../types';

const expoEnv =
  typeof globalThis === 'object' && 'process' in globalThis
    ? (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    : undefined;

const API_KEY_ENV = expoEnv?.EXPO_PUBLIC_OPENWEATHER_API_KEY ?? '';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export const weatherService = {
  async getWeather(location: LocationInfo): Promise<WeatherData> {
    const locationKey = `${location.lat.toFixed(2)},${location.lng.toFixed(2)}`;

    // Check cache first
    const cached = await this.getCached(locationKey);
    if (cached) return cached;

    // Fetch from OpenWeatherMap
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&units=imperial&appid=${API_KEY_ENV}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

    const raw = await res.json();

    const weather: WeatherData = {
      temp_f: raw.main.temp,
      temp_c: Math.round((raw.main.temp - 32) * (5 / 9)),
      feels_like_f: raw.main.feels_like,
      condition: raw.weather[0].main,
      description: raw.weather[0].description,
      icon: raw.weather[0].icon,
      humidity: raw.main.humidity,
      wind_mph: raw.wind.speed,
      location_name: location.name || raw.name,
    };

    // Cache it
    await this.setCache(locationKey, weather);

    return weather;
  },

  async getCached(locationKey: string): Promise<WeatherData | null> {
    try {
      const { data } = await supabase
        .from('weather_cache')
        .select('*')
        .eq('location_key', locationKey)
        .gt('expires_at', new Date().toISOString())
        .single();

      return data?.data ?? null;
    } catch {
      return null;
    }
  },

  async setCache(locationKey: string, weather: WeatherData): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);

    try {
      await supabase.from('weather_cache').upsert(
        {
          location_key: locationKey,
          fetched_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          data: weather,
        },
        { onConflict: 'location_key' }
      );
    } catch {
      // Cache failure is non-critical
    }
  },

  async getLocationFromBrowser(): Promise<LocationInfo> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          // Reverse geocode for name
          try {
            const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY_ENV}`;
            const res = await fetch(url);
            const data = await res.json();
            const name = data[0]?.name ?? 'Current Location';
            resolve({ lat: latitude, lng: longitude, name });
          } catch {
            resolve({ lat: latitude, lng: longitude, name: 'Current Location' });
          }
        },
        (err) => reject(err),
        { enableHighAccuracy: false, timeout: 10000 }
      );
    });
  },

  async searchLocation(query: string): Promise<LocationInfo[]> {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY_ENV}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: { lat: number; lon: number; name: string; state?: string; country: string }) => ({
      lat: item.lat,
      lng: item.lon,
      name: item.state ? `${item.name}, ${item.state}, ${item.country}` : `${item.name}, ${item.country}`,
    }));
  },
};
