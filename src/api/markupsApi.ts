import { axiosClient, formToParameter } from "./axiosClient";
import { IMarkup, IMarkupReqCreate, IMarkupResGetAll, IMarkupV3ResGetAll } from "src/shared/types/markup";
import { DeleteData } from "src/shared/types/deleteData";
import { ISearchBy } from "src/shared/types/searchBy";

const markupsApi = {

  postCreate: async (jsonObj: IMarkupReqCreate): Promise<IMarkup> => {
    const url = "/markupviews";
    const res: IMarkup = await axiosClient.post(url, jsonObj) as IMarkup;
    return res;
  },

  getReadById: async (id: string): Promise<IMarkup> => {
    const url = `/markupviews/${id}`;
    const res: IMarkup = await axiosClient.get(url) as IMarkup;
    return res;
  },

  updateById: async (id: string, jsonObj: IMarkupReqCreate): Promise<IMarkup> => {
    const url = `/markupviews/${id}`;
    const res: IMarkup = await axiosClient.patch(url, jsonObj) as IMarkup;
    return res;
  },

  setApproved: async (id: string): Promise<IMarkup> => {
    const url = `/markupviews/setapproved/${id}`;
    const res: IMarkup = await axiosClient.patch(url) as IMarkup;
    return res;
  },

  cancelApproved: async (id: string): Promise<IMarkup> => {
    const url = `/markupviews/cancelapproved/${id}`;
    const res: IMarkup = await axiosClient.patch(url) as IMarkup;
    return res;
  },

  deleteById: async (id: string, deleteJson: DeleteData): Promise<IMarkup> => {
    const url = `/markupviews/delete/${id}`;
    const res: IMarkup = await axiosClient.patch(url, deleteJson) as IMarkup;
    return res;
  },

  removeById: async (id: string): Promise<IMarkup> => {
    const url = `/markupviews/remove/${id}`;
    const res: IMarkup = await axiosClient.delete(url) as IMarkup;
    return res;
  },

  getAllMarkups: async (data: ISearchBy | null): Promise<IMarkupResGetAll> => {
    let params: ISearchBy = {
      sortBy: 'createdAt',
      sortType: data?.sortType || 'asc',
    };
    if (data != null) {
      // filter by task
      if (data.task) {
        params = { task: data.task, ...params };
      }

      // search by fileid
      if (data.fileid) {
        params = { fileid: data.fileid, ...params };
      }

    }

    const url = `/markupviews?${formToParameter(params)}`;
    const res: IMarkupResGetAll = (await axiosClient.get(url)) as IMarkupResGetAll;
    return res;
  },

  // =====================================================================
  // upgrade v3
  
  // data must have task and fileid
  upgradev3FindAllMarkups: async (data: ISearchBy | null): Promise<IMarkupV3ResGetAll> => {
    let params: ISearchBy = {
      sortBy: 'createdAt',
      sortType: data?.sortType || 'asc',
    };
    if (data != null) {
      // filter by task
      if (data.task) {
        params = { task: data.task, ...params };
      }

      // search by fileid
      if (data.fileid) {
        params = { fileid: data.fileid, ...params };
      }
    }

    const url = `/markupviews/upgradev3/findall?${formToParameter(params)}`;
    const res: IMarkupV3ResGetAll = (await axiosClient.get(url)) as IMarkupV3ResGetAll;
    return res;
  },

}

export default markupsApi;