import { axiosClient, formToParameter } from "./axiosClient";
import { IDashboardData, INotification, INotificationReqCreate, INotificationResGetAll } from "src/shared/types/notification";
import { ISearchBy } from "src/shared/types/searchBy";

const notificationsApi = {

  postCreate: async (jsonObj: INotificationReqCreate): Promise<INotification> => {
    const url = "/notifications";
    const res: INotification = await axiosClient.post(url, jsonObj) as INotification;
    return res;
  },

  getReadById: async (id: string): Promise<INotification> => {
    const url = `/notifications/${id}`;
    const res: INotification = await axiosClient.get(url) as INotification;
    return res;
  },

  updateById: async (id: string, jsonObj: INotificationReqCreate): Promise<INotification> => {
    const url = `/notifications/${id}`;
    const res: INotification = await axiosClient.patch(url, jsonObj) as INotification;
    return res;
  },

  deleteById: async (id: string): Promise<INotification> => {
    const url = `/notifications/delete/${id}`;
    const res: INotification = await axiosClient.patch(url) as INotification;
    return res;
  },

  removeById: async (id: string): Promise<INotification> => {
    const url = `/notifications/remove/${id}`;
    const res: INotification = await axiosClient.delete(url) as INotification;
    return res;
  },

  getAllNotifications: async (data: ISearchBy | null): Promise<INotificationResGetAll> => {
    let params: ISearchBy = {
      sortBy: "createdAt",
      sortType: data?.sortType || "asc"
    };
    if (data != null) {
      // filter by customer
      if (data.customer) {
        params = { customer: data.customer, ...params };
      }

      // filter by to user
      if (data.to) {
        params = { to: data.to, ...params };
      }
      
    }

    const url = `/notifications?${formToParameter(params)}`;
    const res: INotificationResGetAll = await axiosClient.get(url) as INotificationResGetAll;
    return res;
  },

  getDashboardData: async (cus: string): Promise<IDashboardData> => {
    const url = `/notifications/customer/dashboard/${cus}`;
    const res: IDashboardData = await axiosClient.get(url) as IDashboardData;
    return res;
  },

}

export default notificationsApi;