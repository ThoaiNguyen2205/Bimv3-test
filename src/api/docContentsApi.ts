import { axiosClient, formToParameter } from "./axiosClient";
import { IDocContent, IDocContentReqCreate, IDocContentResGetAll } from "src/shared/types/docContent";
import { ISearchBy } from "src/shared/types/searchBy";

const docContentsApi = {

  postCreate: async (jsonObj: IDocContentReqCreate): Promise<IDocContent> => {
    const url = "/doc-contents";
    const res: IDocContent = await axiosClient.post(url, jsonObj) as IDocContent;
    return res;
  },

  getReadById: async (id: string): Promise<IDocContent> => {
    const url = `/doc-contents/${id}`;
    const res: IDocContent = await axiosClient.get(url) as IDocContent;
    return res;
  },

  updateById: async (id: string, jsonObj: IDocContentReqCreate): Promise<IDocContent> => {
    const url = `/doc-contents/${id}`;
    const res: IDocContent = await axiosClient.patch(url, jsonObj) as IDocContent;
    return res;
  },

  deleteById: async (id: string): Promise<IDocContent> => {
    const url = `/doc-contents/delete/${id}`;
    const res: IDocContent = await axiosClient.patch(url) as IDocContent;
    return res;
  },

  // only for superAdmin
  removeById: async (id: string): Promise<IDocContent> => {
    const url = `/doc-contents/remove/${id}`;
    const res: IDocContent = await axiosClient.delete(url) as IDocContent;
    return res;
  },

  // Đặt bài viết phát hành hoặc không
  setPublishById: async (id: string): Promise<IDocContent> => {
    const url = `/doc-contents/setpublish/${id}`;
    const res: IDocContent = await axiosClient.post(url) as IDocContent;
    return res;
  },

  // Khi tải các nhóm
  getAllContents: async(data: ISearchBy | null): Promise<IDocContentResGetAll> => {
    let params: ISearchBy = {
      sortBy: "createdAt",
      sortType: data?.sortType || "asc"
    };
    if (data != null) {
      // filter by index
      if (data.index) {
        params = { index: data.index, ...params };
      }

      // search by title
      if (data.filterString) {
        params = { filterString: data.filterString, ...params };
      }

      // filter by createdBy
      if (data.createdBy) {
        params = { createdBy: data.createdBy, ...params };
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
  
    const url = `/doc-contents?${formToParameter(params)}`;
    const res: IDocContentResGetAll = await axiosClient.get(url) as IDocContentResGetAll;  
    return res;
  },

}

export default docContentsApi;