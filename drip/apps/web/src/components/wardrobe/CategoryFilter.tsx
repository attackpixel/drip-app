import type { ClothingCategory } from '@drip/core';
import { CATEGORY_LABELS } from '@drip/core';

interface CategoryFilterProps {
  selected: ClothingCategory | 'all';
  onChange: (category: ClothingCategory | 'all') => void;
  counts: Record<string, number>;
}

const allCategories: (ClothingCategory | 'all')[] = [
  'all', 'tops', 'bottoms', 'shoes', 'outerwear', 'accessories', 'dresses', 'activewear',
];

export function CategoryFilter({ selected, onChange, counts }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {allCategories.map((cat) => {
        const label = cat === 'all' ? 'All' : CATEGORY_LABELS[cat];
        const count = cat === 'all'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[cat] ?? 0);

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              selected === cat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
            <span
              className={`text-xs ${
                selected === cat ? 'text-primary-200' : 'text-gray-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
