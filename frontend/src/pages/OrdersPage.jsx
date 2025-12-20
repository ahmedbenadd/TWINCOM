import { useState, useEffect } from 'react';
import api from '../services/api';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders');
                setOrders(data.orders || data || []);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">No orders yet</h2>
                <p className="text-gray-500 mb-8">Start shopping to see your orders here.</p>
                <Link to="/shop" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Orders</h1>

            <div className="space-y-8">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white dark:bg-gray-800 shadow-sm overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700">
                        {/* Order Header */}
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white">
                                    Order #ORD-{order.id.toString().padStart(6, '0')}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border 
                                    ${order.status === 'delivered' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' :
                                                'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        {/* Order Details Grid */}
                        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            {/* Shipping Info */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Shipping Address</h4>
                                <div className="text-sm text-gray-900 dark:text-gray-300">
                                    <p className="font-medium">{order.full_name}</p>
                                    <p>{order.address}</p>
                                    <p>{order.city} {order.zip_code && `, ${order.zip_code}`}</p>
                                    <p>{order.country}</p>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Payment Information</h4>
                                <div className="text-sm text-gray-900 dark:text-gray-300">
                                    <p><span className="text-gray-500 dark:text-gray-400">Method:</span> {order.payment_method}</p>
                                    <p><span className="text-gray-500 dark:text-gray-400">Status:</span> <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{order.payment_status}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="px-6 py-4">
                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Items</h4>
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {order.items?.map((item, index) => (
                                    <li key={index} className="py-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 flex items-center justify-center p-1 mr-4">
                                                {(item.product?.images?.[0]?.url || item.product?.imageUrl) ? (
                                                    <img
                                                        src={getImageUrl(item.product?.images?.[0]?.url || item.product?.imageUrl)}
                                                        alt={item.product?.name}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <Package size={24} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.product?.name || 'Product Name'}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity} x ${item.price}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </li>
                                )) || <p className="text-gray-500 dark:text-gray-400">Items not available</p>}
                            </ul>
                        </div>

                        {/* Order Footer */}
                        <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center">
                            <span className="text-base font-medium text-gray-500 dark:text-gray-400 mr-4">Total Amount:</span>
                            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${order.total_price || order.totalAmount}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrdersPage;
