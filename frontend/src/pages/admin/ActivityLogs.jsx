import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, Clock, X, FilterX } from 'lucide-react';
import { format } from 'date-fns';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [action, setAction] = useState('');
    const [entityType, setEntityType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchLogs = async (currentPage = 1) => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: 10,
                ...(search && { search }),
                ...(action && { action }),
                ...(entityType && { entity_type: entityType }),
                ...(sort && { sort }),
                ...(startDate && { start_date: startDate }),
                ...(endDate && { end_date: endDate })
            });

            const { data } = await api.get(`/activity-logs?${queryParams}`);
            setLogs(data.logs || []);
            setTotalPages(data.pagination.pages);
            setTotalLogs(data.pagination.total);
            setPage(currentPage);
        } catch (error) {
            console.error("Failed to load logs");
        } finally {
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setSort('newest');
        setAction('');
        setEntityType('');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchLogs(1);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search, sort, action, entityType, startDate, endDate]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const nextPage = () => {
        if (page < totalPages) {
            const next = page + 1;
            setPage(next);
            fetchLogs(next);
        }
    };

    const prevPage = () => {
        if (page > 1) {
            const prev = page - 1;
            setPage(prev);
            fetchLogs(prev);
        }
    };



    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            {/* Header - Fixed */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 z-10 space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <FileText className="mr-2" size={24} /> Activity Logs
                </h1>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={search}
                                onChange={handleSearch}
                                className="w-full sm:w-48 px-4 py-2 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
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
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>

                        <select
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Actions</option>
                            <option value="LOGIN">Login</option>
                            <option value="ADMIN_LOGIN">Admin Login</option>
                            <option value="ROOT_LOGIN">Root Login</option>
                            <option value="LOGOUT">Logout</option>
                            <option value="CREATE_ORDER">Create Order</option>
                            <option value="UPDATE_ORDER_STATUS">Update Order</option>
                            <option value="UPDATE_PRODUCT">Update Product</option>
                            <option value="CHANGE_PASSWORD">Password Change</option>
                            <option value="SIGNUP">Signup</option>
                            <option value="VERIFY_EMAIL">Verify Email</option>
                            <option value="UPDATE_PROFILE">Update Profile</option>
                            <option value="UPDATE_USER_ADMIN">Admin Update User</option>
                            <option value="RESET_PASSWORD_ADMIN">Admin Reset Password</option>
                            <option value="UPDATE_ORDER_PAYMENT">Update Order Payment</option>
                        </select>

                        <select
                            value={entityType}
                            onChange={(e) => setEntityType(e.target.value)}
                            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Entities</option>
                            <option value="User">User</option>
                            <option value="Product">Product</option>
                            <option value="Order">Order</option>
                            <option value="Category">Category</option>
                        </select>

                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="Start Date"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="End Date"
                        />

                        <button
                            onClick={clearFilters}
                            title="Clear Filters"
                            disabled={!search && !action && !entityType && !startDate && !endDate && sort === 'newest'}
                            className={`p-2 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors ${!search && !action && !entityType && !startDate && !endDate && sort === 'newest'
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                                : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'
                                }`}
                        >
                            <FilterX size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto custom-scrollbar p-6">
                <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Entity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">IP Address</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Time</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                            <p className="text-gray-500 dark:text-gray-400">Loading activity logs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                                    {log.user ? log.user.full_name.charAt(0) : '?'}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium">{log.user ? log.user.full_name : 'Unknown User'}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{log.user ? log.user.email : `ID: ${log.user_id}`}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${log.action.includes('CREATE') ? 'bg-green-100 text-green-800' :
                                                    log.action.includes('DELETE') ? 'bg-red-100 text-red-800' :
                                                        log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={log.details}>
                                            {log.details}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {log.ip_address}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center justify-end">
                                                <Clock size={14} className="mr-1" />
                                                {format(new Date(log.createdAt), 'PP p')}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No logs found</h3>
                                            <p className="text-sm max-w-sm mx-auto">
                                                We couldn't find any activity logs matching your current filters.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer - Fixed Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center z-10 flex-shrink-0">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    From <span className="font-medium text-gray-900 dark:text-white">{totalLogs === 0 ? 0 : (page - 1) * 10 + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(page * 10, totalLogs)}</span> of <span className="font-medium text-gray-900 dark:text-white">{totalLogs}</span>
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
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs;
