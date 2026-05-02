import api from './api';

const API_URL = '/scan';

export const scanMedicine = async (imageFile, userLocation = null) => {
  const formData = new FormData();
  formData.append('medicineImage', imageFile);
  
  if (userLocation) {
    if (userLocation.lat) formData.append('lat', userLocation.lat);
    if (userLocation.lng) formData.append('lng', userLocation.lng);
    if (userLocation.city) formData.append('city', userLocation.city);
    
    // Legacy support for nested location object if backend expects it
    formData.append('location[city]', userLocation.city || 'Unknown');
    formData.append('location[state]', userLocation.state || 'Unknown');
  } else {
    // Default fallback for demo
    formData.append('location[city]', 'New Delhi');
    formData.append('location[state]', 'Delhi');
  }

  const response = await api.post(`${API_URL}/analyze`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 120000,
  });

  return response.data;
};

export const getScanHistory = async () => {
  const response = await api.get(`${API_URL}/history`);
  return response.data;
};

export const chatFollowUp = async (question, context, history = []) => {
  const response = await api.post(`${API_URL}/chat`, { question, context, history });
  return response.data;
};

export const verifyBatch = async (batchNumber) => {
  const response = await api.get(`/batch/verify?batch=${encodeURIComponent(batchNumber)}`);
  return response.data;
};
