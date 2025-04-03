import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FeedbackState {
  appetizerRating: number;
  mainCourseRating: number;
  tasteRating: number;
  portionRating: number;
  finishedPlate: boolean | null;
  notEatenReason: string | null;
  comment: string;
  chosenStarter: string | null;
  chosenMainCourse: string | null;
  
  setAppetizerRating: (rating: number) => void;
  setMainCourseRating: (rating: number) => void;
  setTasteRating: (rating: number) => void;
  setPortionRating: (rating: number) => void;
  setFinishedPlate: (finished: boolean) => void;
  setNotEatenReason: (reason: string | null) => void;
  setComment: (comment: string) => void;
  setChosenStarter: (value: string) => void;
  setChosenMainCourse: (value: string) => void;
  resetForm: () => void;
}

const initialState = {
  appetizerRating: 0,
  mainCourseRating: 0,
  tasteRating: 0,
  portionRating: 0,
  finishedPlate: null,
  notEatenReason: null,
  comment: '',
  chosenStarter: null,
  chosenMainCourse: null,
};

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set) => ({
      ...initialState,
      setAppetizerRating: (rating) => set({ appetizerRating: rating }),
      setMainCourseRating: (rating) => set({ mainCourseRating: rating }),
      setTasteRating: (rating) => set({ tasteRating: rating }),
      setPortionRating: (rating) => set({ portionRating: rating }),
      setFinishedPlate: (finished) =>
        set({ finishedPlate: finished, ...(finished ? { notEatenReason: null } : {}) }),
      setNotEatenReason: (reason) => set({ notEatenReason: reason }),
      setComment: (comment) => set({ comment }),
      setChosenStarter: (value) => set({ chosenStarter: value }),
      setChosenMainCourse: (value) => set({ chosenMainCourse: value }),
      resetForm: () => set(initialState),
    }),
    {
      name: 'meal-feedback-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);