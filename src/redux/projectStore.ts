import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { IProject } from "src/shared/types/project";
import { BaseRedux } from "./BaseRedux";

interface projectState {
  datas: IProject[];
  selectedData: IProject | null;
  loading: boolean;

  setDatas: (projects: IProject[]) => void;
  countDatas: () => void;
  addData: (project: IProject) => void;
  replaceData: (project: IProject) => void;
  removeData: (projectId: string) => void;
  setLoading: (value: boolean) => void;

  setSelectedData: (project: IProject | null) => void;
}

const useProject = create<projectState>()((set, get) => ({
  ...BaseRedux(set, get),
}));

export default useProject;
