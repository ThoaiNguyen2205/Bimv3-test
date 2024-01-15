import { axiosClient, formToParameter } from "./axiosClient";
import { ISearchBy } from "src/shared/types/searchBy";
import { IUserInDocument, IUserInDocumentReqCreate, IUserInDocumentResGetAll } from "src/shared/types/usersInDocument";

const usersInDocumentsApi = {

  postCreate: async (jsonObj: IUserInDocumentReqCreate): Promise<IUserInDocument> => {
    const url = "/users-in-documents";
    const res: IUserInDocument = await axiosClient.post(url, jsonObj) as IUserInDocument;
    return res;
  },

  getReadById: async (id: string): Promise<IUserInDocument> => {
    const url = `/users-in-documents/${id}`;
    const res: IUserInDocument = await axiosClient.get(url) as IUserInDocument;
    return res;
  },

  removeById: async (id: string): Promise<IUserInDocument> => {
    const url = `/users-in-documents/remove/${id}`;
    const res: IUserInDocument = await axiosClient.delete(url) as IUserInDocument;
    return res;
  },

  deleteInDocument: (pid: string): Promise<any> => {
    const url = `/users-in-documents/indocument/${pid}`;
    return axiosClient.delete(url);
  },

  getUsersInDocument: async(data: ISearchBy | null): Promise<IUserInDocumentResGetAll> => {
    let params: ISearchBy = {
      sortBy: "createdAt",
      sortType: data?.sortType || "asc"
    };
    if (data != null) {
      // filter by document
      if (data.document) {
        params = { document: data.document, ...params };
      }

      // search by user
      if (data.user) {
        params = { user: data.user, ...params };
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
  
    const url = `/users-in-documents?${formToParameter(params)}`;
    const res: IUserInDocumentResGetAll = await axiosClient.get(url) as IUserInDocumentResGetAll;  
    return res;
  },

}

export default usersInDocumentsApi;