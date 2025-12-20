import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Menu, Bell, Eye, FileText } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useAdminUIStore from '../../store/useAdminUIStore';
import ThemeToggle from '../../components/common/ThemeToggle';
import api from '../../services/api';
import { useState, useEffect } from 'react';

const AdminLayout = () => {
    const { logout, user } = useAuthStore();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const [ordersRes, productsRes] = await Promise.all([
                    api.get('/orders/all?status=pending&limit=5'), // Fetch pending orders
                    api.get('/products?lowStock=true&limit=5')     // Fetch low stock products
                ]);

                const pendingOrders = ordersRes.data.orders || [];
                const lowStockProducts = productsRes.data.products || [];

                const newNotifications = [];

                // Process Pending Orders
                pendingOrders.forEach(order => {
                    newNotifications.push({
                        id: `order-${order.id}`,
                        type: 'order',
                        title: 'New Order Pending',
                        message: `Order #${order.id} needs processing`,
                        time: new Date(order.createdAt),
                        link: '/admin/orders'
                    });
                });

                // Process Low Stock
                lowStockProducts.forEach(prod => {
                    newNotifications.push({
                        id: `prod-${prod.id}`,
                        type: 'alert',
                        title: 'Low Stock Alert',
                        message: `${prod.name} has only ${prod.quantity} left`,
                        time: new Date(), // Just now
                        link: `/admin/products/edit/${prod.id}`
                    });
                });

                // Sort by simplified logic (Alerts first or mix)
                setNotifications(newNotifications);
                setHasUnread(newNotifications.length > 0);

            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        fetchNotifications();
        // Poll every 60 seconds for "Pro" real-time feel
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const { title, setTitle } = useAdminUIStore();

    // Reset title on route change if not explicitly set by page
    useEffect(() => {
        // Map common routes to titles
        const path = location.pathname;
        if (path === '/admin') setTitle('Dashboard');
        else if (path === '/admin/products') setTitle('Products');
        else if (path === '/admin/orders') setTitle('Orders');
        else if (path === '/admin/users') setTitle('Users');
        else if (path === '/admin/activity') setTitle('Activity Logs');
        // Dynamic routes (edit/details) will set their own title in the page component
    }, [location.pathname, setTitle]);

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-950 p-3 gap-3 overflow-hidden font-sans">
            {/* Sidebar - Floating & Static */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white flex flex-col shadow-2xl transition-all duration-300 z-20 flex-shrink-0 rounded-2xl overflow-hidden`}>
                <div className="h-16 flex items-center justify-center border-b border-slate-800 bg-slate-900">
                    {sidebarOpen ? (
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">TWINCOM</h1>
                    ) : (
                        <span className="text-2xl font-bold text-indigo-400">T</span>
                    )}
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                    <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" active={isActive('/admin')} expanded={sidebarOpen} />
                    <NavItem to="/admin/products" icon={Package} label="Products" active={isActive('/admin/products')} expanded={sidebarOpen} />
                    <NavItem to="/admin/orders" icon={ShoppingBag} label="Orders" active={isActive('/admin/orders')} expanded={sidebarOpen} />
                    <NavItem to="/admin/users" icon={Users} label="Users" active={isActive('/admin/users')} expanded={sidebarOpen} />
                    <NavItem to="/admin/activity" icon={FileText} label="Activity Logs" active={isActive('/admin/activity')} expanded={sidebarOpen} />

                    <div className="my-4 border-t border-slate-800 mx-3"></div>

                    <a
                        href="/"
                        className={`flex items-center ${sidebarOpen ? 'px-4' : 'justify-center'} py-3 rounded-lg text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition-all duration-200 group`}
                    >
                        <Eye size={20} className="group-hover:text-emerald-300 transition-colors" />
                        {sidebarOpen && <span className="ml-3 font-medium tracking-wide pb-0.5">View Shop</span>}
                    </a>
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-900">
                    <button
                        onClick={logout}
                        className={`flex items-center ${sidebarOpen ? 'px-4' : 'justify-center'} py-3 w-full rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200`}
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content Wrapper - Floating */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800">
                {/* Top Header - Static */}
                <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 z-40 transition-colors duration-200 flex-shrink-0">
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 focus:outline-none transition-colors">
                            <Menu size={24} />
                        </button>
                        <h2 className="ml-4 text-xl font-bold text-gray-800 dark:text-white capitalize truncate max-w-md tracking-tight">
                            {title}
                        </h2>
                    </div>

                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <div className="relative group">
                            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 relative transition-transform active:scale-95">
                                <Bell size={20} />
                                {hasUnread && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
                                )}
                            </button>
                            {/* Dropdown */}
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 hidden group-hover:block z-50 transform origin-top-right transition-all duration-200">
                                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-white">Notifications</h3>
                                    {hasUnread && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{notifications.length} New</span>}
                                </div>
                                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <Link key={notif.id} to={notif.link} className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors">
                                                <div className="flex items-start">
                                                    <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 ${notif.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                        {notif.type === 'alert' ? <span className="block w-2 h-2 rounded-full bg-current" /> : <span className="block w-2 h-2 rounded-full bg-current" />}
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.message}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                                            <Bell size={32} className="mb-3 opacity-20" />
                                            <p className="text-sm font-medium">No new notifications</p>
                                            <p className="text-xs mt-1">You're all caught up!</p>
                                        </div>
                                    )}
                                </div>
                                {notifications.length > 0 && (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 text-center">
                                        <button onClick={() => { setNotifications([]); setHasUnread(false); }} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                                            Mark all as read
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Link to="/admin/settings" className="flex items-center space-x-3 ml-4 border-l border-gray-200 dark:border-gray-700 pl-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-1 transition-colors">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.full_name || 'Admin'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user?.role === 'root' ? 'Root Admin' : user?.role === 'admin' ? 'Admin' : 'Administrator'}
                                </p>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold border-2 border-white dark:border-gray-700 shadow-sm">
                                {user?.full_name?.charAt(0) || 'A'}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-900 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const NavItem = ({ to, icon: Icon, label, active, expanded }) => (
    <Link
        to={to}
        className={`flex items-center ${expanded ? 'px-4' : 'justify-center'} py-3 rounded-lg transition-all duration-200 group ${active
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
    >
        <Icon size={20} className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-white'} transition-colors duration-200`} />
        {expanded && <span className="ml-3 font-medium tracking-wide">{label}</span>}
    </Link>
);

export default AdminLayout;
