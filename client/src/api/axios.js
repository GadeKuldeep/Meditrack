import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 30000, // 30s timeout for cold-starts
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    // Add retry metadata
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle retries and auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const isDev = import.meta.env.DEV;

    // Retry logic for 502 errors (cold-start) – only in production
    if (!isDev && error.response?.status === 502 && (!config._retryCount || config._retryCount < 2)) {
      config._retryCount = (config._retryCount || 0) + 1;
      const delayMs = Math.pow(2, config._retryCount) * 1000; // 2s, 4s
      console.warn(`[API] 502 received. Retrying after ${delayMs}ms (attempt ${config._retryCount})...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return api(config);
    }

    // Handle 401: token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
