import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
    persist(
        (set) => ({
            theme: 'light',
            toggleTheme: () => set((state) => {

                const newTheme = state.theme === 'light' ? 'dark' : 'light';

                return { theme: newTheme };
            }),
            setTheme: (theme) => set({ theme })
        }),
        {
            name: 'theme-preference', // Changed key to reset legacy state
            onRehydrateStorage: () => (state) => {
                if (state && state.theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        }
    )
);

export default useThemeStore;
