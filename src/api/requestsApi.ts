import { axiosClient, formToParameter } from "./axiosClient";
import { IRequest, IRequestReqCreate, IRequestResGetAll, IRequestTreeData, IRequestTaskData } from "src/shared/types/request";
import { DeleteData } from "src/shared/types/deleteData";
import { ISearchBy } from "src/shared/types/searchBy";
import { IMainTask } from "src/shared/types/mainTask";

const requestsApi = {

  postCreate: async (jsonObj: IRequestReqCreate): Promise<IRequest> => {
    const url = "/requests";
    const res: IRequest = await axiosClient.post(url, jsonObj) as IRequest;
    return res;
  },

  getReadById: async (id: string): Promise<IRequest> => {
    const url = `/requests/${id}`;
    const res: IRequest = await axiosClient.get(url) as IRequest;
    return res;
  },

  updateById: async (id: string, jsonObj: IRequestReqCreate): Promise<IRequest> => {
    const url = `/requests/${id}`;
    const res: IRequest = await axiosClient.patch(url, jsonObj) as IRequest;
    return res;
  },

  closeById: async (id: string, deleteJson: DeleteData): Promise<IRequest> => {
    const url = `/requests/close/${id}`;
    const res: IRequest = await axiosClient.patch(url, deleteJson) as IRequest;
    return res;
  },

  deleteById: async (id: string, deleteJson: DeleteData): Promise<IRequest> => {
    const url = `/requests/delete/${id}`;
    const res: IRequest = await axiosClient.patch(url, deleteJson) as IRequest;
    return res;
  },

  removeById: async (id: string): Promise<IRequest> => {
    const url = `/requests/remove/${id}`;
    const res: IRequest = await axiosClient.delete(url) as IRequest;
    return res;
  },

  getAllRequests: async (data: ISearchBy | null): Promise<IRequestResGetAll> => {
    let params: ISearchBy = {
      sortBy: 'createdAt',
      sortType: data?.sortType || 'asc',
    };
    if (data != null) {
      // filter by task
      if (data.task) {
        params = { task: data.task, ...params };
      }

      // search by father
      if (data.father) {
        params = { father: data.father, ...params };
      }

    }

    const url = `/requests?${formToParameter(params)}`;
    const res: IRequestResGetAll = (await axiosClient.get(url)) as IRequestResGetAll;
    return res;
  },

  getTreeDataByTaskId: async (tid: string): Promise<IRequestTreeData[]> => {
    const url = `/requests/getdata/treebytask/${tid}`;
    const res: IRequestTreeData[] = await axiosClient.get(url) as IRequestTreeData[];
    return res;
  },

  getRequestTaskData: async (id: string, uid: string, role: string, cus: string, gid: string): Promise<IRequestTaskData> => {
    const url = `/requests/getdata/reqquesttask/${id}/${uid}/${role}/${cus}/${gid}`;
    const res: IRequestTaskData = await axiosClient.get(url) as IRequestTaskData;
    return res;
  },

  getRequestTasksByUser: async (data: ISearchBy | null, gid: string): Promise<IMainTask[]> => {
    let params: ISearchBy = {
      sortBy: 'createdAt',
      sortType: data?.sortType || 'asc',
    };
    if (data != null) {
      // filter by project
      if (data.project) {
        params = { project: data.project, ...params };
      }

      // search by category
      if (data.category) {
        params = { category: data.category, ...params };
      }
    }
    const url = `/requests/gettask/byuser/${gid}?${formToParameter(params)}`;
    const allTasks: IMainTask[] = await axiosClient.get(url) as IMainTask[];
    return allTasks;
  },

}

export default requestsApi;