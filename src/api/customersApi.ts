import { ISearchBy } from 'src/shared/types/searchBy';
import { ICustomerReqCreate, ICustomer, ICustomerResGetAll } from "src/shared/types/customer";
import { axiosClient, formToParameter } from "./axiosClient";
import { DeleteData } from 'src/shared/types/deleteData';

const customersApi = {

    postCreate: async (jsonObj: ICustomerReqCreate): Promise<ICustomer> => {
        const url = "/customers";
        const res: ICustomer = await axiosClient.post(url, jsonObj) as ICustomer;
        return res;
    },

    getReadById: async (id: string): Promise<ICustomer> => {
        const url = `/customers/${id}`;
        const res: ICustomer = await axiosClient.get(url) as ICustomer; 
        return res;
    },

    updateById: async (id: string, jsonObj: ICustomerReqCreate): Promise<ICustomer> => {
        const url = `/customers/${id}`;
        const res: ICustomer = await axiosClient.patch(url, jsonObj) as ICustomer;
        return res;
    },

    deleteById: async (id: string, deleteData: DeleteData): Promise<ICustomer> => {
        const url = `/customers/delete/${id}`;
        const res: ICustomer = await axiosClient.patch(url, deleteData) as ICustomer;
        return res;
    },

    removeById: async (id: string, deleteData: DeleteData): Promise<ICustomer> => {
        const url = `/customers/remove/${id}`;
        const res: ICustomer = await axiosClient.patch(url, deleteData) as ICustomer;
        return res;
    },  

    getCustomer: async(data: ISearchBy | null): Promise<ICustomerResGetAll> => {
        // formToParameter
        let params: ISearchBy = {
            sortBy: "createdAt",
            sortType: data?.sortType || "asc"
        };

        if (data != null) {
            // filter by customer name
            if (data.key) {
                params = { name: data.key, ...params };
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
        const url = `/customers?${formToParameter(params)}`;
        const res: ICustomerResGetAll = await axiosClient.get(url) as ICustomerResGetAll;
        return res;
    },

    blockById: async (id: string): Promise<ICustomer> => {
        const url = `/customers/block/${id}`;
        const res: ICustomer = await axiosClient.post(url) as ICustomer;
        return res;
    },

}

export default customersApi; 