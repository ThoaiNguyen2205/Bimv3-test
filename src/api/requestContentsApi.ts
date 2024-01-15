import { axiosClient, formToParameter } from "./axiosClient";
import { IRequestContent, IRequestContentDetails, IRequestContentReqCreate, IRequestContentResGetAll } from "src/shared/types/requestContent";
import { DeleteData } from "src/shared/types/deleteData";
import { ISearchBy } from "src/shared/types/searchBy";

const requestContentsApi = {

  postCreate: async (jsonObj: IRequestContentReqCreate): Promise<IRequestContent> => {
    const url = "/request-contents";
    const res: IRequestContent = await axiosClient.post(url, jsonObj) as IRequestContent;
    return res;
  },

  getReadById: async (id: string): Promise<IRequestContent> => {
    const url = `/request-contents/${id}`;
    const res: IRequestContent = await axiosClient.get(url) as IRequestContent;
    return res;
  },

  updateById: async (id: string, jsonObj: IRequestContentReqCreate): Promise<IRequestContent> => {
    const url = `/request-contents/${id}`;
    const res: IRequestContent = await axiosClient.patch(url, jsonObj) as IRequestContent;
    return res;
  },

  confirmById: async (id: string, deleteJson: DeleteData): Promise<IRequestContent> => {
    const url = `/request-contents/confirm/${id}`;
    const res: IRequestContent = await axiosClient.patch(url, deleteJson) as IRequestContent;
    return res;
  },

  approveById: async (id: string, deleteJson: DeleteData): Promise<IRequestContent> => {
    const url = `/request-contents/approve/${id}`;
    const res: IRequestContent = await axiosClient.patch(url, deleteJson) as IRequestContent;
    return res;
  },

  deleteById: async (id: string, deleteJson: DeleteData): Promise<IRequestContent> => {
    const url = `/request-contents/delete/${id}`;
    const res: IRequestContent = await axiosClient.patch(url, deleteJson) as IRequestContent;
    return res;
  },

  removeById: async (id: string): Promise<IRequestContent> => {
    const url = `/request-contents/remove/${id}`;
    const res: IRequestContent = await axiosClient.delete(url) as IRequestContent;
    return res;
  },

  getAllRequestContents: async (data: ISearchBy | null): Promise<IRequestContentResGetAll> => {
    let params: ISearchBy = {
      sortBy: 'createdAt',
      sortType: data?.sortType || 'asc',
    };
    if (data != null) {
      // filter by request
      if (data.request) {
        params = { request: data.request, ...params };
      }

    }

    const url = `/request-contents?${formToParameter(params)}`;
    const res: IRequestContentResGetAll = (await axiosClient.get(url)) as IRequestContentResGetAll;
    return res;
  },

  getRequestContentDetails:  async (requestId: string, folderId: string, userId: string): Promise<IRequestContentDetails> => {
    const url = `/request-contents/load/details/${requestId}/${folderId}/${userId}`;
    const res: IRequestContentDetails = await axiosClient.get(url) as IRequestContentDetails;
    return res;
  },


}

export default requestContentsApi;