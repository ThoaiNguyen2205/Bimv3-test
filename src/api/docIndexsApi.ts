import { axiosClient, formToParameter } from './axiosClient';
import {
  IDocIndex,
  IDocIndexReqCreate,
  IDocIndexResGetAll,
  IDocIndexTreeData,
} from 'src/shared/types/docIndex';
import { ISearchBy } from 'src/shared/types/searchBy';
const docIndexsApi = {
  postCreate: async (jsonObj: IDocIndexReqCreate): Promise<IDocIndex> => {
    const url = '/doc-indexs';
    const res: IDocIndex = (await axiosClient.post(url, jsonObj)) as IDocIndex;
    return res;
  },

  getReadById: async (id: string): Promise<IDocIndex> => {
    const url = `/doc-indexs/${id}`;
    const res: IDocIndex = (await axiosClient.get(url)) as IDocIndex;
    return res;
  },
  updateById: async (id: string, jsonObj: IDocIndexReqCreate): Promise<IDocIndex> => {
    const url = `/doc-indexs/${id}`;
    const res: IDocIndex = (await axiosClient.patch(url, jsonObj)) as IDocIndex;
    return res;
  },
  deleteById: async (id: string): Promise<IDocIndex> => {
    const url = `/doc-indexs/delete/${id}`;
    const res: IDocIndex = (await axiosClient.patch(url)) as IDocIndex;
    return res;
  },

  // only for superAdmin
  removeById: async (id: string): Promise<IDocIndex> => {
    const url = `/doc-indexs/remove/${id}`;
    const res: IDocIndex = (await axiosClient.delete(url)) as IDocIndex;
    return res;
  },

  // Đặt bài viết phát hành hoặc không
  setPublishById: async (id: string): Promise<IDocIndex> => {
    const url = `/doc-indexs/setpublish/${id}`;
    const res: IDocIndex = (await axiosClient.post(url)) as IDocIndex;
    return res;
  },

  // Khi tải các nhóm
  getAllIndexs: async (data: ISearchBy | null): Promise<IDocIndexResGetAll> => {
    let params: ISearchBy = {
      sortBy: 'createdAt',
      sortType: data?.sortType || 'asc',
    };
    if (data != null) {
      // filter by name
      if (data.document) {
        params = { document: data.document, ...params };
      }

      // search by title
      if (data.title) {
        params = { title: data.title, ...params };
      }

      // filter by father
      if (data.father) {
        params = { father: data.father, ...params };
      }

      // filter by createdBy
      if (data.createdBy) {
        params = { createdBy: data.createdBy, ...params };
      }

      // filter by updatedBy
      if (data.updatedBy) {
        params = { updatedBy: data.createdBy, ...params };
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

    const url = `/doc-indexs?${formToParameter(params)}`;
    const res: IDocIndexResGetAll = (await axiosClient.get(url)) as IDocIndexResGetAll;
    return res;
  },

  getTreeData: async (did: string): Promise<IDocIndexTreeData[]> => {
    const url = `/doc-indexs/treedata/gettree/${did}`;
    const res: IDocIndexTreeData[] = (await axiosClient.get(url)) as IDocIndexTreeData[];
    return res;
  },
};

export default docIndexsApi;
