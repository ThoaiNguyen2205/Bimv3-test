import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

interface embedState {
  embedContent: string | null;
  setEmbedContent: (path: string | null) => void;
}

const useEmbed = create<embedState>()((set, get) => ({
  embedContent: null,
  setEmbedContent: (path: string | null) => {
    set(() => ({ embedContent: path }));
  },
}));

export default useEmbed;
