import { create } from 'zustand';
import api from '../services/api';

const useCartStore = create((set, get) => ({
    cart: [],
    isLoading: false,
    fetchCart: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/cart');
            set({ cart: data.cart?.items || [] }); 
        } catch (error) {
            // checking cart without auth or just failed
            if (error.response && error.response.status === 401) {
                 // unauthorized, clear cart
                 set({ cart: [] });
            }
        } finally {
            set({ isLoading: false });
        }
    },
    addToCart: async (productId, quantity = 1) => {
        try {
            const { data } = await api.post('/cart/add', { productId, quantity });
            set({ cart: data.cart?.items || [] }); 
            return true;
        } catch (error) {
            return false;
        }
    },
    removeFromCart: async (productId) => {
        try {
            const { data } = await api.delete('/cart/remove', { data: { productId } });
             set({ cart: data.cart?.items || [] });
        } catch (error) {
            console.error(error);
        }
    },
    updateQuantity: async (productId, quantity) => {
         try {
            const { data } = await api.put('/cart/update', { productId, quantity });
             set({ cart: data.cart?.items || [] });
        } catch (error) {
            console.error(error);
        }
    },
    clearCart: async () => {
        set({ cart: [] }); // Optimistic update
        await api.delete('/cart/clear');
    }
}));

export default useCartStore;
