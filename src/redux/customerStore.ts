import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { ICustomer } from 'src/shared/types/customer';
import { BaseRedux } from "./BaseRedux";

interface customerState {
  datas: ICustomer[];
  selectedData: ICustomer | null;
  loading: boolean;

  setDatas: (customers: ICustomer[]) => void;
  countDatas: () => void;
  addData: (customer: ICustomer) => void;
  replaceData: (customer: ICustomer) => void;
  removeData: (customerId: string) => void;
  setLoading: (value: boolean) => void;

  setSelectedData: (customer: ICustomer | null) => void;
}

// const initialState = {
//   openContractDialog: false,
// };

const useCustomer = create<customerState>()((set, get) => ({
  // ...initialState,
  ...BaseRedux(set, get),

}));

export default useCustomer;
