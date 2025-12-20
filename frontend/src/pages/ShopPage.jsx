import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { Filter, X } from 'lucide-react';

const ShopPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [pagination, setPagination] = useState(null);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Filter States from URL
    const categoryFilter = searchParams.get('category') || '';
    const minPriceFilter = searchParams.get('minPrice') || '';
    const maxPriceFilter = searchParams.get('maxPrice') || '';
    const sortFilter = searchParams.get('sort') || 'newest';
    const searchTerm = searchParams.get('search') || '';

    // Initial fetch for categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                const categoriesData = response.data.categories || response.data;
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Products (Initial & Filter Change)
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);
                if (categoryFilter) params.append('category', categoryFilter);
                if (minPriceFilter) params.append('minPrice', minPriceFilter);
                if (maxPriceFilter) params.append('maxPrice', maxPriceFilter);
                if (sortFilter) params.append('sort', sortFilter);
                params.append('page', 1);
                params.append('limit', 8);

                const { data } = await api.get(`/products?${params.toString()}`);
                setProducts(data.products || []);
                setPagination(data.pagination);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [searchTerm, categoryFilter, minPriceFilter, maxPriceFilter, sortFilter]);

    // Load More Handler
    const handleLoadMore = async () => {
        if (!pagination || pagination.page >= pagination.pages) return;

        setIsLoadingMore(true);
        try {
            const nextPage = pagination.page + 1;
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (categoryFilter) params.append('category', categoryFilter);
            if (minPriceFilter) params.append('minPrice', minPriceFilter);
            if (maxPriceFilter) params.append('maxPrice', maxPriceFilter);
            if (sortFilter) params.append('sort', sortFilter);
            params.append('page', nextPage);
            params.append('limit', 8);

            const { data } = await api.get(`/products?${params.toString()}`);
            setProducts(prev => [...prev, ...data.products]);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Failed to load more products", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        // Reset to page 1 automatically by changing filters which triggers the main useEffect
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Mobile Filter Button */}
                <button
                    className="md:hidden flex items-center justify-center w-full py-2 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 text-gray-900 dark:text-white"
                    onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                >
                    <Filter size={20} className="mr-2" /> Filters
                </button>

                {/* Sidebar Filters */}
                <aside className={`w-full md:w-64 flex-shrink-0 ${isMobileFiltersOpen ? 'block' : 'hidden md:block'}`}>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                            {(categoryFilter || minPriceFilter || maxPriceFilter || searchTerm) && (
                                <button onClick={clearFilters} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Categories */}
                        <div className="mb-8">
                            <h3 className="font-medium text-gray-900 dark:text-gray-200 mb-4">Categories</h3>
                            <div className="space-y-2">
                                <button
                                    className={`block w-full text-left px-2 py-1 rounded text-sm ${!categoryFilter ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    onClick={() => updateFilter('category', '')}
                                >
                                    All Categories
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`block w-full text-left px-2 py-1 rounded text-sm ${categoryFilter === String(cat.id) ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                        onClick={() => updateFilter('category', cat.id)}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="mb-8">
                            <h3 className="font-medium text-gray-900 dark:text-gray-200 mb-4">Price Range</h3>
                            <div className="flex items-center space-x-2">
                                <div className="relative w-full">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">$</span>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                        defaultValue={minPriceFilter}
                                        onBlur={(e) => updateFilter('minPrice', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && updateFilter('minPrice', e.currentTarget.value)}
                                    />
                                </div>
                                <span className="text-gray-400 font-medium">-</span>
                                <div className="relative w-full">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">$</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                        defaultValue={maxPriceFilter}
                                        onBlur={(e) => updateFilter('maxPrice', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && updateFilter('maxPrice', e.currentTarget.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {searchTerm ? `Results for "${searchTerm}"` : 'All Products'}
                        </h1>
                        <div className="flex items-center">
                            <span className="text-gray-500 dark:text-gray-400 text-sm mr-2">Sort by:</span>
                            <select
                                className="border-none bg-transparent font-medium text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer"
                                value={sortFilter}
                                onChange={(e) => updateFilter('sort', e.target.value)}
                            >
                                <option value="newest" className="dark:bg-gray-800">Newest</option>
                                <option value="price_asc" className="dark:bg-gray-800">Price: Low to High</option>
                                <option value="price_desc" className="dark:bg-gray-800">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Load More Button */}
                            {pagination && pagination.page < pagination.pages && (
                                <div className="flex justify-center mt-12">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoadingMore}
                                        className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
                                                Loading...
                                            </>
                                        ) : (
                                            'Load More Products'
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No products found matching your criteria.</p>
                            <button onClick={clearFilters} className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
