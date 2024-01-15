import { create } from 'zustand';
import { BaseRedux } from '../BaseRedux';
import { IBlog } from 'src/shared/types/blog';
//type
interface bimDocumentState {
  datas: IBlog[];
  selectedData: IBlog | null;
  loading: boolean;

  setDatas: (bimDocuments: IBlog[]) => void;
  countDatas: () => void;
  addData: (bimDocument: IBlog) => void;
  replaceData: (bimDocument: IBlog) => void;
  removeData: (bimDocumentId: string) => void;
  setLoading: (value: boolean) => void;

  setSelectedData: (bimDocument: IBlog | null) => void;
}

const useBimBlogDefaultStore = create<bimDocumentState>()((set, get) => ({
  ...BaseRedux(set, get)
}));

export default useBimBlogDefaultStore;
