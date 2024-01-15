import { axiosClient, formToParameter } from "./axiosClient";
import { IPropertyValue, IPropertyValueReqCreate, IPropertyValueResGetAll } from "src/shared/types/propertyValue";
import { ISearchBy } from "src/shared/types/searchBy";

const propertyNamesApi = {
  postCreate: async (jsonObj: IPropertyValueReqCreate): Promise<IPropertyValue> => {
    const url = "/property-values";
    const res: IPropertyValue = await axiosClient.post(url, jsonObj) as IPropertyValue;
    return res;
  },

  getReadById: async (id: string): Promise<IPropertyValue> => {
    const url = `/property-values/${id}`;
    const res: IPropertyValue = await axiosClient.get(url) as IPropertyValue;
    return res;
  },

  updateById: async (id: string, jsonObj: IPropertyValueReqCreate): Promise<IPropertyValue> => {
    const url = `/property-values/${id}`;
    const res: IPropertyValue = await axiosClient.patch(url, jsonObj) as IPropertyValue;
    return res;
  },

  removeById: async (id: string): Promise<IPropertyValue> => {
    const url = `/property-values/remove/${id}`;
    const res: IPropertyValue = await axiosClient.delete(url) as IPropertyValue;
    return res;
  },

  removeInNameId: async (nid: string): Promise<IPropertyValue[]> => {
    const url = `/property-values/inname/${nid}`;
    const res: IPropertyValue[] = await axiosClient.delete(url) as IPropertyValue[];
    return res;
  },

  getPropertyValues: async(data: ISearchBy | null): Promise<IPropertyValueResGetAll> => {
    let params: ISearchBy = {
      sortBy: "createdAt",
      sortType: data?.sortType || "asc"
    };
    if (data != null) {
      // search by name
      if (data.name) {
        params = { name: data.name, ...params };
      }
    }

    const url = `/property-values?${formToParameter(params)}`;
    const res: IPropertyValueResGetAll = await axiosClient.get(url) as IPropertyValueResGetAll;  
    return res;
  },

}

export default propertyNamesApi;