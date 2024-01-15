import { create } from "zustand";
// type
import { BaseRedux } from "./BaseRedux";
import { IContract } from "src/shared/types/contract";

interface contractState {
  datas: IContract[];
  selectedData: IContract | null;
  loading: boolean;

  setDatas: (contracts: IContract[]) => void;
  countDatas: () => void;
  addData: (contract: IContract) => void;
  replaceData: (contract: IContract) => void;
  removeData: (contractId: string) => void;
  setLoading: (value: boolean) => void;

  setSelectedData: (contract: IContract | null) => void;
}

const useContract = create<contractState>()((set, get) => ({
  ...BaseRedux(set, get),
}));

export default useContract;
