import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WeatherData, LocationInfo, TemperatureUnit } from '../types';
import { weatherService } from '../services/weatherService';

interface WeatherState {
  weather: WeatherData | null;
  location: LocationInfo | null;
  temperatureUnit: TemperatureUnit;
  loading: boolean;
  error: string | null;

  fetchWeather: () => Promise<void>;
  setLocation: (location: LocationInfo) => void;
  detectLocation: () => Promise<void>;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
}

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set, get) => ({
      weather: null,
      location: null,
      temperatureUnit: 'fahrenheit',
      loading: false,
      error: null,

      fetchWeather: async () => {
        const { location } = get();
        if (!location) return;

        set({ loading: true, error: null });
        try {
          const weather = await weatherService.getWeather(location);
          set({ weather });
        } catch (err) {
          set({ error: (err as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      setLocation: (location) => {
        set({ location });
        get().fetchWeather();
      },

      detectLocation: async () => {
        set({ loading: true, error: null });
        try {
          const location = await weatherService.getLocationFromBrowser();
          set({ location });
          await get().fetchWeather();
        } catch (err) {
          set({ error: (err as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
    }),
    {
      name: 'drip-weather',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        location: state.location,
        temperatureUnit: state.temperatureUnit,
        weather: state.weather,
      }),
    }
  )
);
