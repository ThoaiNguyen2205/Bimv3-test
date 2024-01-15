import { axiosClient, formToParameter } from "./axiosClient";
import { IInvitationReqCreate, IInvitation, IInvitationResGetAll } from '../shared/types/invitation';
import { ISearchBy } from "src/shared/types/searchBy";
import { DeleteData } from "src/shared/types/deleteData";

const invitationsApi = {

  postCreate: async (jsonObj: IInvitationReqCreate): Promise<IInvitation> => {
    const url = '/invitations';
    const res: IInvitation = await axiosClient.post(url, jsonObj) as IInvitation;
    return res;
  },

  getReadById: async (id: string): Promise<IInvitation> => {
    const url = '/invitations/' + id;
    const res: IInvitation = await axiosClient.get(url) as IInvitation;
    return res;
  },

  // Không sử dụng
  updateById: async (id: string, jsonObj: IInvitationReqCreate): Promise<IInvitation> => {
    const url = '/invitations/'+ id;
    const res: IInvitation = await axiosClient.patch(url, jsonObj) as IInvitation;
    return res;
  },

  deleteById: async (id: string, deleteJson: DeleteData): Promise<IInvitation> => {
    const url = `/invitations/delete/${id}`;
    const res: IInvitation = await axiosClient.patch(url, deleteJson) as IInvitation;
    return res;
  },

  removeById: async (id: string): Promise<IInvitation> => {
    const url = '/invitations/remove/' + id;
    const res: IInvitation = await axiosClient.delete(url) as IInvitation;
    return res;
  },

  getInvitations: async (data: ISearchBy | null): Promise<IInvitationResGetAll> => {
    let params: ISearchBy = {
      sortBy: 'createdAt',
      sortType: data?.sortType || 'desc'
    };

    if (data != null) {
      // filter by Email
      if (data.email) {
        params = { 
          email: data.email, 
          ...params 
        };
      }

      // filter by Customer
      if (data.customerId) {
        params = { 
          customer: data.customerId,
          ...params 
        };
      }
    }
    const url = '/invitations?' + formToParameter(params);
    const res: IInvitationResGetAll = await axiosClient.get(url) as IInvitationResGetAll;
    return res;
  },

  patchComfirmById: async (id: string): Promise<IInvitation> => {
    const url = '/invitations/confirm/'+ id;
    const res: IInvitation = await axiosClient.patch(url) as IInvitation;
    return res;
  },

}

export default invitationsApi; 