import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ProfileDraftState {
  formData: any;
  setFormData: (data: any) => void;
  resetFormData: () => void;
}

/**
 * Store for managing student profile draft data across navigation segments.
 * This ensures that data entered in one tab is not lost when moving to another.
 */
export const useProfileStore = create<ProfileDraftState>()(
  devtools((set) => ({
    formData: {},
    setFormData: (data) =>
      set((state) => ({ 
        formData: { ...state.formData, ...data } 
      })),
    resetFormData: () => set({ formData: {} }),
  }))
);
