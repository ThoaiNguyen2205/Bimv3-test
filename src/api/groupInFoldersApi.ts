import { axiosClient, formToParameter } from "./axiosClient";
import { IGroupInFolder, IGroupInFolderReqCreate, IGroupInFolderResGetAll } from "src/shared/types/groupInFolder";
import { ISearchBy } from "src/shared/types/searchBy";

const groupInFoldersApi = {

  postCreate: async (jsonObj: IGroupInFolderReqCreate): Promise<IGroupInFolder> => {
    const url = "/group-in-folders";
    const res: IGroupInFolder = await axiosClient.post(url, jsonObj) as IGroupInFolder;
    return res;
  },

  getReadById: async (id: string): Promise<IGroupInFolder> => {
    const url = `/group-in-folders/${id}`;
    const res: IGroupInFolder = await axiosClient.get(url) as IGroupInFolder;
    return res;
  },

  deleteById: async (id: string): Promise<IGroupInFolder> => {
    const url = `/group-in-folders/delete/${id}`;
    const res: IGroupInFolder = await axiosClient.delete(url) as IGroupInFolder;
    return res;
  },

  deleteInFolder: (pid: string) => {
    const url = `/group-in-folders/infolder/${pid}`;
    return axiosClient.delete(url);
  },

  getGroupsInFolder: async(data: ISearchBy | null): Promise<IGroupInFolderResGetAll> => {
    let params: ISearchBy = {
      sortBy: "createdAt",
      sortType: data?.sortType || "asc"
    };
    if (data != null) {
      // filter by folder
      if (data.folder) {
        params = { folder: data.folder, ...params };
      }

      // search by group
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
  
    const url = `/group-in-folders?${formToParameter(params)}`;
    const res: IGroupInFolderResGetAll = await axiosClient.get(url) as IGroupInFolderResGetAll;  
    return res;
  },

}

export default groupInFoldersApi;