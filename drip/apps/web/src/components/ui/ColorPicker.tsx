import { COLOR_OPTIONS, getColorHex, getContrastColor } from '@drip/core';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  selected: string[];
  onChange: (colors: string[]) => void;
}

export function ColorPicker({ selected, onChange }: ColorPickerProps) {
  const toggle = (color: string) => {
    if (selected.includes(color)) {
      onChange(selected.filter((c) => c !== color));
    } else {
      onChange([...selected, color]);
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">Colors</label>
      <div className="flex flex-wrap gap-2">
        {COLOR_OPTIONS.map((color) => {
          const hex = getColorHex(color);
          const isSelected = selected.includes(color);
          const contrast = getContrastColor(hex);
          return (
            <button
              key={color}
              type="button"
              onClick={() => toggle(color)}
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform ${
                isSelected ? 'scale-110 border-primary-500' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: hex }}
              title={color}
            >
              {isSelected && <Check size={14} color={contrast} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
