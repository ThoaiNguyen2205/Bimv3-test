import { createContext, useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
import localStorageAvailable from '../utils/localStorageAvailable';
//
import { isValidToken, setSession } from './utils';
import { ActionMapType, AuthStateType, AuthUserType, JWTContextType } from './types';
// api 
import usersApi from 'src/api/usersApi';
// types
import { IUser, IUserReqLogin, IUserResLogin, IUserReqRegister, IUserReqUpdate } from 'src/shared/types/user';
// next
import { useRouter } from 'next/router';
// router
import { PATH_AUTH } from 'src/routes/paths';
// ----------------------------------------------------------------------

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  REFRESH = 'REFRESH',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT',
}

type Payload = {
  [Types.INITIAL]: {
    isAuthenticated: boolean;
    user: AuthUserType;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
  };
  [Types.REFRESH]: {
    user: AuthUserType;
  };
  [Types.REGISTER]: {
    user: AuthUserType;
  };
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === Types.REFRESH) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === Types.REGISTER) {
    return {
      ...state,
      isAuthenticated: false,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

export const AuthContext = createContext<JWTContextType | null>(null);

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const { push } = useRouter();

  const [state, dispatch] = useReducer(reducer, initialState);

  const storageAvailable = localStorageAvailable();

  const initialize = useCallback(async () => {
    try {
      const accessToken = storageAvailable ? localStorage.getItem('access_token') : '';
      const userId = window.localStorage.getItem('user');
      if (accessToken && isValidToken(accessToken) && userId) {
        setSession(accessToken, userId);

        const user = await usersApi.getReadById(userId);
        
        dispatch({
          type: Types.INITIAL,
          payload: {
            isAuthenticated: true,
            user,
          },
        });
      } else {
        dispatch({
          type: Types.INITIAL,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: Types.INITIAL,
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  }, [storageAvailable]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (email: string, password: string, deviceToken: string | null) => {
    const jsonObj: IUserReqLogin = {
      email: email,
      password: password
    };
    const responseData: IUserResLogin = await usersApi.postLogIn(jsonObj);
    
    if (responseData.access_token) {
      const accessToken = responseData.access_token;
      const user: IUser = responseData.user as IUser;
      setSession(accessToken, user.id);
      
      // console.log("🚀 ~ file: JwtContext.tsx:163 ~ login ~ deviceToken:", deviceToken)
      if (deviceToken) {
        await usersApi.addUserDevice({ 
          user: user.id,
          device_type: 'web',
          token: deviceToken,
          device_id: navigator.userAgent,
        });
      }

      dispatch({
        type: Types.LOGIN,
        payload: {
          user,
        },
      });
    }

  }, []);

  // REFRESH
  const refresh = useCallback(async (id: string) => {

    const user: IUser = await usersApi.getReadById(id) as IUser;
      dispatch({
        type: Types.REFRESH,
        payload: {
          user,
        },
      });

  }, []);

  // REGISTER
  const register = useCallback(
    async (fullname: string, username: string, email: string, password: string) => {
      const newUser: IUserReqRegister = {
        fullname: fullname,
        username: username,
        email: email,
        password: password,
      }
      
      const user: IUser = await usersApi.postRegister(newUser) as IUser;

      dispatch({
        type: Types.REGISTER,
        payload: {
          user,
        },
      });

      if (user.id !== undefined) {
        push(PATH_AUTH.verify + `?mail=${email}`);
      }
      
    },
    []
  );

  // LOGOUT
  const logout = useCallback(() => {
    setSession(null, null);
    dispatch({
      type: Types.LOGOUT,
    });
  }, []);

  const memoizedValue = useMemo(
    () => ({
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      method: 'jwt',
      login,
      refresh,
      register,
      logout,
    }),
    [state.isAuthenticated, state.isInitialized, state.user, login, refresh, logout, register]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
