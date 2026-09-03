import { axiosInstance } from './axiosInstance';

export const authApi = {
  login: async (credentials: any) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },
  
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData: { name: string; email: string }) => {
    const response = await axiosInstance.put('/auth/profile', profileData);
    return response.data;
  },

  changePassword: async (pwdData: { current_password: string; new_password: string }) => {
    const response = await axiosInstance.post('/auth/change-password', pwdData);
    return response.data;
  }
};
