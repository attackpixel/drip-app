export type ClothingCategory =
  | 'tops'
  | 'jersey'
  | 'shorts'
  | 'trousers'
  | 'bottoms'
  | 'knitwear'
  | 'jumper'
  | 'outerwear'
  | 'puffer'
  | 'shoes'
  | 'accessories'
  | 'belts'
  | 'dresses'
  | 'activewear';

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export type WeatherSuitability = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy' | 'hot' | 'cold' | 'mild';

export interface ColorOption {
  name: string;
  hex: string;
}

export interface ClothingItem {
  id: number;
  user_id: string;
  name: string;
  category: ClothingCategory;
  subcategory: string | null;
  colors: ColorOption[];
  brand: string | null;
  purchase_price: number | null;
  image_path: string | null;
  image_url?: string;
  warmth_level: number;
  formality_level: number;
  weather_suitability: WeatherSuitability[];
  seasons: Season[];
  is_active: boolean;
  times_worn: number;
  last_worn_at: string | null;
  created_at: string;
}

export type ClothingItemInsert = Partial<ClothingItem>;

export type ClothingItemUpdate = Partial<ClothingItem>;

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  tops: 'Tops',
  jersey: 'Jersey',
  shorts: 'Shorts',
  trousers: 'Trousers',
  bottoms: 'Bottoms',
  knitwear: 'Knitwear',
  jumper: 'Jumper',
  outerwear: 'Outerwear',
  puffer: 'Puffer',
  shoes: 'Shoes',
  accessories: 'Accessories',
  belts: 'Belts',
  dresses: 'Dresses',
  activewear: 'Activewear',
};

export const SUBCATEGORIES: Record<ClothingCategory, string[]> = {
  tops: ['T-Shirt', 'Button-Up', 'Polo', 'Tank Top', 'Blouse', 'Henley'],
  jersey: ['Sports Jersey', 'Fan Jersey', 'Retro Jersey'],
  shorts: ['Casual Shorts', 'Denim Shorts', 'Swim Shorts', 'Chino Shorts'],
  trousers: ['Jeans', 'Chinos', 'Dress Pants', 'Cargo Pants'],
  bottoms: ['Jeans', 'Chinos', 'Shorts', 'Sweatpants', 'Dress Pants', 'Skirt', 'Leggings'],
  knitwear: ['Cardigan', 'Vest', 'Sweater', 'Tank Top'],
  jumper: ['Pullover', 'Hoodie', 'Sweatshirt', 'Fleece'],
  outerwear: ['Jacket', 'Coat', 'Blazer', 'Vest', 'Windbreaker', 'Parka'],
  puffer: ['Light Puffer', 'Heavy Puffer', 'Vest'],
  shoes: ['Sneakers', 'Boots', 'Sandals', 'Dress Shoes', 'Loafers', 'Athletic', 'Heels'],
  accessories: ['Hat', 'Scarf', 'Watch', 'Jewelry', 'Sunglasses', 'Bag'],
  belts: ['Leather Belt', 'Canvas Belt', 'Dress Belt'],
  dresses: ['Casual Dress', 'Formal Dress', 'Sundress', 'Maxi Dress', 'Mini Dress'],
  activewear: ['Sports Top', 'Sports Bra', 'Gym Shorts', 'Leggings', 'Track Pants', 'Joggers'],
};

export const COLOR_OPTIONS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Green', hex: '#008000' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Cream', hex: '#FFFDD0' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Coral', hex: '#FF7F50' },
  { name: 'Mint', hex: '#98FF98' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Khaki', hex: '#C3B091' },
  { name: 'Maroon', hex: '#800000' },
];
