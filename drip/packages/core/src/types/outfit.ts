export type OutfitSlot = 'top' | 'bottom' | 'shoes' | 'outerwear' | 'accessory' | 'dress' | 'layer';

export type OutfitSource = 'suggestion' | 'manual';

export type Occasion = 'casual' | 'work' | 'formal' | 'date' | 'workout' | 'outdoor' | 'travel' | 'other';

export interface Outfit {
  id: string;
  user_id: string;
  name: string | null;
  worn_on: string;
  occasion: Occasion | null;
  weather_temp_f: number | null;
  weather_condition: string | null;
  source: OutfitSource;
  rating: number | null; // 1-5
  is_favorite: boolean;
  share_image_path: string | null;
  created_at: string;
}

export interface OutfitItem {
  outfit_id: string;
  clothing_item_id: string;
  slot: OutfitSlot;
}

export interface OutfitWithItems extends Outfit {
  items: (OutfitItem & { clothing_item?: import('./clothing').ClothingItem })[];
}

export type OutfitInsert = Omit<Outfit, 'id' | 'created_at'>;

export const OCCASION_LABELS: Record<Occasion, string> = {
  casual: 'Casual',
  work: 'Work',
  formal: 'Formal',
  date: 'Date Night',
  workout: 'Workout',
  outdoor: 'Outdoor',
  travel: 'Travel',
  other: 'Other',
};

export const OCCASION_FORMALITY: Record<Occasion, number> = {
  casual: 1,
  workout: 1,
  outdoor: 2,
  travel: 2,
  work: 3,
  date: 3,
  formal: 5,
  other: 2,
};
