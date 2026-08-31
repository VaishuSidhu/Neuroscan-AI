import { axiosInstance } from './axiosInstance';

export const patientApi = {
  getPatients: async () => {
    const response = await axiosInstance.get('/patients');
    return response.data;
  },
  
  createPatient: async (patientData: any) => {
    const response = await axiosInstance.post('/patients', patientData);
    return response.data;
  },
  
  getPatient: async (id: number) => {
    const response = await axiosInstance.get(`/patients/${id}`);
    return response.data;
  },
  
  updatePatient: async (id: number, patientData: any) => {
    const response = await axiosInstance.put(`/patients/${id}`, patientData);
    return response.data;
  },
  
  deletePatient: async (id: number) => {
    const response = await axiosInstance.delete(`/patients/${id}`);
    return response.data;
  },
  
  getPatientHistory: async (patientId: string) => {
    const response = await axiosInstance.get(`/patients/${patientId}/history`);
    return response.data;
  }
};
