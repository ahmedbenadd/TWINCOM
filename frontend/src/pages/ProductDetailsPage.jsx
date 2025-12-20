import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { ShoppingCart, ArrowLeft, ArrowRight, FileText, List, Star, Check, X } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';
import ProductCard from '../components/product/ProductCard';


const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('specs');
    const [showLightbox, setShowLightbox] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const { addToCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                setProduct(data.product);

                // Fetch related products logic: Prioritize same category, fill with others to ensure 4 items
                if (data.product.category_id) {
                    try {
                        const { data: allProducts } = await api.get('/products?limit=100');
                        const products = allProducts.products;
                        const currentId = data.product.id;

                        // 1. Get products from same category (excluding current)
                        let related = products
                            .filter(p => p.category_id === data.product.category_id && p.id !== currentId);

                        // 2. If we have less than 4, fill with other products
                        if (related.length < 4) {
                            const otherProducts = products.filter(p =>
                                p.category_id !== data.product.category_id &&
                                p.id !== currentId
                            );

                            // Shuffle or just take from otherProducts to fill the gap
                            const needed = 4 - related.length;
                            related = [...related, ...otherProducts.slice(0, needed)];
                        }

                        // 3. Slice to ensure exactly 4 (or fewer if total db size is small)
                        setRelatedProducts(related.slice(0, 4));
                    } catch (err) {
                        console.error("Failed to fetch related products", err);
                    }
                }
            } catch (error) {
                navigate('/shop');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0); // Scroll to top on id change
    }, [id, navigate]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to add to cart');
            navigate('/login');
            return;
        }
        const success = await addToCart(product.id, quantity);
        if (success) {
            toast.success('Added to cart');
        }
    };

    const nextImage = (e) => {
        e?.stopPropagation();
        if (product?.images?.length) {
            setSelectedImage((prev) => (prev + 1) % product.images.length);
        }
    };

    const prevImage = (e) => {
        e?.stopPropagation();
        if (product?.images?.length) {
            setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!product) return null;

    const currentImageUrl = getImageUrl(product.images?.[selectedImage]?.url || (selectedImage === 0 ? product.imageUrl : ''));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-300">
            {/* Lightbox Modal */}
            {showLightbox && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => { setShowLightbox(false); setIsZoomed(false); }}
                >
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
                        onClick={() => { setShowLightbox(false); setIsZoomed(false); }}
                    >
                        <X size={32} />
                    </button>

                    <div
                        className="relative w-full h-full flex items-center justify-center max-w-7xl mx-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Lightbox Nav */}
                        {product.images?.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 p-4 rounded-full bg-black/50 hover:bg-white/20 text-white transition-all backdrop-blur-md z-10"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 p-4 rounded-full bg-black/50 hover:bg-white/20 text-white transition-all backdrop-blur-md z-10"
                                >
                                    <ArrowRight size={24} /> {/* Using ArrowRight icon but can swap to Chevron if preferred, sticking to lucide imports available */}
                                </button>
                            </>
                        )}

                        <div className={`relative overflow-hidden cursor-zoom-in transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-zoom-out' : ''}`}
                            onClick={() => setIsZoomed(!isZoomed)}
                        >
                            <img
                                src={currentImageUrl}
                                alt={product.name}
                                className="max-h-[90vh] max-w-full object-contain select-none"
                            />
                        </div>
                    </div>

                    {/* Lightbox Thumbnails */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] pb-2 scrollbar-hide" onClick={(e) => e.stopPropagation()}>
                        {product.images?.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-indigo-500 scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                                    }`}
                            >
                                <img src={getImageUrl(img.url)} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/shop')}
                    className="group flex items-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-all duration-200"
                >
                    <div className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm group-hover:shadow-md mr-3 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="font-medium">Back to Shop</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">
                    {/* Image Section - Scrolling with content */}
                    <div className="space-y-6 select-none lg:sticky lg:top-24 lg:self-start">
                        <div className="relative rounded-2xl overflow-hidden bg-white/50 dark:bg-gray-800/50 shadow-xl border border-gray-100 dark:border-gray-700 h-96 md:h-[600px] flex items-center justify-center p-8 group">
                            {/* Navigation Arrows (Desktop) */}
                            {product.images?.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg text-gray-800 dark:text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg text-gray-800 dark:text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                </>
                            )}

                            {/* Zoom Hint */}
                            <div className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                <span className="text-xs font-semibold flex items-center gap-1">
                                    Click to Expand
                                </span>
                            </div>

                            <img
                                src={currentImageUrl}
                                alt={product.name}
                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
                                onClick={() => setShowLightbox(true)}
                            />
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all duration-200 snap-start ${selectedImage === index
                                            ? 'border-indigo-600 shadow-lg scale-105 ring-2 ring-indigo-600/20'
                                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 opacity-70 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={getImageUrl(img.url)}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover bg-white/80 dark:bg-gray-700"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info Section - Now the main scrollable content on desktop */}
                    <div className="flex flex-col">
                        <div className="mb-8">
                            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full">
                                {product.category?.name || 'Create'}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-end gap-4 mb-6">
                                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                    ${product.price}
                                </p>
                            </div>

                            {/* Actions (Restored) */}
                            <div className="flex flex-col sm:flex-row gap-6 items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
                                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600 transition-colors disabled:opacity-50"
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-bold text-lg text-gray-900 dark:text-white">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center group"
                                >
                                    <ShoppingCart className="mr-3 group-hover:scale-110 transition-transform" />
                                    Add into Cart
                                </button>
                            </div>

                            {/* Premium Overview Box */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed font-medium">
                                    {product.description}
                                </p>
                            </div>
                        </div>

                        {/* Modern Tabs */}
                        <div className="flex-1">
                            <div className="flex p-1 space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-8 w-fit">
                                <button
                                    onClick={() => setActiveTab('specs')}
                                    className={`
                                        flex items-center px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
                                        ${activeTab === 'specs'
                                            ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
                                    `}
                                >
                                    <List size={16} className="mr-2" />
                                    Technical Specs
                                </button>
                                {product.long_description && (
                                    <button
                                        onClick={() => setActiveTab('description')}
                                        className={`
                                            flex items-center px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
                                            ${activeTab === 'description'
                                                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
                                        `}
                                    >
                                        <FileText size={16} className="mr-2" />
                                        In-Depth Details
                                    </button>
                                )}
                            </div>

                            {/* Tab Content Area */}
                            <div className="min-h-[300px]">
                                {activeTab === 'specs' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {product.specs && Object.entries(product.specs).map(([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="group flex flex-col p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:shadow-md transition-all duration-200"
                                                >
                                                    <dt className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 group-hover:text-indigo-500/70 transition-colors">
                                                        {key}
                                                    </dt>
                                                    <dd className="text-base font-semibold text-gray-900 dark:text-gray-100 break-words">
                                                        {value}
                                                    </dd>
                                                </div>
                                            ))}

                                            {/* Fallback if no specs */}
                                            {!product.specs && (
                                                <div className="col-span-2 text-center py-12 text-gray-400 italic bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                                    Detailed specifications coming soon.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'description' && product.long_description && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="prose prose-lg prose-indigo dark:prose-invert max-w-none">
                                            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm whitespace-pre-line text-gray-600 dark:text-gray-300 leading-8">
                                                {product.long_description}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20 border-t border-gray-200 dark:border-gray-800 pt-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">You Might Also Like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailsPage;

