import { axiosClient, formToParameter } from './axiosClient';
import { IBlog, IBlogReqCreate, IBlogResGetAll } from 'src/shared/types/blog';
import { ISearchBy } from 'src/shared/types/searchBy';

const blogsApi = {
  postCreate: async (jsonObj: IBlogReqCreate): Promise<IBlog> => {
    const url = '/blogs';
    const res: IBlog = (await axiosClient.post(url, jsonObj)) as IBlog;
    return res;
  },

  getReadById: async (id: string): Promise<IBlog> => {
    const url = `/blogs/${id}`;
    const res: IBlog = (await axiosClient.get(url)) as IBlog;
    return res;
  },

  updateById: async (id: string, jsonObj: IBlogReqCreate): Promise<IBlog> => {
    const url = `/blogs/${id}`;
    const res: IBlog = (await axiosClient.patch(url, jsonObj)) as IBlog;
    return res;
  },

  deleteById: async (id: string): Promise<IBlog> => {
    const url = `/blogs/delete/${id}`;
    const res: IBlog = (await axiosClient.patch(url)) as IBlog;
    return res;
  },
  // only for superAdmin
  removeById: async (id: string): Promise<IBlog> => {
    const url = `/blogs/remove/${id}`;
    const res: IBlog = (await axiosClient.delete(url)) as IBlog;
    return res;
  },

  // Đặt bài viết phát hành hoặc không
  setPublishById: async (id: string): Promise<IBlog> => {
    const url = `/blogs/setpublish/${id}`;
    const res: IBlog = (await axiosClient.post(url)) as IBlog;
    return res;
  },

  // cho phép comment tại bài viết hoặc không
  setCommetsById: async (id: string): Promise<IBlog> => {
    const url = `/blogs/setcomments/${id}`;
    const res: IBlog = (await axiosClient.post(url)) as IBlog;
    return res;
  },

  getAllBlogs: async (data: ISearchBy | null): Promise<IBlogResGetAll> => {
    let params: ISearchBy = {
      sortBy: data?.sortBy || 'createdAt',
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
      // filter by date
      if (data.fromDate) {
        params = { fromDate: data.fromDate, ...params };
      }
      if (data.toDate) {
        params = { toDate: data.toDate, ...params };
      }
    }
    const url = `/blogs?${formToParameter(params)}`;
    const res: IBlogResGetAll = (await axiosClient.get(url)) as IBlogResGetAll;
    return res;
  }
};
export default blogsApi;
