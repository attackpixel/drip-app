import { supabase } from './supabase';
import type { Outfit, OutfitInsert, OutfitItem, OutfitWithItems } from '../types';

export const outfitService = {
  async getAll(userId: string): Promise<OutfitWithItems[]> {
    const { data, error } = await supabase
      .from('outfits')
      .select(`
        *,
        items:outfit_items(
          outfit_id,
          clothing_item_id,
          slot,
          clothing_item:clothing_items(*)
        )
      `)
      .eq('user_id', userId)
      .order('worn_on', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async getByDateRange(userId: string, startDate: string, endDate: string): Promise<OutfitWithItems[]> {
    const { data, error } = await supabase
      .from('outfits')
      .select(`
        *,
        items:outfit_items(
          outfit_id,
          clothing_item_id,
          slot,
          clothing_item:clothing_items(*)
        )
      `)
      .eq('user_id', userId)
      .gte('worn_on', startDate)
      .lte('worn_on', endDate)
      .order('worn_on', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<OutfitWithItems | null> {
    const { data, error } = await supabase
      .from('outfits')
      .select(`
        *,
        items:outfit_items(
          outfit_id,
          clothing_item_id,
          slot,
          clothing_item:clothing_items(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(outfit: OutfitInsert, items: Omit<OutfitItem, 'outfit_id'>[]): Promise<OutfitWithItems> {
    const { data: outfitData, error: outfitError } = await supabase
      .from('outfits')
      .insert(outfit)
      .select()
      .single();

    if (outfitError) throw outfitError;

    const outfitItems = items.map((item) => ({
      ...item,
      outfit_id: outfitData.id,
    }));

    const { error: itemsError } = await supabase.from('outfit_items').insert(outfitItems);
    if (itemsError) throw itemsError;

    return (await this.getById(outfitData.id))!;
  },

  async update(id: string, updates: Partial<Outfit>): Promise<Outfit> {
    const { data, error } = await supabase
      .from('outfits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async rate(id: string, rating: number): Promise<void> {
    const { error } = await supabase
      .from('outfits')
      .update({ rating })
      .eq('id', id);

    if (error) throw error;
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const { error } = await supabase
      .from('outfits')
      .update({ is_favorite: isFavorite })
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error: itemsError } = await supabase
      .from('outfit_items')
      .delete()
      .eq('outfit_id', id);

    if (itemsError) throw itemsError;

    const { error } = await supabase.from('outfits').delete().eq('id', id);
    if (error) throw error;
  },

  async getFavorites(userId: string): Promise<OutfitWithItems[]> {
    const { data, error } = await supabase
      .from('outfits')
      .select(`
        *,
        items:outfit_items(
          outfit_id,
          clothing_item_id,
          slot,
          clothing_item:clothing_items(*)
        )
      `)
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .order('worn_on', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },
};
