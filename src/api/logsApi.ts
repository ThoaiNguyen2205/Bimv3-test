import { axiosClient, formToParameter } from "./axiosClient";
import { ISystemLog, ISystemLogResGetAll, ISystemLogReqCreate } from "src/shared/types/systemlog";
import { ISearchBy } from "src/shared/types/searchBy";

const logsApi = {

  postCreate: async (jsonObj: ISystemLogReqCreate): Promise<ISystemLog> => {
    const url = "/logs";
    const res: ISystemLog = await axiosClient.post(url, jsonObj) as ISystemLog;
    return res;
  },

  getReadById: async (id: string): Promise<ISystemLog> => {
    const url = `/logs/${id}`;
    const res: ISystemLog = await axiosClient.get(url) as ISystemLog;
    return res;
  },

  getLogs: async(data: ISearchBy | null): Promise<ISystemLogResGetAll> => {
    // formToParameter
    let params: ISearchBy = {
        sortBy: "createdAt",
        sortType: data?.sortType || "asc"
    };

    if (data != null) {
      // filter by customer
      if (data.customerId) {
        params = { customer: data.customerId, ...params };
      }
      
      // filter by father
      if (data.father) {
        params = { father: data.father, ...params }
      }
    }
    const url = `/logs?${formToParameter(params)}`;        
    const res: ISystemLogResGetAll = await axiosClient.get(url) as ISystemLogResGetAll;
    return res;
},

}

export default logsApi;