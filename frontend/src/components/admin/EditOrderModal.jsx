import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';

const EditOrderModal = ({ order, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        status: 'pending',
        payment_status: 'pending'
    });

    useEffect(() => {
        if (order) {
            setFormData({
                status: order.status || 'pending',
                payment_status: order.payment_status || 'pending'
            });
        }
    }, [order]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/orders/${order.id}`, formData);
            toast.success('Order updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    if (!order) return null;

    return (
        <Modal isOpen={true} onClose={onClose} title={`Process Order #${order.id}`} size="lg">
            <div className="flex flex-col space-y-6">

                {/* 1. Order Items Table */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Order Contents</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead>
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Product</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Qty</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Price</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {order.items && order.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                            {item.product?.name || 'Unknown Product'}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300">
                                            {item.quantity}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300 text-right">
                                            ${item.price}
                                        </td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white text-right">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="px-3 py-2 text-right text-sm font-bold text-gray-900 dark:text-white pt-4">Total Order Value:</td>
                                    <td className="px-3 py-2 text-right text-sm font-bold text-indigo-600 dark:text-indigo-400 pt-4">
                                        ${order.total_price || order.totalAmount}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* 2. Shipping Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Customer</h3>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{order.full_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{order.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">User ID: {order.user_id}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Shipping Address</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {order.address}{'\n'}
                            {order.city} {order.postal_code}{'\n'}
                            {order.country}
                        </p>
                    </div>
                </div>

                {/* 3. Status Update Form */}
                <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Status</label>
                            <select
                                value={formData.payment_status}
                                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                                className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                        >
                            Update Order
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default EditOrderModal;
