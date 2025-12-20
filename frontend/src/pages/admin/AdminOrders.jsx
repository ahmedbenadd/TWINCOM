import { useState, useEffect } from 'react';
import api from '../../services/api';
// import toast from 'react-hot-toast'; 
import { Edit, Search, ShoppingBag, X, FilterX } from 'lucide-react';
import EditOrderModal from '../../components/admin/EditOrderModal';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [sort, setSort] = useState('newest');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [editingOrder, setEditingOrder] = useState(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                search,
                status,
                payment_status: paymentStatus,
                sort,
                ...(startDate && { start_date: startDate }),
                ...(endDate && { end_date: endDate })
            });
            const { data } = await api.get(`/orders/all?${queryParams}`);
            setOrders(data.orders || data || []);
        } catch (error) {
            // toast.error('Failed to fetch orders');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setSort('newest');
        setPaymentStatus('');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchOrders();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search, status, paymentStatus, sort, startDate, endDate]);

    const handleSearch = (e) => setSearch(e.target.value);

    // Pagination Logic
    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const paginatedOrders = orders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const nextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const prevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    // Reset to page 1 when filters change (search, etc.)
    useEffect(() => {
        setPage(1);
    }, [search, status, paymentStatus, sort, startDate, endDate]);



    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            {/* Header - Fixed */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Orders</h1>

                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={search}
                            onChange={handleSearch}
                            className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Payments</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="End Date"
                    />

                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="price_asc">Total: Low to High</option>
                        <option value="price_desc">Total: High to Low</option>
                    </select>

                    <button
                        onClick={clearFilters}
                        disabled={!search && !status && !paymentStatus && !startDate && !endDate && sort === 'newest'}
                        title="Clear Filters"
                        className={`p-2 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors ${!search && !status && !paymentStatus && !startDate && !endDate && sort === 'newest'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                            : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'
                            }`}
                    >
                        <FilterX size={18} />
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto custom-scrollbar p-6">
                <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                            <p className="text-gray-500 dark:text-gray-400">Loading orders...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedOrders.length > 0 ? (
                                paginatedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">#ORD-{order.id.toString().padStart(6, '0')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{order.user?.email || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${order.total_price || order.totalAmount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onClick={() => setEditingOrder(order)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-2">
                                                <Edit size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <ShoppingBag className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No orders found</h3>
                                            <p className="text-sm max-w-sm mx-auto">
                                                We couldn't find any orders matching your current filters.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingOrder && (
                <EditOrderModal
                    order={editingOrder}
                    onClose={() => setEditingOrder(null)}
                    onUpdate={() => fetchOrders(search)}
                />
            )}

            {/* Footer - Fixed Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center z-10 flex-shrink-0">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    From <span className="font-medium text-gray-900 dark:text-white">{orders.length === 0 ? 0 : (page - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(page * itemsPerPage, orders.length)}</span> of <span className="font-medium text-gray-900 dark:text-white">{orders.length}</span>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={prevPage}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <button
                        onClick={nextPage}
                        disabled={page === totalPages || totalPages === 0}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
