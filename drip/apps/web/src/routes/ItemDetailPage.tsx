import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Edit3, Shirt } from 'lucide-react';
import {
  useWardrobeStore, wardrobeService,
  getColorHex, formatDate, daysAgo,
  CATEGORY_LABELS,
  type ClothingItem,
} from '@drip/core';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const items = useWardrobeStore((s) => s.items);
  const deleteItem = useWardrobeStore((s) => s.deleteItem);

  const [item, setItem] = useState<ClothingItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const found = items.find((i) => i.id === id);
    if (found) {
      setItem(found);
    } else if (id) {
      wardrobeService.getById(id).then(setItem);
    }
  }, [id, items]);

  const handleDelete = async () => {
    if (!item || !confirm('Delete this item from your wardrobe?')) return;
    setDeleting(true);
    try {
      await deleteItem(item.id);
      navigate('/wardrobe');
    } finally {
      setDeleting(false);
    }
  };

  if (!item) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const warmthLabels = ['Very Light', 'Light', 'Medium', 'Warm', 'Very Warm'];
  const formalityLabels = ['Very Casual', 'Casual', 'Smart Casual', 'Formal', 'Very Formal'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-2">
          <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>

      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full rounded-2xl object-cover"
          style={{ maxHeight: '400px' }}
        />
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-gray-100">
          <Shirt size={64} className="text-gray-300" />
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-gray-900">{item.name}</h1>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="primary">{CATEGORY_LABELS[item.category]}</Badge>
          {item.subcategory && <Badge>{item.subcategory}</Badge>}
          {item.brand && <span className="text-sm text-gray-500">{item.brand}</span>}
        </div>
      </div>

      {/* Colors */}
      <div className="flex items-center gap-2">
        {item.colors.map((color) => (
          <div key={color} className="flex items-center gap-1.5">
            <span
              className="h-5 w-5 rounded-full border border-gray-200"
              style={{ backgroundColor: getColorHex(color) }}
            />
            <span className="text-sm capitalize text-gray-600">{color}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <Card>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{item.times_worn}</p>
            <p className="text-xs text-gray-500">Times Worn</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {item.last_worn_at ? `${daysAgo(item.last_worn_at)}d` : '—'}
            </p>
            <p className="text-xs text-gray-500">Days Since Worn</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">{warmthLabels[item.warmth_level - 1]}</p>
            <p className="text-xs text-gray-500">Warmth</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">{formalityLabels[item.formality_level - 1]}</p>
            <p className="text-xs text-gray-500">Formality</p>
          </div>
        </div>
      </Card>

      {/* Cost per wear */}
      {item.purchase_price && item.purchase_price > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Cost Per Wear</span>
            <span className="text-lg font-bold text-gray-900">
              ${item.times_worn > 0 ? (item.purchase_price / item.times_worn).toFixed(2) : item.purchase_price.toFixed(2)}
            </span>
          </div>
        </Card>
      )}

      {/* Seasons & Weather */}
      {item.seasons.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.seasons.map((s) => (
            <Badge key={s} variant="success">{s}</Badge>
          ))}
          {item.weather_suitability.map((w) => (
            <Badge key={w}>{w}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}
