import { supabase } from './supabase';
import type { ClothingItem, ClothingItemInsert, ClothingItemUpdate, ClothingCategory } from '../types';

export const wardrobeService = {
  async getAll(userId: string): Promise<ClothingItem[]> {
    const { data, error } = await supabase
      .from('clothing_items')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(attachImageUrl);
  },

  async getByCategory(userId: string, category: ClothingCategory): Promise<ClothingItem[]> {
    const { data, error } = await supabase
      .from('clothing_items')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(attachImageUrl);
  },

  async getById(id: string): Promise<ClothingItem | null> {
    const { data, error } = await supabase
      .from('clothing_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? attachImageUrl(data) : null;
  },

  async create(item: ClothingItemInsert): Promise<ClothingItem> {
    const { data, error } = await supabase
      .from('clothing_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return attachImageUrl(data);
  },

  async update(id: string, updates: ClothingItemUpdate): Promise<ClothingItem> {
    const { data, error } = await supabase
      .from('clothing_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return attachImageUrl(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clothing_items')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async markWorn(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_times_worn', { item_id: id });
    if (error) {
      // Fallback if RPC doesn't exist yet
      const item = await this.getById(id);
      if (item) {
        await this.update(id, {
          times_worn: item.times_worn + 1,
          last_worn_at: new Date().toISOString(),
        });
      }
    }
  },

  async uploadPhoto(userId: string, file: File | Blob, fileName: string): Promise<string> {
    const path = `${userId}/${Date.now()}-${fileName}`;
    const { error } = await supabase.storage
      .from('clothing-photos')
      .upload(path, file, { contentType: 'image/webp', upsert: false });

    if (error) throw error;
    return path;
  },

  async deletePhoto(path: string): Promise<void> {
    const { error } = await supabase.storage.from('clothing-photos').remove([path]);
    if (error) throw error;
  },
};

function attachImageUrl(item: ClothingItem): ClothingItem {
  if (item.image_path) {
    const { data } = supabase.storage.from('clothing-photos').getPublicUrl(item.image_path);
    return { ...item, image_url: data.publicUrl };
  }
  return item;
}
