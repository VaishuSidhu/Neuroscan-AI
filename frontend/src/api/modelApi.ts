import { axiosInstance } from './axiosInstance';

export const modelApi = {
  getModels: async () => {
    const response = await axiosInstance.get('/models');
    return response.data;
  },
  
  getComparison: async () => {
    const response = await axiosInstance.get('/models/comparison');
    return response.data;
  },
  
  toggleModel: async (id: number) => {
    const response = await axiosInstance.post(`/models/${id}/toggle`);
    return response.data;
  }
};
