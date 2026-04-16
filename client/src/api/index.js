import axios from 'axios';

/**
 * Preconfigured Axios instance pointing to the backend API.
 * Automatically attaches the auth token from localStorage.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor — attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// ─── Rides API ────────────────────────────────────────────────────────────────
export const ridesAPI = {
  search: (params) => api.get('/rides/search', { params }),
  getById: (id) => api.get(`/rides/${id}`),
  create: (data) => api.post('/rides', data),
  updateStatus: (id, status) => api.put(`/rides/${id}/status`, { status }),
  getRequests: (rideId) => api.get(`/rides/${rideId}/requests`),
  requestJoin: (rideId, data) => api.post(`/rides/${rideId}/request`, data),
  respondRequest: (requestId, action) =>
    api.put(`/rides/requests/${requestId}`, { action }),
};

// ─── Users API ────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getMyRides: () => api.get('/users/me/rides'),
  getPublicProfile: (id) => api.get(`/users/${id}`),
  addEmergencyContact: (data) => api.post('/users/me/emergency-contact', data),
};

// ─── Chat API ─────────────────────────────────────────────────────────────────
export const chatAPI = {
  getMessages: (rideId) => api.get(`/chat/${rideId}`),
  sendMessage: (rideId, data) => api.post(`/chat/${rideId}`, data),
};

// ─── SOS API ─────────────────────────────────────────────────────────────────
export const sosAPI = {
  trigger: (data) => api.post('/sos', data),
};

export default api;
