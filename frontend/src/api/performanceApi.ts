import { axiosInstance } from './axiosInstance';

export const performanceApi = {
  getPerformanceStats: async (modelId?: string, dataset?: string) => {
    const params: any = {};
    if (modelId) params.model_id = modelId;
    if (dataset) params.dataset = dataset;
    
    const response = await axiosInstance.get('/performance', { params });
    return response.data;
  }
};
