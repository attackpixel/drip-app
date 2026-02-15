import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus } from 'lucide-react';
import {
  useAuthStore, useWardrobeStore, useWeatherStore, useOutfitStore,
  generateSuggestion, toISODate,
  type SuggestionResult,
} from '@drip/core';
import { WeatherBadge } from '@/components/weather/WeatherBadge';
import { OutfitSuggestionCard } from '@/components/outfit/OutfitSuggestionCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const items = useWardrobeStore((s) => s.items);
  const fetchItems = useWardrobeStore((s) => s.fetchItems);
  const markWorn = useWardrobeStore((s) => s.markWorn);
  const weather = useWeatherStore((s) => s.weather);
  const location = useWeatherStore((s) => s.location);
  const detectLocation = useWeatherStore((s) => s.detectLocation);
  const fetchWeather = useWeatherStore((s) => s.fetchWeather);
  const createOutfit = useOutfitStore((s) => s.createOutfit);

  const [suggestion, setSuggestion] = useState<SuggestionResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchItems(user.id);
    }
  }, [user, fetchItems]);

  useEffect(() => {
    if (location) fetchWeather();
  }, [location, fetchWeather]);

  const generateNew = useCallback(() => {
    const result = generateSuggestion(items, {
      weather,
      excludeItemIds: suggestion?.items.map((i) => i.item.id),
    });
    setSuggestion(result);
  }, [items, weather, suggestion]);

  useEffect(() => {
    if (items.length > 0 && !suggestion) {
      generateNew();
    }
  }, [items, suggestion, generateNew]);

  const handleWearThis = async () => {
    if (!user || !suggestion) return;
    setLoading(true);
    try {
      await createOutfit(
        {
          user_id: user.id,
          name: null,
          worn_on: toISODate(),
          occasion: null,
          weather_temp_f: weather?.temp_f ?? null,
          weather_condition: weather?.condition ?? null,
          source: 'suggestion',
          rating: null,
          is_favorite: false,
          share_image_path: null,
        },
        suggestion.items.map((i) => ({
          clothing_item_id: i.item.id,
          slot: i.slot,
        }))
      );

      // Mark items as worn
      for (const i of suggestion.items) {
        await markWorn(i.item.id);
      }

      generateNew();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Hey{profile?.display_name ? `, ${profile.display_name}` : ''}
          </h1>
          <p className="text-sm text-gray-500">Here's your outfit for today</p>
        </div>
      </div>

      {/* Weather */}
      {location ? (
        <WeatherBadge />
      ) : (
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Set your location</p>
            <p className="text-xs text-gray-500">For weather-based suggestions</p>
          </div>
          <Button size="sm" variant="secondary" onClick={detectLocation}>
            <MapPin size={14} />
            Detect
          </Button>
        </Card>
      )}

      {/* Suggestion */}
      {items.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-gray-500">Your wardrobe is empty!</p>
          <Button size="sm" className="mt-3" onClick={() => navigate('/wardrobe/add')}>
            <Plus size={14} />
            Add your first item
          </Button>
        </Card>
      ) : (
        suggestion && (
          <OutfitSuggestionCard
            suggestion={suggestion}
            onWearThis={handleWearThis}
            onShuffle={generateNew}
            loading={loading}
          />
        )
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => navigate('/wardrobe/add')} className="w-full">
          <Plus size={16} />
          Add Clothes
        </Button>
        <Button variant="secondary" onClick={() => navigate('/outfit/new')} className="w-full">
          <Plus size={16} />
          Build Outfit
        </Button>
      </div>
    </div>
  );
}
