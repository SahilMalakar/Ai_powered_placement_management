import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { User } from '@/types/auth';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  /**
   * Atomic action to update multiple authentication states at once.
   * Prevents race conditions during hydration where isLoading is false 
   * but isAuthenticated is still false for one render frame.
   */
  setAuth: (user: User | null, isLoading: boolean) => void;
}

/**
 * Defines the primary reactive state container for core application data and UI status.
 * It leverages the observer pattern for high-performance state updates and provides
 * a centralized hub for managing non-persistent application-level flags.
 */
export const useAppStore = create<AppState>()(
  devtools((set) => ({
    // Represents the authenticated user's profile or null if unauthenticated
    user: null,
    isAuthenticated: false,
    setUser: (user) => {
      set({ user, isAuthenticated: !!user });
    },
    setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    isLoading: true,
    setIsLoading: (isLoading) => set({ isLoading }),
    setAuth: (user, isLoading) => {
      set({ 
        user, 
        isAuthenticated: !!user, 
        isLoading 
      });
    },
  }))
);
