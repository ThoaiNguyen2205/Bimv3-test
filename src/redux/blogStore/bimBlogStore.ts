import { create } from 'zustand';
type bimBlogState = {
  isMyPostsPage: boolean;
  contentPost: string;
  contentEdit: string;
  setContentPost: (newValue: string) => void;
  setContentEdit: (newValue: string) => void;
  setIsMyPostsPage: (value: boolean) => void;
};
const useBimBlogStore = create<bimBlogState>()((set, get) => ({
  postSelected: {},
  isMyPostsPage: true,
  contentPost: '',
  contentEdit: '',
  setContentPost: (newValue: string) => {
    set((state: bimBlogState) => {
      return {
        ...state,
        contentPost: newValue
      };
    });
  },
  setContentEdit: (newValue: string) => {
    set((state: bimBlogState) => {
      return {
        ...state,
        contentEdit: newValue
      };
    });
  },
  setIsMyPostsPage: (value: boolean) => {
    set((state: bimBlogState) => {
      return {
        ...state,
        isMyPostsPage: value
      };
    });
  }
}));
export default useBimBlogStore;
