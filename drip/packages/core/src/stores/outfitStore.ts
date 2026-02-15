import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OutfitWithItems, OutfitInsert, OutfitItem } from '../types';
import { outfitService } from '../services/outfitService';

interface OutfitState {
  outfits: OutfitWithItems[];
  loading: boolean;
  error: string | null;

  fetchOutfits: (userId: string) => Promise<void>;
  fetchByDateRange: (userId: string, start: string, end: string) => Promise<void>;
  createOutfit: (outfit: OutfitInsert, items: Omit<OutfitItem, 'outfit_id'>[]) => Promise<OutfitWithItems>;
  rateOutfit: (id: string, rating: number) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  deleteOutfit: (id: string) => Promise<void>;
}

export const useOutfitStore = create<OutfitState>()(
  persist(
    (set, get) => ({
      outfits: [],
      loading: false,
      error: null,

      fetchOutfits: async (userId) => {
        set({ loading: true, error: null });
        try {
          const outfits = await outfitService.getAll(userId);
          set({ outfits });
        } catch (err) {
          set({ error: (err as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      fetchByDateRange: async (userId, start, end) => {
        set({ loading: true, error: null });
        try {
          const outfits = await outfitService.getByDateRange(userId, start, end);
          set({ outfits });
        } catch (err) {
          set({ error: (err as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      createOutfit: async (outfit, items) => {
        const created = await outfitService.create(outfit, items);
        set((state) => ({ outfits: [created, ...state.outfits] }));
        return created;
      },

      rateOutfit: async (id, rating) => {
        await outfitService.rate(id, rating);
        set((state) => ({
          outfits: state.outfits.map((o) => (o.id === id ? { ...o, rating } : o)),
        }));
      },

      toggleFavorite: async (id) => {
        const outfit = get().outfits.find((o) => o.id === id);
        if (!outfit) return;
        const newVal = !outfit.is_favorite;
        await outfitService.toggleFavorite(id, newVal);
        set((state) => ({
          outfits: state.outfits.map((o) => (o.id === id ? { ...o, is_favorite: newVal } : o)),
        }));
      },

      deleteOutfit: async (id) => {
        await outfitService.delete(id);
        set((state) => ({ outfits: state.outfits.filter((o) => o.id !== id) }));
      },
    }),
    {
      name: 'drip-outfits',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ outfits: state.outfits }),
    }
  )
);
