import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { User } from '@/types/auth';
import { ExportJobStatus, ExportFilters } from '@/types/admin/export';

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

  // Export State
  exportJobId: string | null;
  exportStatus: ExportJobStatus;
  exportDownloadUrl: string | null;
  exportError: string | null;
  previewTriggered: boolean;
  exportType: 'students' | 'applications';
  exportFilters: ExportFilters;
  setExportJobId: (jobId: string | null) => void;
  setExportStatus: (status: ExportJobStatus) => void;
  setExportDownloadUrl: (url: string | null) => void;
  setExportError: (error: string | null) => void;
  setPreviewTriggered: (triggered: boolean) => void;
  setExportType: (type: 'students' | 'applications') => void;
  setExportFilters: (filters: ExportFilters) => void;
  resetExportState: () => void;
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

    // Export State Implementation
    exportJobId: null,
    exportStatus: 'idle',
    exportDownloadUrl: null,
    exportError: null,
    previewTriggered: true,
    exportType: 'students',
    exportFilters: {},
    setExportJobId: (exportJobId) => set({ exportJobId }),
    setExportStatus: (exportStatus) => set({ exportStatus }),
    setExportDownloadUrl: (exportDownloadUrl) => set({ exportDownloadUrl }),
    setExportError: (exportError) => set({ exportError }),
    setPreviewTriggered: (previewTriggered) => set({ previewTriggered }),
    setExportType: (exportType) => set({ exportType, previewTriggered: false }),
    setExportFilters: (exportFilters) => set({ exportFilters }),
    resetExportState: () => set({ 
      exportJobId: null, 
      exportStatus: 'idle', 
      exportDownloadUrl: null, 
      exportError: null,
      previewTriggered: true,
      exportType: 'students',
      exportFilters: {}
    }),
  }))
);

