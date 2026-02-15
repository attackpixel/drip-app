import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ClothingItem, ClothingCategory } from '../types';

interface WardrobeState {
  items: ClothingItem[];
  loading: boolean;
  error: string | null;
  selectedCategory: ClothingCategory | 'all';

  fetchItems: (userId: string) => Promise<void>;
  addItem: (item: Partial<ClothingItem>) => Promise<ClothingItem>;
  updateItem: (item: ClothingItem) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  markWorn: (id: number) => Promise<void>;
  setCategory: (category: ClothingCategory | 'all') => void;
  getFilteredItems: () => ClothingItem[];
}

export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,
      selectedCategory: 'all',

      fetchItems: async () => {
        set({ loading: true, error: null });
        // Offline mode - items already in store from localStorage
        set({ loading: false });
      },

      addItem: async (item) => {
        const newItem: ClothingItem = {
          id: Date.now(),
          user_id: item.user_id || 'local',
          name: item.name || '',
          category: item.category || 'tops',
          subcategory: item.subcategory || null,
          colors: item.colors || [],
          brand: item.brand || null,
          purchase_price: item.purchase_price || null,
          image_path: item.image_path || null,
          image_url: item.image_path || null,
          warmth_level: item.warmth_level || 3,
          formality_level: item.formality_level || 2,
          weather_suitability: item.weather_suitability || [],
          seasons: item.seasons || [],
          is_active: true,
          times_worn: 0,
          last_worn_at: null,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ items: [newItem, ...state.items] }));
        return newItem;
      },

      updateItem: async (item) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === item.id ? { ...i, ...item } : i)),
        }));
      },

      deleteItem: async (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },

      markWorn: async (id) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, times_worn: (i.times_worn || 0) + 1, last_worn_at: new Date().toISOString() }
              : i
          ),
        }));
      },

      setCategory: (category) => set({ selectedCategory: category }),

      getFilteredItems: () => {
        const { items, selectedCategory } = get();
        if (selectedCategory === 'all') return items;
        return items.filter((i) => i.category === selectedCategory);
      },
    }),
    {
      name: 'drip-wardrobe',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
