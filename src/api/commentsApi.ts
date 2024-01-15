import { axiosClient, formToParameter } from './axiosClient';
import {
  IMarkup,
  IMarkupReqCreate,
  IMarkupResGetAll
} from 'src/shared/types/markup';
import {
  IComment,
  ICommentReqCreate,
  ICommentResGetAll
} from 'src/shared/types/comment';
import { DeleteData } from 'src/shared/types/deleteData';
import { ISearchBy } from 'src/shared/types/searchBy';

const commentsApi = {
  postCreate: async (jsonObj: ICommentReqCreate): Promise<IComment> => {
    const url = '/comments';
    const res: IComment = (await axiosClient.post(url, jsonObj)) as IComment;
    return res;
  },

  getReadById: async (id: string): Promise<IComment> => {
    const url = `/comments/${id}`;
    const res: IComment = (await axiosClient.get(url)) as IComment;
    return res;
  },

  updateById: async (
    id: string,
    jsonObj: ICommentReqCreate
  ): Promise<IComment> => {
    const url = `/comments/${id}`;
    const res: IComment = (await axiosClient.patch(url, jsonObj)) as IComment;
    return res;
  },

  deleteById: async (id: string): Promise<IMarkup> => {
    const url = `/comments/delete/${id}`;
    const res: IMarkup = (await axiosClient.patch(url)) as IMarkup;
    return res;
  },

  removeById: async (id: string): Promise<IMarkup> => {
    const url = `/comments/remove/${id}`;
    const res: IMarkup = (await axiosClient.delete(url)) as IMarkup;
    return res;
  },

  getAllComments: async (
    data: ISearchBy | null
  ): Promise<ICommentResGetAll> => {
    let params: ISearchBy = {
      sortBy: 'createdAt',
      sortType: data?.sortType || 'asc'
    };
    if (data != null) {
      // filter by fatherId
      if (data.fatherId) {
        params = { fatherId: data.fatherId, ...params };
      }
    }

    const url = `/comments?${formToParameter(params)}`;
    const res: ICommentResGetAll = (await axiosClient.get(
      url
    )) as ICommentResGetAll;
    return res;
  }
};
export default commentsApi;
