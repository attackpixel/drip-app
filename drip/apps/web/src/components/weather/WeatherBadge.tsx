import { useWeatherStore, tempDisplay } from '@drip/core';
import { Cloud, Sun, CloudRain, Snowflake, Wind, CloudSun, MapPin } from 'lucide-react';

const weatherIcons: Record<string, typeof Sun> = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudRain,
  Snow: Snowflake,
  Wind: Wind,
};

export function WeatherBadge() {
  const weather = useWeatherStore((s) => s.weather);
  const unit = useWeatherStore((s) => s.temperatureUnit);
  const loading = useWeatherStore((s) => s.loading);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
        <span className="text-blue-600">Loading weather...</span>
      </div>
    );
  }

  if (!weather) return null;

  const Icon = weatherIcons[weather.condition] ?? CloudSun;

  return (
    <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2">
      <Icon size={20} className="text-blue-500" />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-blue-800">
          {tempDisplay(weather.temp_f, unit)}
        </span>
        <span className="text-xs text-blue-600">
          {weather.description} in {weather.location_name}
        </span>
      </div>
    </div>
  );
}
