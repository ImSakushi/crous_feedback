// store/feedback-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FeedbackState {
  mainDishRating: number;
  mainDishTasteRating: number;
  accompanimentRating: number;
  accompanimentTasteRating: number;
  portionRating: number;
  finishedPlate: boolean | null;
  notEatenReason: string | null;
  comment: string;
  chosenMainDish: string | null;
  chosenAccompaniment: string | null;
  setMainDishRating: (rating: number) => void;
  setMainDishTasteRating: (rating: number) => void;
  setAccompanimentRating: (rating: number) => void;
  setAccompanimentTasteRating: (rating: number) => void;
  setPortionRating: (rating: number) => void;
  setFinishedPlate: (finished: boolean) => void;
  setNotEatenReason: (reason: string | null) => void;
  setComment: (comment: string) => void;
  setChosenMainDish: (value: string) => void;
  setChosenAccompaniment: (value: string) => void;
  resetForm: () => void;
}

const initialState = {
  mainDishRating: 0,
  mainDishTasteRating: 0,
  accompanimentRating: 0,
  accompanimentTasteRating: 0,
  portionRating: 0,
  finishedPlate: null,
  notEatenReason: null,
  comment: '',
  chosenMainDish: null,
  chosenAccompaniment: null,
};

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set) => ({
      ...initialState,
      setMainDishRating: (rating) => set({ mainDishRating: rating }),
      setMainDishTasteRating: (rating) => set({ mainDishTasteRating: rating }),
      setAccompanimentRating: (rating) => set({ accompanimentRating: rating }),
      setAccompanimentTasteRating: (rating) => set({ accompanimentTasteRating: rating }),
      setPortionRating: (rating) => set({ portionRating: rating }),
      setFinishedPlate: (finished) =>
        set({ finishedPlate: finished, ...(finished ? { notEatenReason: null } : {}) }),
      setNotEatenReason: (reason) => set({ notEatenReason: reason }),
      setComment: (comment) => set({ comment }),
      setChosenMainDish: (value) => set({ chosenMainDish: value }),
      setChosenAccompaniment: (value) => set({ chosenAccompaniment: value }),
      resetForm: () => set(initialState),
    }),
    {
      name: 'meal-feedback-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);