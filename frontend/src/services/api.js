import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // Important for cookies
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // If config.silent is true, suppress global error handling
        if (error.config && error.config.silent) {
            return Promise.reject(error);
        }

        const message = error.response?.data?.message || 'Something went wrong';
        
        // Auto-logout on 401 (Unauthorized) / Session Expired
        if (error.response?.status === 401) {
             // Dynamically import store to avoid circular dependency issues if any
             const useAuthStore = (await import('../store/useAuthStore')).default;
             useAuthStore.getState().logout();
             // Optional: window.location.href = '/login'; // Handled by store state change usually
        }

        toast.error(message);
        return Promise.reject(error);
    }
);

export default api;
