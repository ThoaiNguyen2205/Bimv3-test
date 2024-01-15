import { TreeItem } from '@mui/lab';

import docContentsApi from 'src/api/docContentsApi';

import { IDocContent, ITreeItem } from 'src/shared/types/docContent';
import { IDocIndex } from 'src/shared/types/docIndex';
import { ISearchBy } from 'src/shared/types/searchBy';
import { create } from 'zustand';

interface docEditorState {
  indexName: string;
  order: string;
  versionNotes: string;
  content: string;
  versionNoteDelete: string;
  idVersionCreate: string;
  idVersionDelete: string;
  idVersionRestore: string;
  setVersionNoteDelete: (newValue: string) => void;
  onIndexName: (newValue: string) => void;
  onOrderName: (newValue: string) => void;
  onVersionName: (newValue: string) => void;
  setContent: (newValue: string) => void;
  setItemTreeClick: (item: ITreeItem) => void;
  setIdVersionCreate: (newValue: string) => void;
  setIdVersionDelete: (newValue: string) => void;
  setIdVersionRestore: (newValue: string) => void;
  handleRestoreVersion: (id: string) => void;
}
const useDocEditor = create<docEditorState>()((set, get) => ({
  versionNoteDelete: '',
  indexName: '',
  order: '',
  versionNotes: '',
  content: '',
  idVersionCreate: '',
  idVersionDelete: '',
  idVersionRestore: '',
  setVersionNoteDelete: (newValue: string) => {
    set((state: docEditorState) => {
      return {
        ...state,
        versionNoteDelete: newValue
      };
    });
  },
  onIndexName: (newValue: string) => {
    set((state: docEditorState) => {
      return {
        ...state,
        indexName: newValue
      };
    });
  },
  onOrderName: (newValue: string) => {
    set((state: docEditorState) => {
      return {
        ...state,
        order: newValue
      };
    });
  },
  onVersionName: (newValue: string) => {
    set((state: docEditorState) => {
      return {
        ...state,
        versionNotes: newValue
      };
    });
  },
  setItemTreeClick: (item: ITreeItem) => {
    set((state: docEditorState) => {
      return {
        ...state,
        indexName: item.index,
        order: item.order,
        content: item.content,
        versionNotes: item.versionNotes
      };
    });
  },
  setContent: (newContent: string) => {
    set((state: docEditorState) => {
      return {
        ...state,
        content: newContent
      };
    });
  },
  setIdVersionCreate: (newValue: string) => {
    set((state: docEditorState) => {
      return {
        ...state,
        idVersionCreate: newValue
      };
    });
  },
  setIdVersionDelete: (newValue: string) => {
    set((state: docEditorState) => {
      return {
        ...state,
        idVersionDelete: newValue
      };
    });
  },
  setIdVersionRestore: (newValue: string) => {
    set((state: docEditorState) => {
      return {
        ...state,
        idVersionRestore: newValue
      };
    });
  },
  handleRestoreVersion: async (id: string) => {
    const res = await docContentsApi.getReadById(id);
    const indexObj = res.index as IDocIndex;
    set((state: docEditorState) => {
      return {
        ...state,
        content: res.content,
        versionNotes: res.versionNotes,
        indexName: indexObj.title,
        order: indexObj.order.toString()
      };
    });
  }
}));
export default useDocEditor;
