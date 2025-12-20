import { create } from 'zustand';

const useAdminUIStore = create((set) => ({
    title: 'Dashboard',
    setTitle: (title) => set({ title }),
}));

export default useAdminUIStore;
