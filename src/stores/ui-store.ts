import { create } from "zustand";

interface UIStore {
  isAnnotating: boolean;
  setIsAnnotating: (isAnnotating: boolean) => void;
  toggleAnnotationMode: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isAnnotating: false,
  setIsAnnotating: (isAnnotating: boolean) => set({ isAnnotating }),
  toggleAnnotationMode: () =>
    set((state) => ({ isAnnotating: !state.isAnnotating })),
}));

export const useAnnotationMode = () => {
  const isAnnotating = useUIStore((state) => state.isAnnotating);
  const setIsAnnotating = useUIStore((state) => state.setIsAnnotating);
  const toggleAnnotationMode = useUIStore((state) => state.toggleAnnotationMode);

  return { isAnnotating, setIsAnnotating, toggleAnnotationMode };
};
