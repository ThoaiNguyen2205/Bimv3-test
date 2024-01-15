import { axiosClient, formToParameter } from "./axiosClient";
import { IMainTaskReqCreate, IMainTask, IMainTaskResGetAll } from "src/shared/types/mainTask";
import { DeleteData } from "src/shared/types/deleteData";
import { ISearchBy } from "src/shared/types/searchBy";
import projectsApi from "./projectsApi";
import { IProject } from "src/shared/types/project";

const mainTasksApi = {

  postCreate: async (jsonObj: IMainTaskReqCreate): Promise<IMainTask> => {
    const url = "/tasks";
    const res: IMainTask = await axiosClient.post(url, jsonObj) as IMainTask;
    return res;
  },

  getReadById: async (id: string): Promise<IMainTask> => {
    const url = `/tasks/${id}`;
    const res: IMainTask = await axiosClient.get(url) as IMainTask;
    return res;
  },

  updateById: async (id: string, jsonObj: IMainTaskReqCreate): Promise<IMainTask> => {
    const url = `/tasks/${id}`;
    const res: IMainTask = await axiosClient.patch(url, jsonObj) as IMainTask;
    return res;
  },

  deleteById: async (id: string, deleteJson: DeleteData): Promise<IMainTask> => {
    const url = `/tasks/delete/${id}`;
    const res: IMainTask = await axiosClient.patch(url, deleteJson) as IMainTask;
    return res;
  },

  removeById: async (id: string): Promise<IMainTask> => {
    const url = `/tasks/remove/${id}`;
    const res: IMainTask = await axiosClient.delete(url) as IMainTask;
    return res;
  },

  getAllTasks: async (data: ISearchBy | null): Promise<IMainTaskResGetAll> => {
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

      // filter by name
      if (data.name) {
        params = { name: data.name, ...params };
      }

      // filter by current page
      if (data.page) {
        params = { pageNumber: data.page, ...params };
      }

      // filter by page size
      if (data.size) {
        params = { itemPerPage: data.size, ...params };
      }
    }

    const url = `/tasks?${formToParameter(params)}`;
    const res: IMainTaskResGetAll = (await axiosClient.get(url)) as IMainTaskResGetAll;
    return res;
  },

  getAllByUser: async (data: ISearchBy | null, uid: string, role: string, cus: string): Promise<IMainTask[]> => {
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

      // filter by name
      if (data.name) {
        params = { name: data.name, ...params };
      }
    }
  
    const url = `/tasks/getallbyuser/${uid}/${role}/${cus}?${formToParameter(params)}`;
    const allTasks: IMainTask[] = await axiosClient.get(url) as IMainTask[];
    return allTasks;
  },

  readOneByUser: async (id: string, uid: string, role: string, cus: string): Promise<IMainTask> => {
    const url = `/tasks/findone/byuser/${id}/${uid}/${role}/${cus}`;
    const res: IMainTask = await axiosClient.get(url) as IMainTask;
    return res;
  },

  // upgrade v3
  upgradev3FindAll: async (customerId: string): Promise<IMainTask[]> => {
    let projectParams = {
      customerId: customerId,
    };
    const projectRes = await projectsApi.getProjects(projectParams);
    const allTasks: IMainTask[] = [];
    for (const proj of projectRes.data) {
      const project = proj as IProject;
      let params: ISearchBy = {
        project: project._id,
      };
      const url = `/tasks/upgradev3/findall?${formToParameter(params)}`;
      const taskRes: IMainTaskResGetAll = await axiosClient.get(url) as IMainTaskResGetAll;
      if (taskRes.data.length > 0) {
        for (const taski of taskRes.data) {
          const task = taski as IMainTask;
          allTasks.push(task);
        }
      }
    }
    return allTasks;
  },
}

export default mainTasksApi;