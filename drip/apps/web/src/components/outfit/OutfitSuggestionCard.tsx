import { useState } from 'react';
import { Shuffle, Check, Shirt, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { SuggestionResult } from '@drip/core';
import { getColorHex } from '@drip/core';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface OutfitSuggestionCardProps {
  suggestion: SuggestionResult;
  onWearThis: () => void;
  onShuffle: () => void;
  loading?: boolean;
}

export function OutfitSuggestionCard({
  suggestion,
  onWearThis,
  onShuffle,
  loading,
}: OutfitSuggestionCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (suggestion.items.length === 0) {
    return (
      <Card className="text-center">
        <Sparkles size={32} className="mx-auto text-gray-300" />
        <p className="mt-2 text-sm text-gray-500">
          Add more items to your wardrobe to get outfit suggestions!
        </p>
      </Card>
    );
  }

  return (
    <Card padding={false}>
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Today's Outfit</h3>
          <div className="flex items-center gap-1">
            <div
              className="h-2 w-16 overflow-hidden rounded-full bg-gray-200"
              title={`${Math.round(suggestion.confidence * 100)}% confidence`}
            >
              <div
                className="h-full rounded-full bg-primary-500 transition-all"
                style={{ width: `${suggestion.confidence * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Outfit items */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {suggestion.items.map(({ item, slot }) => (
            <div key={item.id} className="flex shrink-0 flex-col items-center gap-1">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100">
                  <Shirt size={24} className="text-gray-300" />
                </div>
              )}
              <span className="max-w-[96px] truncate text-xs font-medium text-gray-700">
                {item.name}
              </span>
              <span className="text-[10px] uppercase text-gray-400">{slot}</span>
              <div className="flex gap-0.5">
                {item.colors.slice(0, 3).map((c) => (
                  <span
                    key={c}
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: getColorHex(c) }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Reasons */}
        {suggestion.reasons.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex w-full items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Why this outfit?
          </button>
        )}
        {expanded && (
          <ul className="mt-1 space-y-0.5">
            {suggestion.reasons.map((reason, i) => (
              <li key={i} className="text-xs text-gray-500">
                {reason}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="flex border-t border-gray-100">
        <Button
          variant="ghost"
          onClick={onShuffle}
          disabled={loading}
          className="flex-1 rounded-none rounded-bl-2xl"
        >
          <Shuffle size={16} />
          Shuffle
        </Button>
        <div className="w-px bg-gray-100" />
        <Button
          variant="ghost"
          onClick={onWearThis}
          disabled={loading}
          className="flex-1 rounded-none rounded-br-2xl text-primary-600"
        >
          <Check size={16} />
          Wear This
        </Button>
      </div>
    </Card>
  );
}
