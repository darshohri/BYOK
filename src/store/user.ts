import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
}

interface UserState {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      
      setUser: (user) => set({ user }),
      
      updateUser: (updates) => 
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        })),
        
      logout: () => {
        set({ user: null });
        localStorage.removeItem('byok_has_account');
      },
    }),
    {
      name: 'byok_user_data',
    }
  )
);
