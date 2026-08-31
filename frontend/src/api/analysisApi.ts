import { axiosInstance } from './axiosInstance';

export const analysisApi = {
  runPipeline: async (scanId: number) => {
    const response = await axiosInstance.post(`/analysis/${scanId}/run`);
    return response.data;
  },
  
  preprocess: async (scanId: number) => {
    const response = await axiosInstance.post(`/analysis/${scanId}/preprocess`);
    return response.data;
  },
  
  predict: async (scanId: number) => {
    const response = await axiosInstance.post(`/analysis/${scanId}/predict`);
    return response.data;
  },
  
  gradcam: async (predictionId: number) => {
    const response = await axiosInstance.post(`/analysis/${predictionId}/gradcam`);
    return response.data;
  },
  
  localize: async (predictionId: number) => {
    const response = await axiosInstance.post(`/analysis/${predictionId}/localize`);
    return response.data;
  },
  
  getHistory: async () => {
    const response = await axiosInstance.get('/analysis/history');
    return response.data;
  },
  
  getPredictionDetail: async (id: number) => {
    const response = await axiosInstance.get(`/analysis/prediction/${id}`);
    return response.data;
  }
};
