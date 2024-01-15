import axios from 'axios';
import queryString from 'query-string';
import { IFileZipReq } from 'src/shared/types/file';
import { IUploadRes } from 'src/shared/types/upload';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_APIURL,
  headers: {
    'content-type': 'application/json',
    // 'Access-Control-Allow-Origin': 'https://bimnext.dpunity.com',
    'Access-Control-Allow-Origin': '*',
    "Access-Control-Allow-Headers": 'X-Requested-With',
  },
  withCredentials: true,
  paramsSerializer: {
    encode: (params) => queryString.stringify(params)
  }
});

axiosClient.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem('access_token');

  if (accessToken) {
    const token = `Bearer ${accessToken}`;
    config.headers.Authorization = token;
  }

  return config;
});

axiosClient.interceptors.response.use((response) => {
  if (response && response.data) {
    return response.data;
  }
  return response;
}, (error) => {
  throw error;
});

const clientUploadFile = async (url: string, formData: FormData, onUploadProgress: (e: any) => void): Promise<IUploadRes> => {
  const res: IUploadRes = await axiosClient.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data; charset=utf-8",
    },
    onUploadProgress,
  }) as IUploadRes;
  return res;
};

const clientDownloadZipFile = async(url: string, jsonObj: { files: string}) => {
  const res: Blob = await axiosClient.post(url, jsonObj, {
    responseType: 'blob', // important
  });
  return res;
};

const formToParameter = ((data: any) => {
  const qString = queryString.stringify(data);

  return qString;
});

export {
  axiosClient,
  formToParameter,
  clientUploadFile,
  clientDownloadZipFile
}; 