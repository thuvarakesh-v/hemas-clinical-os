import axios from 'axios';

const API = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        try {
          const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken: refresh });
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return API(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export const auth = {
  register: (data) => API.post('/auth/patient/register', data),
  verifyOTP: (data) => API.post('/auth/patient/verify-otp', data),
  resendOTP: (data) => API.post('/auth/patient/resend-otp', data),
  login: (data) => API.post('/auth/patient/login', data),
  logout: () => API.post('/auth/logout'),
};

export const patient = {
  createProfile: (data) => API.post('/patient/profile', data),
  getProfile: () => API.get('/patient/profile'),
  updateProfile: (data) => API.put('/patient/profile', data),
  addAllergy: (data) => API.post('/patient/allergies', data),
  removeAllergy: (id) => API.delete(`/patient/allergies/${id}`),
  addCondition: (data) => API.post('/patient/conditions', data),
  removeCondition: (id) => API.delete(`/patient/conditions/${id}`),
};

export const documents = {
  upload: (formData) => API.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => API.get('/documents', { params }),
  getById: (id) => API.get(`/documents/${id}`),
  getAnalysis: (id) => API.get(`/documents/${id}/analysis`),
  delete: (id) => API.delete(`/documents/${id}`),
};

export const ai = {
  chat: (data) => API.post('/ai/chat', data),
  analyzeSymptoms: (data) => API.post('/ai/symptoms', data),
  getSessions: () => API.get('/ai/sessions'),
  getSessionHistory: (sid) => API.get(`/ai/sessions/${sid}`),
  getAnalyses: (params) => API.get('/ai/analyses', { params }),
  getRecommendedDoctors: (params) => API.get('/ai/recommended-doctors', { params }),
  health: () => API.get('/ai/health'),
};

export const appointments = {
  getSlots: (doctorId, date) => API.get(`/appointments/slots/${doctorId}`, { params: { date } }),
  book: (data) => API.post('/appointments', data),
  getMy: (params) => API.get('/appointments/my', { params }),
  cancel: (id, data) => API.put(`/appointments/${id}/cancel`, data),
};

export const doctors = {
  getAll: (params) => API.get('/doctors', { params }),
  getById: (id) => API.get(`/doctors/${id}`),
};

export const master = {
  getAllergies: () => API.get('/master/allergies'),
  getConditions: () => API.get('/master/conditions'),
  getDepartments: () => API.get('/master/departments'),
};

export const emergency = {
  getData: (token) => axios.get(`/api/v1/emergency/${token}`),
};

export default API;
