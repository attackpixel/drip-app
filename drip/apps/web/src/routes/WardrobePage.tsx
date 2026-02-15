import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Shirt } from 'lucide-react';
import { useAuthStore, useWardrobeStore, type ClothingCategory } from '@drip/core';
import { ClothingGrid } from '@/components/wardrobe/ClothingGrid';
import { CategoryFilter } from '@/components/wardrobe/CategoryFilter';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export function WardrobePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { items, loading, selectedCategory, fetchItems, setCategory, getFilteredItems } = useWardrobeStore();

  useEffect(() => {
    if (user) fetchItems(user.id);
  }, [user, fetchItems]);

  const filtered = getFilteredItems();

  // Count items by category
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item.category] = (counts[item.category] ?? 0) + 1;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Wardrobe</h1>
        <Button size="sm" onClick={() => navigate('/wardrobe/add')}>
          <Plus size={14} />
          Add
        </Button>
      </div>

      {items.length > 0 ? (
        <>
          <CategoryFilter
            selected={selectedCategory}
            onChange={(cat) => setCategory(cat)}
            counts={counts}
          />
          <ClothingGrid items={filtered} />
        </>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <EmptyState
          icon={<Shirt size={48} />}
          title="No clothes yet"
          description="Start building your digital wardrobe by adding your first item."
          action={
            <Button onClick={() => navigate('/wardrobe/add')}>
              <Plus size={16} />
              Add First Item
            </Button>
          }
        />
      )}
    </div>
  );
}
