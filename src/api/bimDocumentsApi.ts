import { axiosClient, formToParameter } from './axiosClient';
import {
  IBimDocument,
  IBimDocumentReqCreate,
  IBimDocumentResGetAll
} from 'src/shared/types/bimDocument';
import { ISearchBy } from 'src/shared/types/searchBy';

const bimDocumentsApi = {
  postCreate: async (jsonObj: IBimDocumentReqCreate): Promise<IBimDocument> => {
    const url = '/bim-documents';
    const res: IBimDocument = (await axiosClient.post(
      url,
      jsonObj
    )) as IBimDocument;
    return res;
  },

  getReadById: async (id: string): Promise<IBimDocument> => {
    const url = `/bim-documents/${id}`;
    const res: IBimDocument = (await axiosClient.get(url)) as IBimDocument;
    return res;
  },

  updateById: async (
    id: string,
    jsonObj: IBimDocumentReqCreate
  ): Promise<IBimDocument> => {
    const url = `/bim-documents/${id}`;
    const res: IBimDocument = (await axiosClient.patch(
      url,
      jsonObj
    )) as IBimDocument;
    return res;
  },

  deleteById: async (id: string): Promise<IBimDocument> => {
    const url = `/bim-documents/delete/${id}`;
    const res: IBimDocument = (await axiosClient.patch(url)) as IBimDocument;
    return res;
  },
  // only for superAdmin
  removeById: async (id: string): Promise<IBimDocument> => {
    const url = `/bim-documents/remove/${id}`;
    const res: IBimDocument = (await axiosClient.delete(url)) as IBimDocument;
    return res;
  },

  // Đặt bài viết phát hành hoặc không
  setPublishById: async (id: string): Promise<IBimDocument> => {
    const url = `/bim-documents/setpublish/${id}`;
    const res: IBimDocument = (await axiosClient.post(url)) as IBimDocument;
    return res;
  },

  // cho phép comment tại bài viết hoặc không
  setCommetsById: async (id: string): Promise<IBimDocument> => {
    const url = `/bim-documents/setcomments/${id}`;
    const res: IBimDocument = (await axiosClient.post(url)) as IBimDocument;
    return res;
  },
  // Khi tải các nhóm
  getAllDocuments: async (
    data: ISearchBy | null
  ): Promise<IBimDocumentResGetAll> => {
    let params: ISearchBy = {
      sortBy: 'createdAt',
      sortType: data?.sortType || 'asc'
    };
    if (data != null) {
      // search by title
      if (data.title) {
        params = { title: data.title, ...params };
      }
      // search by description
      if (data.description) {
        params = { description: data.description, ...params };
      }
      // filter by category
      if (data.category) {
        params = { category: data.category, ...params };
      }

      // filter by createdBy
      if (data.createdBy) {
        params = { createdBy: data.createdBy, ...params };
      }

      // filter by current page
      if (data.page) {
        params = { pageNumber: data.page, ...params };
      }

      // filter by page size
      if (data.size) {
        params = { itemPerPage: data.size, ...params };
      }
    }

    const url = `/bim-documents?${formToParameter(params)}`;
    const res: IBimDocumentResGetAll = (await axiosClient.get(
      url
    )) as IBimDocumentResGetAll;
    return res;
  },

  getForUser: async (uid: string): Promise<IBimDocument[]> => {
    const url = `/bim-documents/foruser/${uid}`;
    const res = (await axiosClient.get(url)) as IBimDocument[];
    return res;
  }
};

export default bimDocumentsApi;
