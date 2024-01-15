import { IBucket, IForgeManifest, IForgeModel } from "src/shared/types/forgeToken";
import { axiosClient, formToParameter } from "./axiosClient";
import { IFile } from "src/shared/types/file";
import filesApi from "./filesApi";
import { IFolder } from "src/shared/types/folder";

const forgesApi = {
  getToken: () => {
    const url = '/forges/oauth/token';
    return axiosClient.get(url);
  },

  createBucket: (bucketName: string) => {
    const url = '/forges/buckets/' + bucketName;
    return axiosClient.post(url);
  },

  getBucketDetails: (bucketName: string) => {
    const url = '/forges/buckets/details/' + bucketName;
    return axiosClient.get(url);
  },

  getBuckets: async (): Promise<IBucket[]> => {
    const url = '/forges/buckets/';
    const res: IBucket[] = await axiosClient.get(url) as IBucket[];
    return res;
  },

  getModels: async (bucketName: string): Promise<IForgeModel[]> => {
    const url = '/forges/buckets/' + bucketName;
    const res: IForgeModel[] = await axiosClient.get(url) as IForgeModel[];
    return res;
  },

  uploadLargeModelFromServer: async (jsonObj: object) => {
    const url = '/forges/models/uploadfromserver';
    return await axiosClient.post(url, jsonObj);
  },

  translateModel: async (urn: string) => {
    const url = '/forges/models/translate/' + urn;
    return await axiosClient.post(url);
  },

  getModelManifest: async (urn: string): Promise<IForgeManifest> => {
    const url = '/forges/models/manifest/' + urn;
    const res = await axiosClient.post(url) as IForgeManifest;
    return res;
  },

  // ==========================================================================

  uploadModel: (formData: FormData, path: string) => {
    const url = '/forges/models/upload?path=' + path;
    return axiosClient.post(url, formData);
  },

  uploadLargeModel: (formData: FormData, path: string) => {
    const url = '/forges/models/uploadlarge?path=' + path;
    return axiosClient.post(url, formData);
  },

  uploadModelFromServer: (formData: FormData, path: string) => {
    const url = '/forges/models/upload?path=' + path;
    return axiosClient.post(url, formData);
  },





  getModelThumb: (urn: string, path: string) => {
    const url = '/forges/models/thumbnail?urn=' + urn + '&path=' + path;
    return axiosClient.post(url);
  },

  getMetadata: (urn: string) => {
    const url = '/forges/models/metadata/' + urn;
    return axiosClient.post(url);
  },

  getModelMetadata: (urn: string, modelId: string) => {
    const url = '/forges/models/modelviewmetadata/' + urn + '/' + modelId;
    return axiosClient.post(url);
  },

  getModelProperties: (urn: string, modelId: string) => {
    const url = '/forges/models/modelviewproperties/' + urn + '/' + modelId;
    return axiosClient.post(url);
  }
}

export default forgesApi; 