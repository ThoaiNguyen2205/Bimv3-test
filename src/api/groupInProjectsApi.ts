import { axiosClient, formToParameter } from "./axiosClient";
import { IGroupInProject, IGroupInProjectReqCreate, IGroupInProjectResGetAll } from "src/shared/types/groupInProject";
import { ISearchBy } from "src/shared/types/searchBy";
import { UserClassEnum } from "src/shared/enums";

const groupInProjectsApi = {

  postCreate: async (jsonObj: IGroupInProjectReqCreate): Promise<IGroupInProject> => {
    const url = "/group-in-projects";
    const res: IGroupInProject = await axiosClient.post(url, jsonObj) as IGroupInProject;
    return res;
  },

  getReadById: async (id: string): Promise<IGroupInProject> => {
    const url = `/group-in-projects/${id}`;
    const res: IGroupInProject = await axiosClient.get(url) as IGroupInProject;
    return res;
  },

  removeById: async (id: string): Promise<IGroupInProject> => {
    const url = `/group-in-projects/remove/${id}`;
    const res: IGroupInProject = await axiosClient.delete(url) as IGroupInProject;
    return res;
  },

  deleteInProject: (pid: string) => {
    const url = `/group-in-projects/inproject/${pid}`;
    return axiosClient.delete(url);
  },

  getGroupsInProject: async(data: ISearchBy | null): Promise<IGroupInProjectResGetAll> => {
    let params: ISearchBy = {
      sortBy: "createdAt",
      sortType: data?.sortType || "asc"
    };
    if (data != null) {
      // filter by project
      if (data.project) {
        params = { project: data.project, ...params };
      }

      // search by name
      if (data.group) {
        params = { group: data.group, ...params };
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
  
    const url = `/group-in-projects?${formToParameter(params)}`;
    const res: IGroupInProjectResGetAll = await axiosClient.get(url) as IGroupInProjectResGetAll;  
    return res;
  },

  userIsProjectAdmin: async (uid: string, pid: string): Promise<UserClassEnum> => {
    const url = `/group-in-projects/projectadmin/${uid}/${pid}`;
    const res: UserClassEnum = await axiosClient.get(url) as UserClassEnum;
    return res;
  },

}

export default groupInProjectsApi;