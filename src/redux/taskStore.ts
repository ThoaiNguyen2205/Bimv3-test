import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware';

// type
import { IMainTask, IDiscussionTask } from "src/shared/types/mainTask";
import { BaseRedux } from "./BaseRedux";

interface taskState {
  datas: IMainTask[];
  selectedData: IMainTask | null;
  loading: boolean;

  setDatas: (tasks: IMainTask[]) => void;
  countDatas: () => void;
  addData: (task: IMainTask) => void;
  replaceData: (task: IMainTask) => void;
  removeData: (taskId: string) => void;
  setLoading: (value: boolean) => void;

  setSelectedData: (task: IMainTask | null) => void;

  discussionTask: IDiscussionTask | null;
  setDiscussionTask: (task: IDiscussionTask | null) => void;
  discussionTasks: IDiscussionTask[];
  setDiscussionTasks: (tasks: IDiscussionTask[]) => void;
}

const useTask = create<taskState>()((set, get) => ({
  ...BaseRedux(set, get),

  discussionTask: null,
  setDiscussionTask: (task: IDiscussionTask | null) => {
    set(() => ({ discussionTask: task }));
  },
  discussionTasks: [],
  setDiscussionTasks: (tasks: IDiscussionTask[]) => {
    set(() => ({ discussionTasks: tasks }));
  },
}));

export default useTask;
