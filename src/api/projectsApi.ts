import { axiosClient, formToParameter } from "./axiosClient";
import { IProjectReqCreate, IProject, IProjectResGetAll } from "src/shared/types/project";
import { DeleteData } from "src/shared/types/deleteData";
import { ISearchBy } from "src/shared/types/searchBy";

const projectsApi = {
  postCreate: async (jsonObj: IProjectReqCreate): Promise<IProject> => {
    const url = "/projects";
    const res: IProject = await axiosClient.post(url, jsonObj) as IProject;
    return res;
  },

  getReadById: async (id: string): Promise<IProject> => {
    const url = `/projects/${id}`;
    const res: IProject = await axiosClient.get(url) as IProject;
    return res;
  },

  updateById: async (id: string, jsonObj: IProjectReqCreate): Promise<IProject> => {
    const url = `/projects/${id}`;
    const res: IProject = await axiosClient.patch(url, jsonObj) as IProject;
    return res;
  },

  blockById: async (id: string, deleteJson: DeleteData): Promise<IProject> => {
    const url = `/projects/block/${id}`;
    const blockUser: IProject = await axiosClient.patch(url, deleteJson) as IProject; 
    return blockUser;
  },

  deleteById: async (id: string, deleteJson: DeleteData): Promise<IProject> => {
    const url = `/projects/delete/${id}`;
    const res: IProject = await axiosClient.patch(url, deleteJson) as IProject;
    return res;
  },

  removeById: async (id: string): Promise<IProject> => {
    const url = `/projects/remove/${id}`;
    const res: IProject = await axiosClient.delete(url) as IProject;
    return res;
  },

  getProjects: async(data: ISearchBy | null): Promise<IProjectResGetAll> => {
    let params: ISearchBy = {
      sortBy: "createdAt",
      sortType: data?.sortType || "asc"
    };
    if (data != null) {
      // filter by customerId
      if (data.customerId) {
        params = { customer: data.customerId, ...params };
      }

      // search by name
      if (data.name) {
        params = { name: data.name, ...params };
      }

      // filter by current page
      if (data.page) {
        params = { pageNumber: data.page, ...params }
      }

      // filter by page size
      if (data.size) {
        params = { itemPerPage: data.size, ...params }
      }
    }

    const url = `/projects?${formToParameter(params)}`;
    const res: IProjectResGetAll = await axiosClient.get(url) as IProjectResGetAll;  
    return res;
  },

  determineUserInProject: (projectId: string, userId: string): Promise<boolean> => {
    const url = '/projects/determine/' + projectId + '/' + userId;
    return axiosClient.get(url);
  },

  // Tải tất cả dự án liên quan 1 người dùng
  getByUser: async (userId: string, customerId: string): Promise<IProjectResGetAll> => {
    const url = '/projects/getbyuser/' + customerId + '/' + userId;
    const allProjects: IProjectResGetAll = await axiosClient.get(url);
    return allProjects;
  },
}

export default projectsApi;