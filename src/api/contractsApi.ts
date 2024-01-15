import { ISearchBy } from 'src/shared/types/searchBy';
import { IContract, IContractReqCreate, IContractResGetAll } from "src/shared/types/contract";
import { axiosClient, formToParameter } from "./axiosClient";

const contractsApi = {

  postCreate: async (jsonObj: IContractReqCreate): Promise<IContract> => {
    const url = "/contracts";
    const res: IContract = await axiosClient.post(url, jsonObj) as IContract;  
    return res;
  },

  getReadById: async (id: string): Promise<IContract> => {
    const url = `/contracts/${id}`;
    const res: IContract = await axiosClient.get(url) as IContract;  
    return res;
  },

  updateById: async (id: string, jsonObj: IContractReqCreate): Promise<IContract> => {
    const url = `/contracts/${id}`;
    const res: IContract = await axiosClient.patch(url, jsonObj) as IContract;  
    return res;
  },

  deleteById: async (id: string): Promise<IContract> => {
    const url = `/contracts/${id}`;
    const res: IContract = await axiosClient.delete(url) as IContract;  
    return res;
  },

  removeById: async (id: string): Promise<IContract> => {
    const url = `/contracts/remove/${id}`;
    const res: IContract = await axiosClient.delete(url) as IContract;  
    return res;
  }, 

  getContract: async(data: ISearchBy | null): Promise<IContractResGetAll> => {
    let params: ISearchBy = {
      sortBy: "createdAt",
      sortType: data?.sortType || "asc"
    };
    if (data != null) {
      // filter by customer
      if (data.customer) {
        params = { customer: data.customer, ...params };
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

    const url = `/contracts?${formToParameter(params)}`;
    const res: IContractResGetAll = await axiosClient.get(url) as IContractResGetAll;  
    return res;
  },

  getLastedByCustomer: async(cid: string): Promise<IContract> => {
    const url = `/contracts/lasted/${cid}`;
    const res: IContract = await axiosClient.get(url) as IContract;  
    return res;
  },

  getDiskSize: async(id: string): Promise<number> => {
    const url = `/contracts/disksize/${id}`;
    const res: number = await axiosClient.get(url) as number;  
    return res;
  }

};

export default contractsApi; 