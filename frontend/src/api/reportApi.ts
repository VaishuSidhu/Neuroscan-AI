import { axiosInstance } from './axiosInstance';

export const reportApi = {
  getReports: async () => {
    const response = await axiosInstance.get('/reports');
    return response.data;
  },
  
  createReport: async (predictionId: number) => {
    const response = await axiosInstance.post(`/reports/${predictionId}`);
    return response.data;
  },
  
  getReport: async (id: number) => {
    const response = await axiosInstance.get(`/reports/${id}`);
    return response.data;
  }
};
