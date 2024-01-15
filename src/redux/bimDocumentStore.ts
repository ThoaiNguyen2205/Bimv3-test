import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { IBimDocument } from "src/shared/types/bimDocument";
import { BaseRedux } from "./BaseRedux";

interface bimDocumentState {
  datas: IBimDocument[];
  selectedData: IBimDocument | null;
  loading: boolean;

  setDatas: (bimDocuments: IBimDocument[]) => void;
  countDatas: () => void;
  addData: (bimDocument: IBimDocument) => void;
  replaceData: (bimDocument: IBimDocument) => void;
  removeData: (bimDocumentId: string) => void;
  setLoading: (value: boolean) => void;

  setSelectedData: (bimDocument: IBimDocument | null) => void;
}

const useBimDocument = create<bimDocumentState>()((set, get) => ({
  ...BaseRedux(set, get),
}));

export default useBimDocument;
