import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, LogOut, Sun, Moon, ShoppingBag, Settings } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useCartStore from '../../store/useCartStore';
import useThemeStore from '../../store/useThemeStore';
import logo from '../../assets/logo.png';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout, isAuthenticated } = useAuthStore();
    const { cart } = useCartStore();
    const { theme, toggleTheme } = useThemeStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = () => {
        if (searchTerm.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
        } else {
            navigate('/shop');
        }
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50 font-sans transition-all duration-200 dark:bg-gray-900/90 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo & Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            {/* using text logo for better dark mode support and scaling */}
                            <span className="text-3xl font-bold text-gray-900 tracking-tight dark:text-white">TWIN<span className="text-indigo-600 dark:text-indigo-400">COM</span></span>
                        </Link>
                    </div>

                    {/* Desktop Search */}
                    <div className="hidden md:flex flex-1 items-center justify-center max-w-2xl px-8">
                        <div className="relative w-full group">
                            <input
                                type="text"
                                placeholder="Search for products..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 transition-all duration-300 ease-in-out shadow-sm group-hover:shadow-md"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                <Search size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-8">
                        <div className="flex space-x-6">
                            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors dark:text-gray-300 dark:hover:text-indigo-400">Home</Link>
                            <Link to="/shop" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors dark:text-gray-300 dark:hover:text-indigo-400">Shop</Link>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                            aria-label="Toggle Dark Mode"
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        <div className="flex items-center space-x-6 pl-6 border-l border-gray-100 dark:border-gray-700">
                            {/* Cart */}
                            <Link to="/cart" className="relative group p-2 rounded-full hover:bg-gray-50 transition-colors">
                                <ShoppingCart size={22} className="text-gray-700 group-hover:text-indigo-600 transition-colors" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full border-2 border-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* User Profile */}
                            {isAuthenticated ? (
                                <div className="relative group z-50">
                                    <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-all focus:outline-none">
                                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <User size={20} />
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                                        <div className="px-4 py-3">
                                            <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{user?.full_name || user?.username}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                        </div>
                                        <div className="py-1">
                                            {user?.role === 'admin' && (
                                                <Link to="/admin" className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                                    <Settings size={16} className="mr-2" /> Admin Dashboard
                                                </Link>
                                            )}
                                            <Link to={user?.role === 'admin' || user?.role === 'root' ? "/admin/settings" : "/profile"} className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                                <User size={16} className="mr-2" /> {user?.role === 'admin' || user?.role === 'root' ? 'Admin Profile' : 'Your Profile'}
                                            </Link>
                                            <Link to="/orders" className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                                <ShoppingBag size={16} className="mr-2" /> Orders
                                            </Link>
                                        </div>
                                        <div className="py-1">
                                            <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center border-t border-gray-100 dark:border-gray-700">
                                                <LogOut size={16} className="mr-2" /> Sign out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-indigo-50 text-gray-600 transition-colors">
                                        <User size={20} />
                                    </div>
                                    <span>Login</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <Link to="/cart" className="relative p-2 mr-2 text-gray-700 hover:text-indigo-600">
                            <ShoppingCart size={24} />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 dark:bg-gray-900 dark:border-gray-800">
                    <div className="px-4 pt-4 pb-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <div className="absolute left-3 top-2.5 text-gray-400">
                                <Search size={16} />
                            </div>
                        </div>
                    </div>
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400">Home</Link>
                        <Link to="/shop" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400">Shop</Link>

                        {isAuthenticated ? (
                            <>
                                <div className="border-t border-gray-100 my-2 dark:border-gray-800"></div>
                                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</div>
                                <Link to={user?.role === 'admin' || user?.role === 'root' ? "/admin/settings" : "/profile"} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400">Profile</Link>
                                <Link to="/orders" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400">My Orders</Link>
                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400">Admin Dashboard</Link>
                                )}
                                <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 mt-1 dark:hover:bg-gray-800">Logout</button>
                            </>
                        ) : (
                            <>
                                <div className="border-t border-gray-100 my-2 dark:border-gray-800"></div>
                                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400">Login / Signup</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
