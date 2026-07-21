import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, //changed
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle token expiry / unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized or expired token. Redirecting to login...');
    }
    return Promise.reject(error);
  }
);

export default api;
