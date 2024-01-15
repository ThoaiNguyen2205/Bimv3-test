import { create } from 'zustand';

interface docEditorState {
  openReplyList: string;
  openReply: string;
  isEdit: boolean;
  isLoading: boolean;
  setClickButtonReply: (id: string) => void;
  setClickButtonEdit: (id: string) => void;
  setOpenReplyList: (id: string) => void;
  setCloseReply: () => void;
  setIsLoading: (value: boolean) => void;
}
const useCommentStore = create<docEditorState>()((set, get) => ({
  openReplyList: '',
  openReply: '',
  isEdit: false,
  isLoading: false,
  setClickButtonReply: (id: string) => {
    if (get().openReply === id) {
      if (get().isEdit === false) {
        set((state: docEditorState) => ({
          ...state,

          openReply: ''
        }));
      } else {
        set((state: docEditorState) => ({
          ...state,
          isEdit: false,
          openReply: id
        }));
      }
    } else {
      set((state: docEditorState) => ({
        ...state,
        isEdit: false,
        openReply: id
      }));
    }
  },
  setClickButtonEdit: (id: string) => {
    if (get().openReply === id) {
      if (get().isEdit === true) {
        set((state: docEditorState) => ({
          ...state,
          openReply: ''
        }));
      } else {
        set((state: docEditorState) => ({
          ...state,
          isEdit: true,
          openReply: id
        }));
      }
    } else {
      set((state: docEditorState) => ({
        ...state,
        isEdit: true,
        openReply: id
      }));
    }
  },
  setOpenReplyList: (id: string) => {
    if (get().openReplyList === id) {
      set((state: docEditorState) => ({
        ...state,
        openReplyList: ''
      }));
    } else {
      set((state: docEditorState) => ({
        ...state,
        openReplyList: id
      }));
    }
  },
  setCloseReply: () => {
    set((state: docEditorState) => ({
      ...state,
      openReply: ''
    }));
  },
  setIsLoading: (value: boolean) => {
    set((state: docEditorState) => ({
      ...state,
      isLoading: value
    }));
  }
}));
export default useCommentStore;
