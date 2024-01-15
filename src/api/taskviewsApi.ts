import { axiosClient, formToParameter } from "./axiosClient";
import { ITaskView, ITaskViewReqCreate, ITaskViewResGetAll } from "src/shared/types/taskView";
import { ISearchBy } from "src/shared/types/searchBy";

const taskviewsApi = {

  postCreate: async (jsonObj: ITaskViewReqCreate): Promise<ITaskView> => {
    const url = "/task-views";
    const res: ITaskView = await axiosClient.post(url, jsonObj) as ITaskView;
    return res;
  },

  getReadById: async (id: string): Promise<ITaskView> => {
    const url = `/task-views/${id}`;
    const res: ITaskView = await axiosClient.get(url) as ITaskView;
    return res;
  },

  removeById: async (id: string): Promise<ITaskView> => {
    const url = `/task-views/remove/${id}`;
    const res: ITaskView = await axiosClient.delete(url) as ITaskView;
    return res;
  },

  getAllTaskViews: async (data: ISearchBy | null): Promise<ITaskViewResGetAll> => {
    let params: ISearchBy = {
      sortBy: 'createdAt',
      sortType: data?.sortType || 'asc',
    };
    if (data != null) {
      if (data.task) {
        params = { task: data.task, ...params };
      }
    }

    const url = `/task-views?${formToParameter(params)}`;
    const res: ITaskViewResGetAll = (await axiosClient.get(url)) as ITaskViewResGetAll;
    return res;
  },

}

export default taskviewsApi;