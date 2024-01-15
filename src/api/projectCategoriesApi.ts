import { axiosClient, formToParameter } from "./axiosClient";
import { IProjectCategoryReqCreate, IProjectCategory, IProjectCategoryResGetAll } from '../shared/types/projectCategory';
import { DeleteData } from "src/shared/types/deleteData";
import { ISearchBy } from "src/shared/types/searchBy";

const projectCategoriesApi = {

  postCreate: async (jsonObj: IProjectCategoryReqCreate): Promise<IProjectCategory> => {
    const url = "/project-categories";
    const res: IProjectCategory = await axiosClient.post(url, jsonObj) as IProjectCategory;
    return res;
  },

  getReadById: async (id: string): Promise<IProjectCategory> => {
    const url = `/project-categories/${id}`;
    const res: IProjectCategory = await axiosClient.get(url) as IProjectCategory;
    return res;
  },

  updateById: async (id: string, jsonObj: IProjectCategoryReqCreate): Promise<IProjectCategory> => {
    const url = `/project-categories/${id}`;
    const res: IProjectCategory = await axiosClient.patch(url, jsonObj) as IProjectCategory;
    return res;
  },

  deleteById: async (id: string, deleteJson: DeleteData): Promise<IProjectCategory> => {
    const url = `/project-categories/delete/${id}`;
    const res: IProjectCategory = await axiosClient.patch(url, deleteJson) as IProjectCategory;
    return res;
  },

  removeById: async (id: string): Promise<IProjectCategory> => {
    const url = `/project-categories/remove/${id}`;
    const res: IProjectCategory = await axiosClient.delete(url) as IProjectCategory;
    return res;
  },

  getProjectCategories: async(data: ISearchBy | null): Promise<IProjectCategoryResGetAll> => {
    // formToParameter
    let params: ISearchBy = {
      sortBy: "createdAt",
      sortType: data?.sortType || "asc"
    };

    if (data != null) {
      // filter by customer Id
      if (data.customerId) {
        params = { customer: data.customerId, ...params };
      }

      // filter by name
      if (data.name) {
        params = { name: data.name, ...params };
      }
        
    }
    const url = `/project-categories?${formToParameter(params)}`;        
    const res: IProjectCategoryResGetAll = await axiosClient.get(url) as IProjectCategoryResGetAll;
    return res;
  },

}

export default projectCategoriesApi;