import { create } from 'zustand';

interface LandlordRegistrationState {
  selectedFiles: File[];
  title: string;
  description: string;
  
  setSelectedFiles: (files: File[]) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  
  resetForm: () => void;
}

export const useLandlordRegistration = create<LandlordRegistrationState>((set) => ({
  selectedFiles: [],
  title: '',
  description: '',
  
  setSelectedFiles: (files) => set({ selectedFiles: files }),
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  
  resetForm: () => set({
    selectedFiles: [],
    title: '',
    description: '',
  }),
}));
