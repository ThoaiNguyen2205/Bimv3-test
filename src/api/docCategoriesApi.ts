import { axiosClient, formToParameter } from "./axiosClient";
import { IDocCategory, IDocCategoryReqCreate, IDocCategoryResGetAll, IDocCategoryTreeData } from "src/shared/types/docCategory";

const docCategoriesApi = {

  postCreate: async (jsonObj: IDocCategoryReqCreate): Promise<IDocCategory> => {
    const url = "/doc-categories";
    const res: IDocCategory = await axiosClient.post(url, jsonObj) as IDocCategory;
    return res;
  },

  getReadById: async (id: string): Promise<IDocCategory> => {
    const url = `/doc-categories/${id}`;
    const res: IDocCategory = await axiosClient.get(url) as IDocCategory;
    return res;
  },

  updateById: async (id: string, jsonObj: IDocCategoryReqCreate): Promise<IDocCategory> => {
    const url = `/doc-categories/${id}`;
    const res: IDocCategory = await axiosClient.patch(url, jsonObj) as IDocCategory;
    return res;
  },

  deleteById: async (id: string): Promise<IDocCategory> => {
    const url = `/doc-categories/delete/${id}`;
    const res: IDocCategory = await axiosClient.patch(url) as IDocCategory;
    return res;
  },

  removeById: async (id: string): Promise<IDocCategory> => {
    const url = `/doc-categories/remove/${id}`;
    const res: IDocCategory = await axiosClient.delete(url) as IDocCategory;
    return res;
  },

  // only for superAdmin
  blockById: async (id: string): Promise<IDocCategory> => {
    const url = `/doc-categories/block/${id}`;
    const res: IDocCategory = await axiosClient.post(url) as IDocCategory;
    return res;
  },

  getAllDocCategories: async (name: string | null): Promise<IDocCategoryResGetAll> => {
    const params = {
      sortBy: "createdAt",
      sortType: "asc",
      name: name || null,
    };

    const url = `/doc-categories?${formToParameter(params)}`;        
    const res: IDocCategoryResGetAll = await axiosClient.get(url) as IDocCategoryResGetAll;
    return res;
  },

  getTreeData: async (): Promise<IDocCategoryTreeData[]> => {
    const url = `/doc-categories/treedata/gettree`;        
    const res: IDocCategoryTreeData[] = await axiosClient.get(url) as IDocCategoryTreeData[];
    return res;
  },

}

export default docCategoriesApi;