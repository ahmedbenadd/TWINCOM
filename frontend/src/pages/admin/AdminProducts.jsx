import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Edit, Trash2, Plus, Eye, EyeOff, Package, X, FilterX } from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUtils';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [lowStock, setLowStock] = useState(false);
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [visibility, setVisibility] = useState('all');
    const [confirmation, setConfirmation] = useState({ isOpen: false, type: null, data: null });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data.categories || data || []);
            } catch (error) {
                console.error("Failed to load categories");
            }
        };
        fetchCategories();
    }, []);

    // Fetch products (include hidden ones)
    const fetchProducts = async (currentPage = 1) => {
        try {
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: 10,
                visibility,
                ...(search && { search }),
                ...(sort && { sort }),
                ...(category && { category }),
                ...(lowStock && { lowStock: 'true' })
            });

            const { data } = await api.get(`/products?${queryParams}`);
            const newProducts = data.products || data || [];

            // Pagination: Replace products
            setProducts(newProducts);
            setTotalItems(data.pagination?.total || 0);

            if (newProducts.length < 10) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
            setIsLoading(false);
        } catch (error) {
            // toast.error('Failed to load products');
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('');
        setSort('newest');
        setLowStock(false);
        setVisibility('all');
        setPage(1);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts(1);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search, sort, lowStock, category, visibility]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1); // Reset to page 1 on search change (effect will handle fetch)
    };

    const nextPage = () => {
        const next = page + 1;
        setPage(next);
        fetchProducts(next);
    };

    const prevPage = () => {
        if (page > 1) {
            const prev = page - 1;
            setPage(prev);
            fetchProducts(prev);
        }
    };

    const handleDelete = (id) => {
        setConfirmation({
            isOpen: true,
            type: 'delete',
            data: id,
            title: 'Delete Product',
            message: 'Are you sure you want to delete this product? This action cannot be undone.',
            isDangerous: true
        });
    };

    const confirmDelete = async () => {
        const id = confirmation.data;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Product deleted');
            fetchProducts(1);
            setPage(1);
        } catch (error) {
            // toast.error('Failed to delete product');
        }
    };

    const handleToggleVisibility = async (product) => {
        try {
            const { data } = await api.patch(`/products/${product.id}/visibility`);
            toast.success(`Product is now ${data.product.is_hidden ? 'Hidden' : 'Visible'}`);

            // Strict Update: Use the actual object returned by the server
            setProducts(currentProducts => currentProducts.map(p =>
                p.id === product.id ? data.product : p
            ));
        } catch (error) {
            console.error('Failed to change visibility', error);
            // On error, refresh to ensure we are consistent
            fetchProducts(page);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            {/* Header - Fixed */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 z-10 space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Products</h1>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
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
                            <option value="newest">Newest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>

                        <button
                            onClick={() => setLowStock(!lowStock)}
                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${lowStock
                                ? 'bg-red-100 border-red-200 text-red-800'
                                : 'bg-gray-50 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'}`}
                        >
                            {lowStock ? 'Low Stock Only' : 'All Stock'}
                        </button>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        <select
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Visibility</option>
                            <option value="visible">Visible Only</option>
                            <option value="hidden">Hidden Only</option>
                        </select>

                        <button
                            onClick={clearFilters}
                            disabled={!search && !category && !lowStock && sort === 'newest' && visibility === 'all'}
                            title="Clear Filters"
                            className={`p-2 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors ${!search && !category && !lowStock && sort === 'newest' && visibility === 'all'
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                                : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'
                                }`}
                        >
                            <FilterX size={18} />
                        </button>
                    </div>

                    <Link to="/admin/products/add" className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap">
                        <Plus size={18} className="mr-2" /> Add
                    </Link>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto custom-scrollbar p-6">
                <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Stock</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                            <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : products.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product.id} className={`transition-colors ${product.is_hidden ? 'bg-gray-50 dark:bg-gray-900 opacity-75' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img src={getImageUrl(product.images?.[0]?.url || product.imageUrl)} alt="" className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {product.name}
                                            {!!product.is_hidden && <span className="ml-2 text-xs text-red-500 font-bold">(Hidden)</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${product.price}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleToggleVisibility(product)}
                                                className={`flex items-center space-x-1 text-xs font-bold uppercase ${product.is_hidden ? 'text-gray-500' : 'text-green-600'
                                                    }`}
                                            >
                                                {product.is_hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                                                <span>{product.is_hidden ? 'Hidden' : 'Visible'}</span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.quantity > 0 ? `${product.quantity} in Stock` : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link to={`/admin/products/edit/${product.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4 inline-block">
                                                <Edit size={18} />
                                            </Link>
                                            <button onClick={() => handleDelete(product.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 inline-block">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No products found</h3>
                                            <p className="text-sm max-w-sm mx-auto">
                                                Try adjusting your search or filters to find what you're looking for.
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
            {/* Footer - Fixed Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center z-10 flex-shrink-0">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    From <span className="font-medium text-gray-900 dark:text-white">{totalItems === 0 ? 0 : (page - 1) * 10 + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(page * 10, totalItems)}</span> of <span className="font-medium text-gray-900 dark:text-white">{totalItems}</span>
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
                        disabled={!hasMore}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
                onConfirm={confirmDelete}
                title={confirmation.title}
                message={confirmation.message}
                isDangerous={confirmation.isDangerous}
                confirmText="Delete"
            />
        </div>
    );
};

export default AdminProducts;
