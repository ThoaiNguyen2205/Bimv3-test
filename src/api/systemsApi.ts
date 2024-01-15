import { axiosClient, formToParameter } from "./axiosClient";
import { ISystemReqCreate, ISystemResGetAll, ISystem } from '../shared/types/system';
import { ISearchBy } from "src/shared/types/searchBy";

const systemsApi = {

  postCreate: async (jsonObj: ISystemReqCreate): Promise<ISystem> => {
    const url = "/systems";
    const res: ISystem = await axiosClient.post(url, jsonObj) as ISystem;
    return res;
  },

  getReadById: async (id: string): Promise<ISystem> => {
    const url = `/systems/${id}`;
    const res: ISystem = await axiosClient.get(url) as ISystem;
    return res;
  },

  updateById: async (id: string, jsonObj: ISystemReqCreate): Promise<ISystem> => {
    const url = `/systems/${id}`;
    const res: ISystem = await axiosClient.patch(url, jsonObj) as ISystem;
    return res;
  },

  deleteById: async (id: string): Promise<ISystem> => {
    const url = `/systems/${id}`;
    const res: ISystem = await axiosClient.delete(url) as ISystem;
    return res;
  },

  removeById: async (id: string): Promise<ISystem> => {
    const url = `/systems/remove/${id}`;
    const res: ISystem = await axiosClient.delete(url) as ISystem;
    return res;
  },

  getAlls: async (): Promise<ISystemResGetAll> => {
    let params: ISearchBy = {
      sortBy: 'createdAt',
      sortType: 'desc'
    };
    const url = `/systems?${formToParameter(params)}`;
    const res: ISystemResGetAll = await axiosClient.get(url) as ISystemResGetAll;
    return res;
  },

  getByName: async (name: string): Promise<ISystem | null> => {
    const params = { name: name };
    const url = `/systems?${formToParameter(params)}`;
    const getAll: ISystemResGetAll = await axiosClient.get(url) as ISystemResGetAll;
    let res = null;
    if (getAll.data !== undefined) {
      res = getAll.data[0];
    }
    return res;
  },

}

export default systemsApi;