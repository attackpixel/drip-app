-- Drip: Smart Wardrobe App - Database Schema

-- Profiles (extends Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  location_lat double precision,
  location_lng double precision,
  location_name text,
  temperature_unit text default 'fahrenheit' check (temperature_unit in ('fahrenheit', 'celsius')),
  google_calendar_token text,
  style_preference text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Clothing Items
create table if not exists public.clothing_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  category text not null check (category in ('tops','bottoms','shoes','outerwear','accessories','dresses','activewear')),
  subcategory text,
  colors text[] default '{}',
  brand text,
  purchase_price numeric(10,2),
  image_path text,
  warmth_level integer default 3 check (warmth_level between 1 and 5),
  formality_level integer default 2 check (formality_level between 1 and 5),
  weather_suitability text[] default '{}',
  seasons text[] default '{}',
  is_active boolean default true,
  times_worn integer default 0,
  last_worn_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_clothing_items_user on public.clothing_items(user_id);
create index idx_clothing_items_category on public.clothing_items(user_id, category);

-- Outfits
create table if not exists public.outfits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text,
  worn_on date not null default current_date,
  occasion text,
  weather_temp_f numeric(5,1),
  weather_condition text,
  source text default 'manual' check (source in ('suggestion','manual')),
  rating integer check (rating is null or rating between 1 and 5),
  is_favorite boolean default false,
  share_image_path text,
  created_at timestamptz default now()
);

create index idx_outfits_user on public.outfits(user_id);
create index idx_outfits_date on public.outfits(user_id, worn_on);

-- Outfit Items (junction table)
create table if not exists public.outfit_items (
  outfit_id uuid references public.outfits on delete cascade not null,
  clothing_item_id uuid references public.clothing_items on delete cascade not null,
  slot text not null check (slot in ('top','bottom','shoes','outerwear','accessory','dress','layer')),
  primary key (outfit_id, clothing_item_id)
);

-- Weather Cache
create table if not exists public.weather_cache (
  location_key text primary key,
  fetched_at timestamptz not null,
  expires_at timestamptz not null,
  data jsonb not null
);

-- RPC: Increment times worn
create or replace function public.increment_times_worn(item_id uuid)
returns void as $$
begin
  update public.clothing_items
  set times_worn = times_worn + 1,
      last_worn_at = now(),
      updated_at = now()
  where id = item_id;
end;
$$ language plpgsql security definer;

-- Row Level Security

alter table public.profiles enable row level security;
alter table public.clothing_items enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;
alter table public.weather_cache enable row level security;

-- Profiles: users can only read/update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Clothing Items: full CRUD on own items
create policy "Users can view own items" on public.clothing_items
  for select using (auth.uid() = user_id);
create policy "Users can insert own items" on public.clothing_items
  for insert with check (auth.uid() = user_id);
create policy "Users can update own items" on public.clothing_items
  for update using (auth.uid() = user_id);
create policy "Users can delete own items" on public.clothing_items
  for delete using (auth.uid() = user_id);

-- Outfits: full CRUD on own outfits
create policy "Users can view own outfits" on public.outfits
  for select using (auth.uid() = user_id);
create policy "Users can insert own outfits" on public.outfits
  for insert with check (auth.uid() = user_id);
create policy "Users can update own outfits" on public.outfits
  for update using (auth.uid() = user_id);
create policy "Users can delete own outfits" on public.outfits
  for delete using (auth.uid() = user_id);

-- Outfit Items: access if user owns the outfit
create policy "Users can view own outfit items" on public.outfit_items
  for select using (
    exists (select 1 from public.outfits where id = outfit_id and user_id = auth.uid())
  );
create policy "Users can insert own outfit items" on public.outfit_items
  for insert with check (
    exists (select 1 from public.outfits where id = outfit_id and user_id = auth.uid())
  );
create policy "Users can delete own outfit items" on public.outfit_items
  for delete using (
    exists (select 1 from public.outfits where id = outfit_id and user_id = auth.uid())
  );

-- Weather Cache: readable/writable by all authenticated users (shared cache)
create policy "Authenticated users can read weather cache" on public.weather_cache
  for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert weather cache" on public.weather_cache
  for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update weather cache" on public.weather_cache
  for update using (auth.role() = 'authenticated');

-- Storage buckets (run in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('clothing-photos', 'clothing-photos', false);
-- insert into storage.buckets (id, name, public) values ('share-cards', 'share-cards', true);
