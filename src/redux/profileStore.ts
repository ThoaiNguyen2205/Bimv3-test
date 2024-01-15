import { create } from 'zustand';

interface currentState {
  currentTab: string;
  setCurrentTab: (newValue: string) => void;
}

const useProfile = create<currentState>()((set, get) => ({
  currentTab: 'profile',
  setCurrentTab: (newValue: string) => {
    set((state: currentState) => {
      return {
        ...state,
        currentTab: newValue,
      };
    });
  },
}));

export default useProfile;
