import type { OutfitWithItems } from '@drip/core';
import { formatDate, getColorHex } from '@drip/core';
import { Heart, Shirt } from 'lucide-react';
import { StarRating } from '../ui/StarRating';
import { Badge } from '../ui/Badge';

interface OutfitCardProps {
  outfit: OutfitWithItems;
  onToggleFavorite?: () => void;
  onRate?: (rating: number) => void;
  onClick?: () => void;
}

export function OutfitCard({ outfit, onToggleFavorite, onRate, onClick }: OutfitCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
    >
      {/* Item thumbnails */}
      <div className="flex gap-1 p-2">
        {outfit.items.slice(0, 4).map((oi) => (
          <div key={oi.clothing_item_id} className="flex-1">
            {oi.clothing_item?.image_url ? (
              <img
                src={oi.clothing_item.image_url}
                alt={oi.clothing_item.name ?? ''}
                className="aspect-square w-full rounded-lg object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
                <Shirt size={16} className="text-gray-300" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{formatDate(outfit.worn_on)}</span>
          {outfit.occasion && <Badge>{outfit.occasion}</Badge>}
        </div>

        {outfit.name && (
          <p className="mt-1 text-sm font-medium text-gray-800">{outfit.name}</p>
        )}

        <div className="mt-2 flex items-center justify-between">
          <StarRating
            value={outfit.rating ?? 0}
            onChange={onRate}
            size={14}
            readonly={!onRate}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}
            className="text-gray-300 hover:text-red-400"
          >
            <Heart
              size={16}
              className={outfit.is_favorite ? 'fill-red-400 text-red-400' : ''}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
