import { axiosClient, formToParameter, clientUploadFile, clientDownloadZipFile } from "./axiosClient";
import { IFile, IFileReqCopy, IFileReqCreate, IFileResGetAll, IFileZipReq } from "src/shared/types/file";
import { IFileAndFolderSearching } from "src/shared/types/folder";
import { IForgeObject, IForgeObjectReqCreate, IForgeObjectResGetAll, ICollaborationTaskData } from "src/shared/types/forgeObject";
import { IUploadRes } from "src/shared/types/upload";
import { DeleteData } from "src/shared/types/deleteData";
import { ISearchBy } from "src/shared/types/searchBy";

const forgeObjectsApi = {

  postCreate: async (jsonObj: IForgeObjectReqCreate): Promise<IForgeObject> => {
    const url = '/forgeobjects';
    const res: IForgeObject = await axiosClient.post(url, jsonObj) as IForgeObject;
    return res;
  },

  getReadById: async (id: string): Promise<IForgeObject> => {
    const url =  `/forgeobjects/${id}`;
    const res: IForgeObject = await axiosClient.get(url) as IForgeObject;
    return res;
  },

  updateById: async (id: string, jsonObj: IForgeObjectReqCreate): Promise<IForgeObject> => {
    const url = `/forgeobjects/${id}`;
    const res: IForgeObject = await axiosClient.patch(url, jsonObj) as IForgeObject;
    return res;
  },

  deleteById: async (id: string, deleteJson: DeleteData) => {
    const url = `/forgeobjects/delete/${id}`;
    const res: IForgeObject = await axiosClient.patch(url, deleteJson) as IForgeObject;
    return res;
  },

  removeById: async (id: string): Promise<IForgeObject> => {
    const url = `/forgeobjects/remove/${id}`;
    const res: IForgeObject = await axiosClient.delete(url) as IForgeObject;
    return res;
  },

  downloadFile: async (id: string): Promise<any> => {
    const url = '/forgeobjects/download/' + id;
    const res = await axiosClient.get(url);
    return res;
  },

  getAllSameName: async (id: string, name: string): Promise<IForgeObjectResGetAll> => {
    const url = `/forgeobjects/data/getsamename/${id}/${name}`;
    const res: IForgeObjectResGetAll = await axiosClient.get(url) as IForgeObjectResGetAll;
    return res;
  },

  getLastedObjectsInTask: async (id: string): Promise<IForgeObject[]> => {
    const url = `/forgeobjects/data/getlasted/${id}`;
    const res: IForgeObject[] = await axiosClient.get(url) as IForgeObject[];
    return res;
  },

  getCollaborationTaskData: async (id: string, uid: string, role: string, cus: string): Promise<ICollaborationTaskData> => {
    const url = `/forgeobjects/data/collaborationtask/${id}/${uid}/${role}/${cus}`;
    const res: ICollaborationTaskData = await axiosClient.get(url) as ICollaborationTaskData;
    return res;
  },

  convetOfficeToPdf: async (id: string) => {
    const url = `/forgeobjects/convert/officetopdf/${id}`;
    const res = await axiosClient.post(url);
    return res;
  },

  // ========================================================
  // upgrade V3
  
  upgradev3FindAll: async (data: ISearchBy | null): Promise<IForgeObjectResGetAll> => {
    let params: ISearchBy = {
      sortBy: "createdAt",
      sortType: data?.sortType || "asc"
    };
    if (data != null) {
      // filter by task
      if (data.task) {
        params = { task: data.task, ...params };
      }
    }

    const url = `/forgeobjects/upgradev3/findall?${formToParameter(params)}`;
    const res: IForgeObjectResGetAll = await axiosClient.get(url) as IForgeObjectResGetAll;
    return res;
  },
}

export default forgeObjectsApi;