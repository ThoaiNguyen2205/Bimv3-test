import { axiosClient, formToParameter } from "./axiosClient";
import { IGroupUser, IGroupUserResGetAll } from "src/shared/types/groupusers";


// API này chỉ sử dụng để đồng bọ từ bản 2
const groupusersApi = {

    getReadById: async (id: string) => {
        const url = '/group-users/' + id;
        const res: IGroupUser = await axiosClient.get(url) as IGroupUser;
        return res;
    },

    getByGroup: async (grid: string) => {
        const url = '/group-users?group=' + grid + '&pageNumber=' + 0 + '&itemPerPage=' + 99 + "&sortBy=createdAt&sortType=asc";
        const res: IGroupUserResGetAll = await axiosClient.get(url) as IGroupUserResGetAll;
        return res;
    },

}

export default groupusersApi; 