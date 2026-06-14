import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  TLoginData,
  TRegisterData,
  updateUserApi
} from '@api';
import { deleteCookie, getCookie, setCookie } from '../../utils/cookie';
import { TUser } from '@utils-types';

type TApiError = {
  message?: string;
};

const getErrorText = (payload: unknown) => {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    return (payload as TApiError).message || 'Ошибка';
  }
  return 'Ошибка';
};

type TState = {
  user: TUser | null;
  isAuth: boolean;
  isAuthChecked: boolean;
  loading: boolean;
  error: string | null;
};

const initialState: TState = {
  user: null,
  isAuth: false,
  isAuthChecked: false,
  loading: false,
  error: null
};

const saveTokens = (accessToken: string, refreshToken: string) => {
  setCookie('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const checkUser = createAsyncThunk('user/check', async () => {
  if (!getCookie('accessToken')) return null;
  try {
    const data = await getUserApi();
    if (data.success) return data.user;
  } catch {
    deleteCookie('accessToken');
    localStorage.removeItem('refreshToken');
  }
  return null;
});

export const register = createAsyncThunk(
  'user/register',
  async (form: TRegisterData, { rejectWithValue }) => {
    try {
      const data = await registerUserApi(form);
      saveTokens(data.accessToken, data.refreshToken);
      return data.user;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const login = createAsyncThunk(
  'user/login',
  async (form: TLoginData, { rejectWithValue }) => {
    try {
      const data = await loginUserApi(form);
      saveTokens(data.accessToken, data.refreshToken);
      return data.user;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const logout = createAsyncThunk('user/logout', async () => {
  await logoutApi();
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
});

export const updateUser = createAsyncThunk(
  'user/update',
  async (form: Partial<TRegisterData>, { rejectWithValue }) => {
    try {
      const data = await updateUserApi(form);
      if (data.success) return data.user;
      return rejectWithValue(data);
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkUser.pending, (state) => {
        state.isAuthChecked = false;
      })
      .addCase(checkUser.fulfilled, (state, action) => {
        state.isAuthChecked = true;
        state.user = action.payload;
        state.isAuth = !!action.payload;
      })
      .addCase(checkUser.rejected, (state) => {
        state.isAuthChecked = true;
        state.user = null;
        state.isAuth = false;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuth = true;
        state.isAuthChecked = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorText(action.payload);
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuth = true;
        state.isAuthChecked = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorText(action.payload);
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuth = false;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  }
});

export default slice.reducer;
