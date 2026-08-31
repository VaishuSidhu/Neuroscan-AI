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
  }
};
