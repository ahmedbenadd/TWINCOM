import { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Headphones, ArrowRight, Zap } from 'lucide-react';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch recent products
                const { data } = await api.get('/products');
                // Assuming API returns { products: [] } or just []
                // Taking first 8 as featured
                const productList = data.products || data || [];
                setProducts(productList.slice(0, 8));
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-gray-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 to-purple-900/60 z-0"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48 flex flex-col items-center text-center z-10">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-sm animate-fade-in-up">
                        <Zap size={16} className="mr-2 text-yellow-400" /> New Collection Available
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 drop-shadow-sm">
                        Upgrade Your Tech Life
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
                        Discover the latest in high-performance electronics. From premium audio to next-gen computing, Twincom defines the future.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/shop" className="group bg-white text-indigo-900 hover:bg-indigo-50 font-bold py-3.5 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center">
                            Shop Now <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/shop?sort=newest" className="bg-transparent border border-white/30 hover:bg-white/10 text-white font-semibold py-3.5 px-8 rounded-full transition-all backdrop-blur-sm flex items-center justify-center">
                            View New Arrivals
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features / Benefits */}
            <div className="bg-white dark:bg-gray-900 py-20 border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                                <Truck size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Fast Shipping</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Experience lightning-fast delivery to your doorstep. We ship worldwide with top-tier carriers.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                                <ShieldCheck size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Secure Warranty</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Shop with confidence. All products are backed by our comprehensive 2-year guarantee.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                                <Headphones size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">24/7 Expert Support</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Tech trouble? Our dedicated team of experts is available around the clock to assist you.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex-grow">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Featured Products</h2>
                        <p className="text-gray-500 dark:text-gray-400">Handpicked for performance and value.</p>
                    </div>
                    <Link to="/shop" className="hidden md:flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors">
                        View Collection <ArrowRight size={18} className="ml-2" />
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-xl mb-4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
                <div className="mt-12 text-center md:hidden">
                    <Link to="/shop" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium">
                        View All Products <ArrowRight size={18} className="ml-2" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
