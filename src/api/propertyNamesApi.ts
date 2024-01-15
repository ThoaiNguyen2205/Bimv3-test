import { axiosClient, formToParameter } from "./axiosClient";
import { IPropertyName, IPropertyNameReqCreate, IPropertyNameResGetAll } from "src/shared/types/propertyName";
import { DeleteData } from "src/shared/types/deleteData";
import { ISearchBy } from "src/shared/types/searchBy";

const propertyNamesApi = {
  postCreate: async (jsonObj: IPropertyNameReqCreate): Promise<IPropertyName> => {
    const url = "/property-names";
    const res: IPropertyName = await axiosClient.post(url, jsonObj) as IPropertyName;
    return res;
  },

  getReadById: async (id: string): Promise<IPropertyName> => {
    const url = `/property-names/${id}`;
    const res: IPropertyName = await axiosClient.get(url) as IPropertyName;
    return res;
  },

  updateById: async (id: string, jsonObj: IPropertyNameReqCreate): Promise<IPropertyName> => {
    const url = `/property-names/${id}`;
    const res: IPropertyName = await axiosClient.patch(url, jsonObj) as IPropertyName;
    return res;
  },

  deleteById: async (id: string, deleteJson: DeleteData): Promise<IPropertyName> => {
    const url = `/property-names/delete/${id}`;
    const res: IPropertyName = await axiosClient.patch(url, deleteJson) as IPropertyName;
    return res;
  },

  removeById: async (id: string): Promise<IPropertyName> => {
    const url = `/property-names/remove/${id}`;
    const res: IPropertyName = await axiosClient.delete(url) as IPropertyName;
    return res;
  },

  getPropertyNames: async(data: ISearchBy | null): Promise<IPropertyNameResGetAll> => {
    let params: ISearchBy = {
      sortBy: "createdAt",
      sortType: data?.sortType || "asc"
    };
    if (data != null) {
      // filter by customerId
      if (data.customerId) {
        params = { customer: data.customerId, ...params };
      }

      // search by name
      if (data.name) {
        params = { name: data.name, ...params };
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

    const url = `/property-names?${formToParameter(params)}`;
    const res: IPropertyNameResGetAll = await axiosClient.get(url) as IPropertyNameResGetAll;  
    return res;
  },

}

export default propertyNamesApi;