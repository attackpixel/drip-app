import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | { id: string } | null;
  session: Session | null;
  profile: null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: { id: 'local-user' },
      session: null,
      profile: null,
      loading: false,
      initialized: true,

      initialize: async () => {
        set({ initialized: true });
      },

      signUp: async (email, password) => {
        set({ user: { id: 'local-user' } });
      },

      signIn: async (email, password) => {
        set({ user: { id: 'local-user' } });
      },

      signOut: async () => {
        set({ user: null });
      },
    }),
    {
      name: 'drip-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
