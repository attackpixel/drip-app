import { createClient } from '@supabase/supabase-js';

const expoEnv =
  typeof globalThis === 'object' && 'process' in globalThis
    ? (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    : undefined;

const supabaseUrl = expoEnv?.EXPO_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = expoEnv?.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

if (!expoEnv?.EXPO_PUBLIC_SUPABASE_URL || !expoEnv?.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    '[drip] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Using placeholder values.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
