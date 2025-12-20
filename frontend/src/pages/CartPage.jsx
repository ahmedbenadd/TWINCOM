import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import { Trash2 } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const CartPage = () => {
    const { cart, fetchCart, removeFromCart, updateQuantity, isLoading } = useCartStore();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [fetchCart, isAuthenticated]);

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0).toFixed(2);
    };

    if (isLoading && cart.length === 0) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
                <Link to="/shop" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {cart.map((item) => (
                            <li key={item.id} className="p-6 flex items-center">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-600 flex items-center justify-center p-2">
                                    <img
                                        src={getImageUrl(item.product?.images?.[0]?.url || item.product?.imageUrl)}
                                        alt={item.product?.name}
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <div className="ml-6 flex-1">
                                    <div className="flex justify-between">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                            <Link to={`/product/${item.product?.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                                                {item.product?.name}
                                            </Link>
                                        </h3>
                                        <p className="text-lg font-bold text-gray-900 dark:text-gray-200">${item.product?.price}</p>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center">
                                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                                            <button
                                                className="px-3 py-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                                                onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="px-3 py-1 border-l border-r border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white">{item.quantity}</span>
                                            <button
                                                className="px-3 py-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.product_id)}
                                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium flex items-center"
                                        >
                                            <Trash2 size={18} className="mr-1" /> Remove
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Summary</h2>
                        <div className="flow-root">
                            <dl className="-my-4 divide-y divide-gray-200 dark:divide-gray-700">
                                <div className="py-4 flex items-center justify-between">
                                    <dt className="text-sm text-gray-600 dark:text-gray-400">Subtotal</dt>
                                    <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">${calculateTotal()}</dd>
                                </div>
                                <div className="py-4 flex items-center justify-between">
                                    <dt className="text-sm text-gray-600 dark:text-gray-400">Shipping</dt>
                                    <dd className="text-sm font-medium text-gray-900 dark:text-gray-200">Free</dd>
                                </div>
                                <div className="py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                                    <dt className="text-base font-bold text-gray-900 dark:text-white">Order Total</dt>
                                    <dd className="text-base font-bold text-indigo-600 dark:text-indigo-400">${calculateTotal()}</dd>
                                </div>
                            </dl>
                        </div>
                        <div className="mt-6">
                            <Link
                                to="/checkout"
                                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors block text-center"
                            >
                                Proceed to Checkout
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
