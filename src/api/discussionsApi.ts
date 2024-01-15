import { axiosClient, formToParameter } from "./axiosClient";
import { IDiscussion, IDiscussionReqCreate, IDiscussionResGetAll, IDetailsInfo, IInteractiveData } from "src/shared/types/discussion";
import { IDiscussionTask } from "src/shared/types/mainTask";
import { ISearchBy } from "src/shared/types/searchBy";

const discussionsApi = {

  postCreate: async (jsonObj: IDiscussionReqCreate): Promise<IDiscussion> => {
    const url = "/discussions";
    const res: IDiscussion = await axiosClient.post(url, jsonObj) as IDiscussion;
    return res;
  },

  getReadById: async (id: string): Promise<IDiscussion> => {
    const url = `/discussions/${id}`;
    const res: IDiscussion = await axiosClient.get(url) as IDiscussion;
    return res;
  },

  updateById: async (id: string, jsonObj: IDiscussionReqCreate): Promise<IDiscussion> => {
    const url = `/discussions/${id}`;
    const res: IDiscussion = await axiosClient.patch(url, jsonObj) as IDiscussion;
    return res;
  },

  setSolution: async (id: string): Promise<IDiscussion> => {
    const url = `/discussions/setsolution/${id}`;
    const res: IDiscussion = await axiosClient.patch(url) as IDiscussion;
    return res;
  },

  cancelSolution: async (id: string): Promise<IDiscussion> => {
    const url = `/discussions/cancelsolution/${id}`;
    const res: IDiscussion = await axiosClient.patch(url) as IDiscussion;
    return res;
  },

  deleteById: async (id: string): Promise<IDiscussion> => {
    const url = `/discussions/delete/${id}`;
    const res: IDiscussion = await axiosClient.patch(url) as IDiscussion;
    return res;
  },

  removeById: async (id: string): Promise<IDiscussion> => {
    const url = `/discussions/remove/${id}`;
    const res: IDiscussion = await axiosClient.delete(url) as IDiscussion;
    return res;
  },

  getAllDiscussions: async (data: ISearchBy | null): Promise<IDiscussionResGetAll> => {
    let params: ISearchBy = {
      sortBy: "createdAt",
      sortType: data?.sortType || "asc"
    };
    if (data != null) {
      // filter by relativeid
      if (data.relativeid) {
        params = { relativeid: data.relativeid, ...params };
      }

      // filter by customer
      if (data.customer) {
        params = { customer: data.customer, ...params };
      }

      // filter by createdGroup
      if (data.createdGroup) {
        params = { createdGroup: data.createdGroup, ...params };
      }

      // filter by approvedAt
      if (data.approved) {
        params = { approved: data.approved, ...params };
      }
    }

    const url = `/discussions?${formToParameter(params)}`;
    const res: IDiscussionResGetAll = await axiosClient.get(url) as IDiscussionResGetAll;
    return res;
  },

  postApprove: async (id: string): Promise<IDiscussion> => {
    const url = `/discussions/approve/${id}`;
    const res: IDiscussion = await axiosClient.post(url) as IDiscussion;
    return res;
  },

  postReject: async (id: string): Promise<IDiscussion> => {
    const url = `/discussions/reject/${id}`;
    const res: IDiscussion = await axiosClient.post(url) as IDiscussion;
    return res;
  },

  getDetailsInfo: async (id: string, type: string, trash: string): Promise<IDetailsInfo> => {
    const url = `/discussions/detailsinfo/${id}/${type}/${trash}`;
    const res: IDetailsInfo = await axiosClient.post(url) as IDetailsInfo;
    return res;
  },

  getInteractiveData: async (tid: string, day: number): Promise<IInteractiveData> => {
    const url = `/discussions/interactivesinfo/${tid}/${day}`;
    const res: IInteractiveData = await axiosClient.get(url) as IInteractiveData;
    return res;
  },

  // ===================================================================================
  // Discussion tasks
  getAllDiscussionTasks: async (data: ISearchBy | null, uid: string, role: string, cus: string): Promise<IDiscussionTask[]> => {
    let params: ISearchBy = {
      sortBy: 'createdAt',
      sortType: data?.sortType || 'asc',
    };
    if (data != null) {
      // filter by project
      if (data.project) {
        params = { project: data.project, ...params };
      }

      // search by category
      if (data.category) {
        params = { category: data.category, ...params };
      }

      // filter by name
      if (data.name) {
        params = { name: data.name, ...params };
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
    const url = `/discussions/discussiontasks/getallbyuser/${uid}/${role}/${cus}?${formToParameter(params)}`;
    const res: IDiscussionTask[] = await axiosClient.get(url) as IDiscussionTask[];
    return res;
  },

  // ================================
  // upgrade V3
  upgradev3GetAllDiscussions: async (data: ISearchBy | null): Promise<IDiscussionResGetAll> => {
    let params: ISearchBy = {
      sortBy: "createdAt",
      sortType: data?.sortType || "asc"
    };
    if (data != null) {
      // filter by relativeid
      if (data.relativeid) {
        params = { relativeid: data.relativeid, ...params };
      }
    }

    const url = `/discussions/upgradev3/getalldiscussions?${formToParameter(params)}`;
    const res: IDiscussionResGetAll = await axiosClient.get(url) as IDiscussionResGetAll;
    return res;
  },
}

export default discussionsApi;