import { ISearchBy } from 'src/shared/types/searchBy';
import { IBimnextApp, IBimnextAppReqCreate, IBimnextAppResGetAll, IBimnextAppRemoveMany } from "src/shared/types/bimnextApp";
import { axiosClient, formToParameter } from "./axiosClient";

const bimnextAppsApi = {

  postCreate: async (jsonObj: IBimnextAppReqCreate): Promise<IBimnextApp> => {
    const url = "/bimnext-apps";
    const res: IBimnextApp = await axiosClient.post(url, jsonObj) as IBimnextApp;  
    return res;
  },

  getReadById: async (id: string): Promise<IBimnextApp> => {
    const url = `/bimnext-apps/${id}`;
    const res: IBimnextApp = await axiosClient.get(url) as IBimnextApp;  
    return res;
  },

  updateById: async (id: string, jsonObj: IBimnextAppReqCreate): Promise<IBimnextApp> => {
    const url = `/bimnext-apps/${id}`;
    const res: IBimnextApp = await axiosClient.patch(url, jsonObj) as IBimnextApp;  
    return res;
  },

  removeById: async (id: string): Promise<any> => {
    const url = `/bimnext-apps/remove/${id}`;
    const res = await axiosClient.delete(url);  
    return res;
  },

  removeInCustomer: async (id: string): Promise<IBimnextAppRemoveMany> => {
    const url = `/bimnext-apps/remove/customer/${id}`;
    const res: IBimnextAppRemoveMany = await axiosClient.delete(url) as IBimnextAppRemoveMany;  
    return res;
  }, 

  getByCustomer: async (cid: string): Promise<IBimnextAppResGetAll> => {
    const params: ISearchBy = {
      sortBy: "createdAt",
      sortType: "desc",
      customer: cid || null
    };
    const url = `/bimnext-apps?${formToParameter(params)}`;
    const res: IBimnextAppResGetAll = await axiosClient.get(url) as IBimnextAppResGetAll;  
    return res;
  },

}

export default bimnextAppsApi; 