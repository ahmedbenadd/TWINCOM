import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUtils';

const ProductCard = ({ product }) => {
    const { addToCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Stop link navigation if button is inside link area

        if (!isAuthenticated) {
            toast.error('Please login to add to cart');
            navigate('/login');
            return;
        }

        const success = await addToCart(product.id, 1);
        if (success) {
            toast.success('Added to cart');
        } else {
            // Error handled in store/api interceptor usually, but maybe fallback
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <Link to={`/product/${product.id}`}>
                <div className="h-48 overflow-hidden relative p-4 flex items-center justify-center">
                    {/* Placeholder image if no image provided */}
                    <img
                        src={getImageUrl(product.images?.[0]?.url || product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                    />
                </div>
            </Link>
            <div className="p-4">
                <Link to={`/product/${product.id}`}>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 truncate">{product.name}</h3>
                </Link>
                <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${product.price}</span>
                    <button
                        onClick={handleAddToCart}
                        className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
                        title="Add to Cart"
                    >
                        <ShoppingCart size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
