import { IUploadRes, IFilesRes } from "src/shared/types/upload";
import { clientUploadFile } from "./axiosClient";
import { axiosClient } from "./axiosClient";

const uploadsApi = {

    uploadImage: async (formData: FormData, onUploadProgress: (e: any) => void): Promise<IUploadRes> => {
        const url = '/img-uploads/image';        
        const res: IUploadRes = await clientUploadFile(url, formData, onUploadProgress);
        return res;
    },

    getAllFiles: async () => {
        const url = '/img-uploads/all';        
        const res: IFilesRes = await axiosClient.get(url);
        return res;
    }

}

export default uploadsApi;