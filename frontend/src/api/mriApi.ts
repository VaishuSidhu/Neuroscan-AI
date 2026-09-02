import { axiosInstance } from './axiosInstance';

export const mriApi = {
  uploadMri: async (patientId: string, scanType: string, file: File) => {
    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('scan_type', scanType);
    formData.append('file', file);
    
    const response = await axiosInstance.post('/mri/upload', formData);
    return response.data;
  }
};
