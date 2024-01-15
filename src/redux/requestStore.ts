import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { IRequest, IRequestTreeData } from "src/shared/types/request";
import { BaseRedux } from "./BaseRedux";
import { IMainTask } from "src/shared/types/mainTask";
import { IRequestContent } from "src/shared/types/requestContent";

interface requestState {
  datas: IRequest[];
  selectedData: IRequest | null;
  loading: boolean;

  setDatas: (requests: IRequest[]) => void;
  countDatas: () => void;
  addData: (request: IRequest) => void;
  replaceData: (request: IRequest) => void;
  removeData: (requestId: string) => void;
  setLoading: (value: boolean) => void;
  setSelectedData: (request: IRequest | null) => void;

  currentTask: IMainTask | null;
  setCurrentTask: (task: IMainTask | null) => void;

  requestsTree: IRequestTreeData[];
  setRequestsTree: (treeData: IRequestTreeData[]) => void;

  requestContents: IRequestContent[];
  setRequestContents: (requestContents: IRequestContent[]) => void;

  selectedRequestContent: IRequestContent | null;
  setSelectedRequestContent: (requestContent: IRequestContent | null) => void;
}

const useRequest = create<requestState>()((set, get) => ({
  ...BaseRedux(set, get),

  currentTask: null,
  setCurrentTask: (task: IMainTask | null) => {
    set(() => ({ currentTask: task }));
  },

  requestsTree: [],
  setRequestsTree: (treeData: IRequestTreeData[]) => {
    set(() => ({ requestsTree: treeData }));
  },
  requestContents: [],
  setRequestContents: (requestContents: IRequestContent[]) => {
    set(() => ({ requestContents: requestContents }));
  },
  selectedRequestContent: null,
  setSelectedRequestContent: (requestContent: IRequestContent) => {
    set(() => ({ selectedRequestContent: requestContent }));
  },
}));

export default useRequest;
