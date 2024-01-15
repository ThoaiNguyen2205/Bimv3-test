import { ISearchBy, } from 'src/shared/types/searchBy';
import { IUclass, IUclassReqCreate, IUclassResGetAll } from "src/shared/types/uclass";
import { axiosClient, formToParameter } from "./axiosClient";
import { DeleteData } from 'src/shared/types/deleteData';

const userclassesApi = {

    postCreate: async (jsonObj: IUclassReqCreate): Promise<IUclass> => {
        const url = "/user-classes";
        const res: IUclass = await axiosClient.post(url, jsonObj) as IUclass;
        return res;
    },

    getReadById: async (id: string): Promise<IUclass> => {
        const url = `/user-classes/${id}`;
        const res: IUclass = await axiosClient.get(url) as IUclass;
        return res;
    },

    updateById: async (id: string, jsonObj: IUclassReqCreate): Promise<IUclass> => {
        const url = `/user-classes/${id}`;
        const res: IUclass = await axiosClient.patch(url, jsonObj) as IUclass;
        return res;
    },

    blockById: async (id: string, deleteData: DeleteData): Promise<IUclass> => {
        const url = `/user-classes/block/${id}`;
        const res: IUclass = await axiosClient.patch(url, deleteData) as IUclass;
        return res;
    },

    setKeyById: async (id: string, deleteData: DeleteData): Promise<IUclass> => {
        const url = `/user-classes/setkey/${id}`;
        const res: IUclass = await axiosClient.patch(url, deleteData) as IUclass;
        return res;
    },

    deleteById: async (id: string, deleteData: DeleteData): Promise<IUclass> => {
        const url = `/user-classes/delete/${id}`;
        const res: IUclass = await axiosClient.patch(url, deleteData) as IUclass;
        return res;
    },
    
    removeById: async (id: string): Promise<IUclass> => {
        const url = `/user-classes/remove/${id}`;
        const res: IUclass = await axiosClient.delete(url) as IUclass;
        return res;
    }, 

    getUserClass: async (data: ISearchBy | null): Promise<IUclassResGetAll> => {
        let params: ISearchBy = {
            sortBy: "createdAt",
            sortType: data?.sortType || "desc"
        };

        if (data != null) {
            // filter by User
            if (data.userId) {
                params = { 
                    user: data.userId, 
                    ...params 
                };
            }

            // filter by Customer
            if (data.customerId) {
                params = { 
                    customer: data.customerId,
                    ...params 
                };
            }

            // filter by Group
            if (data.groupId) {
                params = { 
                    groupId: data.groupId,
                    ...params 
                };
            }
        }
        
        const url = `/user-classes?${formToParameter(params)}`;
        const res: IUclassResGetAll = await axiosClient.get(url) as IUclassResGetAll;
        return res;
    },

    joinedCheck: async (cid: string, email: string) => {
        const url = `/user-classes/joinedchecker/${cid}/${email}`;
        const res: string = await axiosClient.get(url) as string;
        return res;
    }
}

export default userclassesApi; 