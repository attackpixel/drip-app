import { useNavigate } from 'react-router-dom';
import type { ClothingItem } from '@drip/core';
import { getColorHex, daysAgo } from '@drip/core';
import { Shirt } from 'lucide-react';

interface ClothingGridProps {
  items: ClothingItem[];
}

export function ClothingGrid({ items }: ClothingGridProps) {
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => navigate(`/wardrobe/${item.id}`)}
          className="group overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition-shadow hover:shadow-md"
        >
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center bg-gray-100">
              <Shirt size={40} className="text-gray-300" />
            </div>
          )}
          <div className="p-2">
            <p className="truncate text-sm font-medium text-gray-800">{item.name}</p>
            <div className="mt-1 flex items-center gap-1">
              {item.colors.slice(0, 3).map((color) => (
                <span
                  key={color}
                  className="h-3 w-3 rounded-full border border-gray-200"
                  style={{ backgroundColor: getColorHex(color) }}
                />
              ))}
              <span className="ml-auto text-xs text-gray-400">
                {item.times_worn}x worn
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
