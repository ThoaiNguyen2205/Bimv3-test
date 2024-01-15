import { axiosClient, formToParameter, clientUploadFile, clientDownloadZipFile } from "./axiosClient";
import { IFile, IFileReqCopy, IFileReqCreate, IFileResGetAll, IFileZipReq } from "src/shared/types/file";
import { IFileAndFolderSearching, IFileOrFolder, IFileOrFolderResGetAll, IFolderFullData } from "src/shared/types/folder";
import { IUploadRes } from "src/shared/types/upload";
import { DeleteData } from "src/shared/types/deleteData";
import { ISearchBy } from "src/shared/types/searchBy";
import { UserClassEnum } from "src/shared/enums";

const filesApi = {

  upload: async (formData: FormData, path: string, onUploadProgress: (e: any) => void): Promise<IUploadRes> => {
    const url = '/files/upload?path=' + path;
    const res: IUploadRes = await clientUploadFile(url, formData, onUploadProgress);
    return res;
  },

  postCreate: async (jsonObj: IFileReqCreate): Promise<IFile> => {
    const url = '/files';
    const res: IFile = await axiosClient.post(url, jsonObj) as IFile;
    return res;
  },

  postCopyFile: async (jsonObj: IFileReqCopy): Promise<string> => {
    const url = '/files/copy';
    const res: string = await axiosClient.post(url, jsonObj) as string;
    return res;
  },

  getReadById: async (id: string): Promise<IFile> => {
    const url =  `/files/${id}`;
    const res: IFile = await axiosClient.get(url) as IFile;
    return res;
  },

  updateById: async (id: string, jsonObj: IFileReqCreate): Promise<IFile> => {
    const url = `/files/${id}`;
    const res: IFile = await axiosClient.patch(url, jsonObj) as IFile;
    return res;
  },

  confirmById: async (id: string, deleteJson: DeleteData): Promise<IFile> => {
    const url = `/files/confirm/${id}`;
    const res: IFile = await axiosClient.patch(url, deleteJson) as IFile;
    return res;
  },

  cancelConfirmById: async (id: string, deleteJson: DeleteData): Promise<IFile> => {
    const url = `/files/confirm/cancel/${id}`;
    const res: IFile = await axiosClient.patch(url, deleteJson) as IFile;
    return res;
  },

  approveById: async (id: string, deleteJson: DeleteData): Promise<IFile> => {
    const url = `/files/approve/${id}`;
    const res: IFile = await axiosClient.patch(url, deleteJson) as IFile;
    return res;
  },

  cancelApproveById: async (id: string, deleteJson: DeleteData): Promise<IFile> => {
    const url = `/files/approve/cancel/${id}`;
    const res: IFile = await axiosClient.patch(url, deleteJson) as IFile;
    return res;
  },

  deleteById: async (id: string, deleteJson: DeleteData): Promise<IFile> => {
    const url = `/files/delete/${id}`;
    const res: IFile = await axiosClient.patch(url, deleteJson) as IFile;
    return res;
  },

  removeById: async (id: string): Promise<IFile> => {
    const url = `/files/remove/${id}`;
    const res: IFile = await axiosClient.delete(url) as IFile;
    return res;
  },

  // Lấy full dữ liệu thư mục
  getFullFolderData: async (id: string, uid: string, role: UserClassEnum): Promise<IFolderFullData> => {
    const url = `/files/fulldata/folder/${id}/${uid}/${role}`;
    const res: IFolderFullData = await axiosClient.get(url) as IFolderFullData;
    return res;
  },

  downloadFile: async (id: string): Promise<any> => {
    const url = '/files/download/' + id;
    const res = await axiosClient.get(url);
    return res;
  },

  getAllSameFiles: async (data: ISearchBy | null): Promise<IFile[]> => {
    let params: ISearchBy = {
      sortBy: 'createdAt',
      sortType: 'asc',
    };
    if (data != null) {
      // filter by folder
      if (data.folder) {
        params = {
          folder: data.folder,
          ...params
        }
      }

      // filter by displayName
      if (data.displayName) {
        params = {
          displayName: data.displayName,
          ...params
        }
      }
    }

    const url = `/files/data/getsamefiles?${formToParameter(params)}`;
    const res: IFile[] = await axiosClient.get(url) as IFile[];
    return res;
  },

  getLastedFileInFolder: async (data: ISearchBy | null): Promise<IFile> => {
    let params: ISearchBy = {};
    if (data != null) {
        // filter by folder
      if (data.folder) {
        params = {
          folder: data.folder,
          ...params
        }
      }

      // filter by displayName
      if (data.displayName) {
        params = {
          displayName: data.displayName,
          ...params
        }
      }
    }

    const url = `/files/data/getlastedfile?${formToParameter(params)}`;
    const res: IFile = await axiosClient.get(url) as IFile;
    return res;
  },

  getAllLastedFilesInFolder: async (data: ISearchBy | null): Promise<IFile[]> => {
    let params: ISearchBy = {};
    if (data != null) {
      // filter by folder
      if (data.folder) {
        params = {
          folder: data.folder,
          ...params
        }
      }
    }

    const url = `/files/data/getalllastedfiles?${formToParameter(params)}`;
    const res: IFile[] = await axiosClient.get(url) as IFile[];
    return res;
  },

  getSearchAllFolder: async (uid: string, role: UserClassEnum, data: ISearchBy | null): Promise<IFileAndFolderSearching> => {
    let params: ISearchBy = {};
    if (data != null) {
      // filter by project
      if (data.project) {
        params = {
          project: data.project,
          ...params
        }
      }
      // filter by searchKey
      if (data.searchKey) {
        params = {
          searchKey: data.searchKey,
          ...params
        }
      }
    }

    const url = `/files/data/searchallfolders/${uid}/${role}?${formToParameter(params)}`;
    const res: IFileAndFolderSearching = await axiosClient.get(url) as IFileAndFolderSearching;
    return res;
  },

  zipDownloadFile: async (fileName: string, jsonObj: IFileZipReq): Promise<any> => {
    const url = `/files/zip/download/`;    
    const downloadFilename = `${fileName}.zip`;
    const zipRes = await clientDownloadZipFile(url, jsonObj);
    
    // Create a temporary URL for the Blob
    const blob = new Blob([zipRes], { type: "application/zip" });
    const tempDownloadUrl = window.URL.createObjectURL(blob);
    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = tempDownloadUrl;
    link.download = downloadFilename;
    // Trigger a click event on the link element to start the download
    document.body.appendChild(link);
    link.click();
    // Clean up: Remove the temporary link element and revoke the URL
    document.body.removeChild(link);
    window.URL.revokeObjectURL(tempDownloadUrl);
  },

  ///////////////////////////////////////////////////////////////////////////////////
  // TRASH
  deleteTrashById: async (id: string, deleteJson: DeleteData) => {
    const url = `/files/deletetrash/${id}`;
    const res: IFile = await axiosClient.patch(url, deleteJson) as IFile;
    return res;
  },

  deleteTrashFolderById: async (id: string, deleteJson: DeleteData) => {
    const url = `/files/deletetrashfolder/${id}`;
    const res: IFile = await axiosClient.patch(url, deleteJson) as IFile;
    return res;
  },

  restoreById: async (id: string, deleteJson: DeleteData) => {
    const url = `/files/restore/${id}`;
    const res: IFile = await axiosClient.patch(url, deleteJson) as IFile;
    return res;
  },

  getAllTrashFiles: async (data: ISearchBy | null): Promise<IFileResGetAll> => {
    let params: ISearchBy = {
      sortBy: 'createdAt',
      sortType: data?.sortType || 'asc',
    };
    if (data != null) {
      // filter by project
      if (data.project) {
        params = { project: data.project, ...params };
      }

      // search by fromDate
      if (data.fromDate) {
        params = { fromDate: data.fromDate, ...params };
      }

      // filter by toDate
      if (data.toDate) {
        params = { toDate: data.toDate, ...params };
      }

      // filter by pageNumber
      if (data.pageNumber) {
        params = { pageNumber: data.pageNumber, ...params };
      }

      // filter by itemPerPage
      if (data.itemPerPage) {
        params = { itemPerPage: data.itemPerPage, ...params };
      }

    }

    const url = `/files/trash/all/files?${formToParameter(params)}`;
    const res: IFileResGetAll = await axiosClient.get(url) as IFileResGetAll;
    return res;
  },

  getAllTrashFilesAndFolders: async (data: ISearchBy | null): Promise<IFileOrFolderResGetAll> => {
    let params: ISearchBy = {
      sortBy: 'createdAt',
      sortType: data?.sortType || 'asc',
    };
    if (data != null) {
      // filter by project
      if (data.project) {
        params = { project: data.project, ...params };
      }

      // search by fromDate
      if (data.fromDate) {
        params = { fromDate: data.fromDate, ...params };
      }

      // filter by toDate
      if (data.toDate) {
        params = { toDate: data.toDate, ...params };
      }

      // filter by pageNumber
      if (data.pageNumber) {
        params = { pageNumber: data.pageNumber, ...params };
      }

      // filter by itemPerPage
      if (data.itemPerPage) {
        params = { itemPerPage: data.itemPerPage, ...params };
      }
      
    }
    const url = `/files/trash/all/fileandfolder?${formToParameter(params)}`;
    const res: IFileOrFolderResGetAll = await axiosClient.get(url) as IFileOrFolderResGetAll;
    return res;
  },

}

export default filesApi;