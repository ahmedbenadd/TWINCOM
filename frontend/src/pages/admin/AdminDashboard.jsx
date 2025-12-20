import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, Activity, Server, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [activities, setActivities] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [systemStatus, setSystemStatus] = useState('checking'); // checking, operational, degraded, down
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [ordersRes, usersRes, productsRes, activityRes] = await Promise.all([
                    api.get('/orders/all?limit=10&sort=desc'),
                    api.get('/users/all'),
                    api.get('/products?limit=1000'),
                    api.get('/activity-logs?page=1&limit=5')
                ]);

                const orders = ordersRes.data.orders || [];
                const users = usersRes.data.users || [];
                const products = productsRes.data.products || [];
                const logs = activityRes.data.logs || [];

                const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);

                // Process chart data (last 7 days sales)
                const last7Days = [...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    return d.toISOString().split('T')[0];
                }).reverse();

                const salesMap = orders.reduce((acc, order) => {
                    const date = new Date(order.createdAt).toISOString().split('T')[0];
                    acc[date] = (acc[date] || 0) + parseFloat(order.total_price || 0);
                    return acc;
                }, {});

                const graphData = last7Days.map(date => ({
                    name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    sales: salesMap[date] || 0
                }));

                setChartData(graphData);
                setRecentOrders(orders.slice(0, 5));
                setActivities(logs);

                setStats({
                    totalSales,
                    totalOrders: orders.length,
                    totalUsers: users.length,
                    totalProducts: products.length
                });

                // Simulate System Status Logic (Checking key services)
                // In a real app, this would ping a health endpoint
                if (productsRes.status === 200 && usersRes.status === 200) {
                    setSystemStatus('operational');
                } else {
                    setSystemStatus('degraded');
                }

            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                setSystemStatus('degraded');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);



    return (
        <div className="flex flex-col bg-transparent">
            {/* Header - Fixed but scrolling with page now */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 z-10 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-32 animate-pulse flex flex-col justify-center">
                                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full mb-3"></div>
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        ))
                    ) : (
                        <>
                            <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="indigo" />
                            <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} color="emerald" />
                            <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="amber" />
                            <StatCard icon={Package} label="Total Products" value={stats.totalProducts} color="rose" />
                        </>
                    )}
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sales Chart (2/3 width) */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
                                <TrendingUp size={20} className="mr-2 text-indigo-500" /> Sales Trend (Last 7 Days)
                            </h2>
                        </div>
                        <div className="h-56 w-full">
                            {isLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `$${value}`} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            formatter={(value) => [`$${value}`, 'Sales']}
                                        />
                                        <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* System Status (1/3 width) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center mb-4">
                            <Server size={20} className="mr-2 text-indigo-500" /> System Status
                        </h2>
                        {isLoading ? (
                            <div className="space-y-4 animate-pulse">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                    </div>
                                ))}
                                <div className="mt-6 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <StatusRow label="Database" status={systemStatus === 'operational' ? 'Operational' : 'Issues Detected'} />
                                    <StatusRow label="Admin Panel" status="Operational" />
                                    <StatusRow label="Online Store" status="Operational" />
                                    <StatusRow label="Backend" status={systemStatus === 'operational' ? 'Operational' : 'Issues Detected'} />
                                </div>

                                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center">
                                        {systemStatus === 'operational' ?
                                            <CheckCircle className="text-green-500 mr-2" size={20} /> :
                                            <AlertCircle className="text-yellow-500 mr-2" size={20} />
                                        }
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {systemStatus === 'operational' ? 'All Systems Normal' : 'Performance Degraded'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Last checked: {new Date().toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[320px]">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Recent Orders</h2>
                            <Link to="/admin/orders" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline">View All</Link>
                        </div>
                        <div className="overflow-auto flex-1 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : recentOrders.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 font-semibold sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3">ID</th>
                                            <th className="px-6 py-3">Customer</th>
                                            <th className="px-6 py-3">Total</th>
                                            <th className="px-6 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {recentOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">#{order.id}</td>
                                                <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{order.user?.full_name || 'Guest'}</td>
                                                <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-gray-200">${parseFloat(order.total_price).toFixed(2)}</td>
                                                <td className="px-6 py-3 text-sm">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold 
                                                ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                    'bg-yellow-100 text-yellow-700'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center h-full">
                                    <ShoppingBag size={48} className="mb-3 opacity-20" />
                                    <p className="text-lg font-medium">No recent orders</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[320px]">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
                                <Activity size={18} className="mr-2 text-indigo-500" /> Recent Activity
                            </h2>
                            <Link to="/admin/activity" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline">View Log</Link>
                        </div>

                        <div className="overflow-auto flex-1 custom-scrollbar">
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : activities.length > 0 ? (
                                    activities.map((act) => (
                                        <div key={act.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div className="flex items-start space-x-3">
                                                <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 
                                                    ${act.action.includes('CREATE') ? 'bg-green-100 text-green-600' :
                                                        act.action.includes('DELETE') ? 'bg-red-100 text-red-600' :
                                                            'bg-blue-100 text-blue-600'}`}>
                                                    <FileText size={14} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {act.action} <span className="text-gray-500 dark:text-gray-400 font-normal">by {act.user?.full_name || 'System'}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate" title={act.details}>
                                                        {act.details}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 mt-1">
                                                        {new Date(act.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-gray-500 h-full flex items-center justify-center">
                                        <p className="text-sm">No recent activity.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusRow = ({ label, status }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${status === 'Operational'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
            {status}
        </span>
    </div>
);

// StatCard Component (unchanged)
const StatCard = ({ icon: Icon, label, value, color, alert }) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition-transform hover:scale-[1.02] ${alert ? 'ring-2 ring-red-500 ring-opacity-50' : ''}`}>
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600 dark:bg-${color}-900/30 dark:text-${color}-400`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value}</h3>
        </div>
    </div>
);



export default AdminDashboard;
