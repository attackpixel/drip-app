import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Shirt } from 'lucide-react';
import type { ClothingItem, OutfitSlot, Occasion } from '@drip/core';
import { OCCASION_LABELS, useWardrobeStore, useOutfitStore, useAuthStore, useWeatherStore, toISODate } from '@drip/core';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const SLOTS: OutfitSlot[] = ['top', 'bottom', 'shoes', 'outerwear', 'accessory', 'dress', 'layer'];

export function OutfitBuilder() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const items = useWardrobeStore((s) => s.items);
  const createOutfit = useOutfitStore((s) => s.createOutfit);
  const weather = useWeatherStore((s) => s.weather);

  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState<Occasion>('casual');
  const [selectedItems, setSelectedItems] = useState<Map<OutfitSlot, ClothingItem>>(new Map());
  const [pickingSlot, setPickingSlot] = useState<OutfitSlot | null>(null);
  const [saving, setSaving] = useState(false);

  const addItem = (slot: OutfitSlot, item: ClothingItem) => {
    setSelectedItems((prev) => new Map(prev).set(slot, item));
    setPickingSlot(null);
  };

  const removeItem = (slot: OutfitSlot) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      next.delete(slot);
      return next;
    });
  };

  const handleSave = async () => {
    if (!user || selectedItems.size === 0) return;
    setSaving(true);
    try {
      await createOutfit(
        {
          user_id: user.id,
          name: name || null,
          worn_on: toISODate(),
          occasion,
          weather_temp_f: weather?.temp_f ?? null,
          weather_condition: weather?.condition ?? null,
          source: 'manual',
          rating: null,
          is_favorite: false,
          share_image_path: null,
        },
        Array.from(selectedItems.entries()).map(([slot, item]) => ({
          clothing_item_id: item.id,
          slot,
        }))
      );
      navigate('/history');
    } finally {
      setSaving(false);
    }
  };

  // Filter items for slot picker
  const getItemsForSlot = (slot: OutfitSlot): ClothingItem[] => {
    const categoryMap: Partial<Record<OutfitSlot, string>> = {
      top: 'tops',
      bottom: 'bottoms',
      shoes: 'shoes',
      outerwear: 'outerwear',
      accessory: 'accessories',
      dress: 'dresses',
    };
    const cat = categoryMap[slot];
    return cat ? items.filter((i) => i.category === cat) : items;
  };

  return (
    <div className="space-y-4">
      <Input
        label="Outfit Name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Monday Work Fit"
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Occasion</label>
        <select
          value={occasion}
          onChange={(e) => setOccasion(e.target.value as Occasion)}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm"
        >
          {Object.entries(OCCASION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Slots */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Items</label>
        {SLOTS.map((slot) => {
          const item = selectedItems.get(slot);
          return (
            <div key={slot} className="flex items-center gap-3 rounded-xl border border-gray-200 p-2">
              {item ? (
                <>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                      <Shirt size={16} className="text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs uppercase text-gray-400">{slot}</p>
                  </div>
                  <button type="button" onClick={() => removeItem(slot)} className="text-gray-400 hover:text-red-500">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setPickingSlot(slot)}
                  className="flex flex-1 items-center gap-2 py-1 text-sm text-gray-400 hover:text-primary-500"
                >
                  <Plus size={16} />
                  Add {slot}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Slot picker modal */}
      {pickingSlot && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setPickingSlot(null)}>
          <div
            className="max-h-[60vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Pick {pickingSlot}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {getItemsForSlot(pickingSlot).map((item) => (
                <button
                  key={item.id}
                  onClick={() => addItem(pickingSlot, item)}
                  className="overflow-hidden rounded-lg border border-gray-200 hover:border-primary-400"
                >
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="flex aspect-square items-center justify-center bg-gray-100">
                      <Shirt size={20} className="text-gray-300" />
                    </div>
                  )}
                  <p className="truncate px-1 py-0.5 text-xs">{item.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Button onClick={handleSave} loading={saving} disabled={selectedItems.size === 0} className="w-full">
        Log Outfit
      </Button>
    </div>
  );
}
