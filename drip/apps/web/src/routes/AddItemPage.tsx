import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  useAuthStore, useWardrobeStore, wardrobeService,
  type ClothingCategory, type Season, type WeatherSuitability,
  CATEGORY_LABELS, SUBCATEGORIES,
} from '@drip/core';
import { PhotoUploader } from '@/components/wardrobe/PhotoUploader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/Slider';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Card } from '@/components/ui/Card';

const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter'];
const WEATHER_OPTIONS: WeatherSuitability[] = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'hot', 'cold', 'mild'];

export function AddItemPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const addItem = useWardrobeStore((s) => s.addItem);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('tops');
  const [subcategory, setSubcategory] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [warmth, setWarmth] = useState(3);
  const [formality, setFormality] = useState(2);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [weatherSuit, setWeatherSuit] = useState<WeatherSuitability[]>([]);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [saving, setSaving] = useState(false);

  const toggleSeason = (s: Season) => {
    setSeasons((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const toggleWeather = (w: WeatherSuitability) => {
    setWeatherSuit((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || colors.length === 0) return;

    setSaving(true);
    try {
      let imagePath: string | null = null;
      if (photo) {
        imagePath = await wardrobeService.uploadPhoto(user.id, photo, `${name.replace(/\s+/g, '-')}.webp`);
      }

      await addItem({
        user_id: user.id,
        name,
        category,
        subcategory: subcategory || null,
        colors,
        brand: brand || null,
        purchase_price: price ? parseFloat(price) : null,
        image_path: imagePath,
        warmth_level: warmth,
        formality_level: formality,
        weather_suitability: weatherSuit,
        seasons,
        is_active: true,
        times_worn: 0,
        last_worn_at: null,
      });

      navigate('/wardrobe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Add Item</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PhotoUploader onPhotoReady={(blob) => setPhoto(blob)} onClear={() => setPhoto(null)} />

        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Blue Oxford Shirt"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as ClothingCategory);
                setSubcategory('');
              }}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm"
            >
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Subcategory</label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm"
            >
              <option value="">Select...</option>
              {SUBCATEGORIES[category].map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        <ColorPicker selected={colors} onChange={setColors} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Optional" />
          <Input label="Price ($)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Optional" />
        </div>

        <Slider
          label="Warmth Level"
          value={warmth}
          onChange={setWarmth}
          labels={['Very Light', 'Light', 'Medium', 'Warm', 'Very Warm']}
        />

        <Slider
          label="Formality Level"
          value={formality}
          onChange={setFormality}
          labels={['Very Casual', 'Casual', 'Smart Casual', 'Formal', 'Very Formal']}
        />

        {/* Seasons */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Seasons</label>
          <div className="flex gap-2">
            {SEASONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSeason(s)}
                className={`rounded-full px-3 py-1 text-sm capitalize ${
                  seasons.includes(s)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Weather suitability */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Weather Suitability</label>
          <div className="flex flex-wrap gap-2">
            {WEATHER_OPTIONS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => toggleWeather(w)}
                className={`rounded-full px-3 py-1 text-sm capitalize ${
                  weatherSuit.includes(w)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" loading={saving} className="w-full">
          Add to Wardrobe
        </Button>
      </form>
    </div>
  );
}
