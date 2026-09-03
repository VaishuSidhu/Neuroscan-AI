import { axiosInstance } from './axiosInstance';

export const adminApi = {
  getStats: async () => {
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
  },

  getSystemMetrics: async () => {
    const response = await axiosInstance.get('/admin/system-metrics');
    return response.data;
  },
  
  getUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },
  
  addUser: async (userData: any) => {
    const response = await axiosInstance.post('/admin/users', userData);
    return response.data;
  },
  
  updateUserStatus: async (id: number, payload: { status?: string; role?: string }) => {
    const response = await axiosInstance.put(`/admin/users/${id}`, payload);
    return response.data;
  },
  
  deleteUser: async (id: number) => {
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  }
};
