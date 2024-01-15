import { axiosClient, formToParameter } from "./axiosClient";
import {
  IFolderReqCreate,
  IFolder,
  IFolderResGetAll,
  IFolderNodeData,
  ISubFolderPermitReqCreate,
  IFolderPathReqCreate,
} from '../shared/types/folder';
import { DeleteData } from "src/shared/types/deleteData";
import { ISearchBy } from "src/shared/types/searchBy";
import { UserClassEnum } from "src/shared/enums";

const foldersApi = {

  postCreate: async (jsonObj: IFolderReqCreate): Promise<IFolder> => {
    const url = "/folders";
    const res: IFolder = await axiosClient.post(url, jsonObj) as IFolder;
    return res;
  },

  getReadById: async (id: string): Promise<IFolder> => {
    const url = `/folders/${id}`;
    const res: IFolder = await axiosClient.get(url) as IFolder;
    return res;
  },

  getReadByIdWithUser: async (id: string, uid: string): Promise<IFolder> => {
    const url = `/folders/byuser/${id}/${uid}`;
    const res: IFolder = await axiosClient.get(url) as IFolder;
    return res;
  },

  updateById: async (id: string, jsonObj: IFolderReqCreate): Promise<IFolder> => {
    const url = `/folders/${id}`;
    const res: IFolder = await axiosClient.patch(url, jsonObj) as IFolder;
    return res;
  },

  // Kiểm tra thư mục có liên kết đến công việc hay không
  checkLinkFolderById: async (id: string, uid: string, role: UserClassEnum): Promise<string> => {
    const url = `/files/checklinkfolder/${id}/${uid}/${role}`;
    const res: string = await axiosClient.post(url) as string;
    return res;
  },
  
  // khi xóa sử dụng filesapi để xóa tất cả thư mục con và files
  deleteById: async (id: string, deleteJson: DeleteData): Promise<IFolder> => {
    const url = `/files/deletefolder/${id}`;
    const res: IFolder = await axiosClient.patch(url, deleteJson) as IFolder;
    return res;
  },

  // khi move folder sử dụng filesapi để move tất cả thư mục con các cấp cùng files
  moveById: async (customerId: string, moveId: string, toId: string, copy: string, deleteJson: DeleteData): Promise<IFolder> => {
    const url = `/files/movefolder/${customerId}/${moveId}/${toId}/${copy}`;
    const res: IFolder = await axiosClient.patch(url, deleteJson) as IFolder;
    return res;
  },

  removeById: async (id: string): Promise<IFolder> => {
    const url = `/folders/remove/${id}`;
    const res: IFolder = await axiosClient.delete(url) as IFolder;
    return res;
  },

  getFolderByPath: async (path: string, storeName: string): Promise<IFolderResGetAll> => {
    const url = '/folders?path=' + path + '&storeName=' + storeName;
    const res: IFolderResGetAll = await axiosClient.get(url) as IFolderResGetAll;
    return res;
  },

  determineUserInFolder: async (folderId: string, userId: string): Promise<boolean> => {
    const url = '/folders/determine/' + folderId + '/' + userId;
    const res: boolean = await axiosClient.get(url) as boolean;
    return res;
  },

  getProjectFolderTree: async (
    customerId: string,
    projectId: string,
    userId: string,
    userRole: string): Promise<IFolderNodeData[]> => {
    const url = '/folders/projectload/treenodes/' + customerId + '/' + projectId + '/' + userId + '/' + userRole;
    const res: IFolderNodeData[] = await axiosClient.get(url) as IFolderNodeData[];
    return res;
  },

  getSubFolderNodes: async (
    folderId: string,
    userId: string,
    userRole: string): Promise<IFolderNodeData[]> => {
    const url = '/folders/subfolder/nodes/' + folderId + '/' + userId + '/' + userRole;
    const res: IFolderNodeData[] = await axiosClient.get(url) as IFolderNodeData[];
    return res;
  },

  getSubFolderTemplate: async (
    folderId: string,
    userId: string,
    userRole: string): Promise<IFolderNodeData[]> => {
    const url = '/folders/template/nodes/' + folderId + '/' + userId + '/' + userRole;
    const res: IFolderNodeData[] = await axiosClient.get(url) as IFolderNodeData[];
    return res;
  },

  getSubFoldersWithPath: async (path: string, userId: string, userRole: string): Promise<IFolder[]> => {
    const url = '/folders/getbypath/' + userId + '/' + userRole + '?path=' + path;
    const res: IFolder[] = await axiosClient.get(url) as IFolder[];
    return res;
  },

  getFolderListById: async (id: string): Promise<string> => {
    const url = `/folders/getfolderlist/byid/${id}`;
    return await axiosClient.get(url);
  },

  applySubFolderPermit: async (jsonObj: ISubFolderPermitReqCreate): Promise<ISubFolderPermitReqCreate> => {
    const url = "/folders/subfolderpermit";
    const res: ISubFolderPermitReqCreate = await axiosClient.post(url, jsonObj) as ISubFolderPermitReqCreate;
    return res;
  },

  postCreateFolderPath: async (jsonObj: IFolderPathReqCreate): Promise<IFolder> => {
    const url = "/folders/create/folder/bypath";
    const res: IFolder = await axiosClient.post(url, jsonObj) as IFolder;
    return res;
  },

  ////////////////////////////////////////////////////////////////////////////////////
  // TRASH

  // deleteTrashById: sử dụng ở filesApi

  restoreById: async (id: string, deleteJson: DeleteData) => {
    const url = `/folders/restore/${id}`;
    const res: IFolder = await axiosClient.patch(url, deleteJson) as IFolder;
    return res;
  },

  getAllTrash: async (project: string, pageNumber: number, itemPerPage: number): Promise<IFolderResGetAll> => {
    let params: ISearchBy = {
      project: project,
      pageNumber: pageNumber,
      itemPerPage: itemPerPage,
    };
    const url = `/folders/trash/all?${formToParameter(params)}`;
    const res: IFolderResGetAll = await axiosClient.get(url) as IFolderResGetAll;
    return res;
  },

}

export default foldersApi; 