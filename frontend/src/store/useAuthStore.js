import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Initial check
    checkAuth: async () => {
        try {
            const { data } = await api.get('/auth/status');
            if (data.isAuthenticated) {
                // Fetch full profile if needed, or rely on what status returned (basic user info)
                // If status returns user object, use it.
                // My controller returns: { isAuthenticated: true, user: ... }
                set({ user: data.user, isAuthenticated: true, isLoading: false });
            } else {
                 set({ user: null, isAuthenticated: false, isLoading: false });
            }
        } catch (error) {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
    login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        set({ user: data.user, isAuthenticated: true });
        return data;
    },
    signup: async (userData) => {
        const { data } = await api.post('/auth/signup', userData);
         // Signup usually requires verification, so maybe we don't login immediately
        return data;
    },
    logout: async () => {
        await api.post('/auth/logout');
        set({ user: null, isAuthenticated: false });
    },
    setUser: (user) => {
        set({ user, isAuthenticated: !!user });
    },
}));

export default useAuthStore;
