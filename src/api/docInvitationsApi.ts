import { axiosClient, formToParameter } from "./axiosClient";
import { IDocInvitation, IDocInvitationReqCreate, IDocInvitationResGetAll } from "src/shared/types/docInvitation";
import { ISearchBy } from "src/shared/types/searchBy";

const docInvitationsApi = {

  postCreate: async (jsonObj: IDocInvitationReqCreate): Promise<IDocInvitation> => {
    const url = '/doc-invitations';
    const res: IDocInvitation = await axiosClient.post(url, jsonObj) as IDocInvitation;
    return res;
  },

  getReadById: async (id: string): Promise<IDocInvitation> => {
    const url = '/doc-invitations/' + id;
    const res: IDocInvitation = await axiosClient.get(url) as IDocInvitation;
    return res;
  },

  // Không sử dụng
  updateById: async (id: string, jsonObj: IDocInvitationReqCreate): Promise<IDocInvitation> => {
    const url = '/doc-invitations/'+ id;
    const res: IDocInvitation = await axiosClient.patch(url, jsonObj) as IDocInvitation;
    return res;
  },

  deleteById: async (id: string): Promise<IDocInvitation> => {
    const url = `/doc-invitations/delete/${id}`;
    const res: IDocInvitation = await axiosClient.patch(url) as IDocInvitation;
    return res;
  },

  removeById: async (id: string): Promise<IDocInvitation> => {
    const url = '/doc-invitations/remove/' + id;
    const res: IDocInvitation = await axiosClient.delete(url) as IDocInvitation;
    return res;
  },

  getInvitations: async (data: ISearchBy | null): Promise<IDocInvitationResGetAll> => {
    let params: ISearchBy = {
      sortBy: 'createdAt',
      sortType: data?.sortType || 'desc'
    };

    if (data != null) {
      // filter by From Email
      if (data.fromEmail) {
        params = { 
          fromEmail: data.fromEmail, 
          ...params 
        };
      }

      if (data.toEmail) {
        params = { 
          toEmail: data.toEmail, 
          ...params 
        };
      }

      // filter by document
      if (data.documentId) {
        params = { 
          document: data.documentId,
          ...params 
        };
      }
    }
    const url = '/doc-invitations?' + formToParameter(params);
    const res: IDocInvitationResGetAll = await axiosClient.get(url) as IDocInvitationResGetAll;
    return res;
  },

  patchComfirmById: async (id: string): Promise<IDocInvitation> => {
    const url = '/doc-invitations/confirm/'+ id;
    const res: IDocInvitation = await axiosClient.patch(url) as IDocInvitation;
    return res;
  },

}

export default docInvitationsApi; 