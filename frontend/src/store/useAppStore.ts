import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
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
    setUser: (user) => set({ user }),
    isLoading: false,
    setIsLoading: (isLoading) => set({ isLoading }),
  }))
);
