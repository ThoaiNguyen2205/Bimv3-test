import { axiosClient, formToParameter } from "./axiosClient";
import { IGroupReqCreate, IGroup, IGroupResGetAll } from '../shared/types/group';
import { DeleteData } from "src/shared/types/deleteData";

const groupsApi = {

    postCreate: async (jsonObj: IGroupReqCreate): Promise<IGroup> => {
        const url = "/groups";
        const res: IGroup = await axiosClient.post(url, jsonObj) as IGroup;
        return res;
    },

    getReadById: async (id: string): Promise<IGroup> => {
        const url = `/groups/${id}`;
        const res: IGroup = await axiosClient.get(url) as IGroup;
        return res;
    },

    updateById: async (id: string, jsonObj: IGroupReqCreate): Promise<IGroup> => {
        const url = `/groups/${id}`;
        const res: IGroup = await axiosClient.patch(url, jsonObj) as IGroup;
        return res;
    },

    deleteById: async (id: string, deleteJson: DeleteData): Promise<IGroup> => {
        const url = `/groups/delete/${id}`;
        const res: IGroup = await axiosClient.patch(url, deleteJson) as IGroup;
        return res;
    },

    removeById: async (id: string): Promise<IGroup> => {
        const url = `/groups/remove/${id}`;
        const res: IGroup = await axiosClient.delete(url) as IGroup;
        return res;
    },

    getByCustomer: async (cusid: string): Promise<IGroupResGetAll> => {
        const params = {
            sortBy: "createdAt",
            sortType: "asc",
            customer: cusid || null
        };

        const url = `/groups?${formToParameter(params)}`;
        const res: IGroupResGetAll = await axiosClient.get(url) as IGroupResGetAll;
        return res;
    },

}

export default groupsApi;