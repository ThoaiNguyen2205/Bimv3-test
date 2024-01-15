import { ISearchBy } from "src/shared/types/searchBy";
import { IUserReqRegister, IUserReqLogin, IUserResLogin, IUserResGetAll, IUserReqUpdate, IUser, IUserResRepass, IUserDevice } from "src/shared/types/user";
import { axiosClient, formToParameter } from "./axiosClient";

const usersApi = {

    postRegister: async (jsonObj: IUserReqRegister): Promise<IUser> => {
        const url = "/users/register";
        const res: IUser = await axiosClient.post(url, jsonObj) as IUser;
        return res;
    },

    postLogIn: async (jsonObj: IUserReqLogin): Promise<IUserResLogin> => {
        const url = "/auth/login";
        const res: IUserResLogin = await axiosClient.post(url, jsonObj) as IUserResLogin;
        return res;
    },

    getReadById: async (id: string): Promise<IUser> => {
        const url = `/users/${id}`;
        const res: IUser = await axiosClient.get(url) as IUser;
        return res;
    },

    getByEmail: async (email: string): Promise<IUser> => {
        const url = `/users/email/${email}`;
        const res: IUser = await axiosClient.get(url) as IUser;
        return res;
    },

    getByUsername: async (username: string): Promise<IUser> => {
        const url = `/users/username/${username}`;
        const res: IUser = await axiosClient.get(url) as IUser;
        return res;
    },

    updateById: async (id: string, jsonObj: IUserReqUpdate): Promise<IUser> => {
        const url = `/users/${id}`;
        const res: IUser = await axiosClient.patch(url, jsonObj) as IUser;
        return res;
    },

    getSearch: async (key: string): Promise<IUserResGetAll> => {
        const url = "/users?fullname=" + key + "&username=" + key + "&email=" + key + "&sortBy=createdAt&sortType=desc";
        const res: IUserResGetAll = await axiosClient.get(url) as IUserResGetAll;
        return res;
    },

    getUser: async (data: ISearchBy | null): Promise<IUserResGetAll> => {
        let params: ISearchBy = {
            sortBy: "createdAt",
            sortType: data?.sortType || "asc"
        };

        if (data != null) {
            // filter by fullname | email | username
            if (data.username) {
                params = {
                    fullname: data.username,
                    username: data.username,
                    email: data.username,
                    ...params
                }
            }
            
            // filter by current page
            if (data.page) {
                params = { pageNumber: data.page, ...params }
            }

            // filter by page size
            if (data.size) {
                params = { itemPerPage: data.size, ...params }
            }
        }

        const url = `/users?${formToParameter(params)}`;
        const res: IUserResGetAll = await axiosClient.get(url) as IUserResGetAll;
        return res;
    },

    // Không sử dụng vì khi superadmin xóa thì xóa hẳn dữ liệu
    // deleteById: async (id: string): Promise<IUser> => {
    //     const url = "/users/"+ id;
    //     const deleteUser: IUser = await axiosClient.delete(url) as IUser; 
    //     return deleteUser;
    // },

    removeById: async (id: string): Promise<IUser> => {
        const url = `/users/remove/${id}`;
        const removeUser: IUser = await axiosClient.delete(url) as IUser; 
        return removeUser;
    },

    blockById: async (id: string): Promise<IUser> => {
        const url = `/users/block/${id}`;
        const blockUser: IUser = await axiosClient.patch(url) as IUser; 
        return blockUser;
    },

    resendCodeById: async (id: string): Promise<IUser> => {
        const url = `/users/resendcode/${id}`;
        const res: IUser = await axiosClient.patch(url) as IUser;
        return res;
    },

    repassById: async (id: string): Promise<IUserResRepass> => {
        const url = `/users/repass/${id}`;
        const res: IUserResRepass = await axiosClient.patch(url) as IUserResRepass;
        return  res;
    },
    
    addUserDevice: (data: IUserDevice) => {
        const url = '/users/device';
        return axiosClient.post(url, data);
    },

}

export default usersApi; 