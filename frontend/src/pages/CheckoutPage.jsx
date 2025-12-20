import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils';
import { MapPin, CreditCard, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CheckoutPage = () => {
    const { cart, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // State to track if we are using a saved address or a new one
    // 'new' means manual entry. Otherwise, it's the ID of the saved address.
    const [selectedAddressId, setSelectedAddressId] = useState('new');

    const [formData, setFormData] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: '',
        paymentMethod: 'Cash on Delivery'
    });

    // Initialize with a saved address if available
    useEffect(() => {
        if (user && user.addresses && user.addresses.length > 0) {
            // Find default or first
            const defaultAddr = user.addresses.find(a => a.is_default) || user.addresses[0];
            setSelectedAddressId(defaultAddr.id);
            setFormData(prev => ({
                ...prev,
                address: defaultAddr.street,
                city: defaultAddr.city,
                postalCode: defaultAddr.zip_code,
                country: defaultAddr.country
            }));
        }
    }, [user]);

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0).toFixed(2);
    };

    const handleAddressSelect = (e) => {
        const value = e.target.value;
        setSelectedAddressId(value);

        if (value === 'new') {
            setFormData(prev => ({ ...prev, address: '', city: '', postalCode: '', country: '' }));
        } else {
            const addr = user.addresses.find(a => a.id.toString() === value.toString());
            if (addr) {
                setFormData(prev => ({
                    ...prev,
                    address: addr.street,
                    city: addr.city,
                    postalCode: addr.zip_code,
                    country: addr.country
                }));
            }
        }
    };

    const handleChange = (e) => {
        if (selectedAddressId !== 'new') {
            // If user types while a saved address is selected, switch to 'new' or valid logic?
            // Usually, saved addresses are read-only in checkout selection. 
            // Let's switch to 'new' if they edit to prevent confusion, or just let them edit (it acts as pre-fill).
            // For simplicity, let's keep it bound to form data, but maybe reset selection indicator if they deviate?
            // Actually, keep it simple: just update form data.
        }
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Input Verification
        if (!formData.address.trim()) {
            toast.error("Please enter your shipping address.");
            return;
        }
        if (!formData.city.trim()) {
            toast.error("City is required.");
            return;
        }
        if (!formData.postalCode.trim()) {
            toast.error("Postal Code / ZIP is required.");
            return;
        }
        if (!formData.country.trim()) {
            toast.error("Country is required.");
            return;
        }

        const postalCodeRegex = /^\d{5}$/;
        if (!postalCodeRegex.test(formData.postalCode.trim())) {
            toast.error("Postal Code must be exactly 5 digits.");
            return;
        }

        if (!formData.paymentMethod) {
            toast.error("Please select a payment method.");
            return;
        }

        setIsLoading(true);

        const orderData = {
            orderItems: cart.map(item => ({
                product: item.product.id,
                name: item.product.name,
                image: getImageUrl(item.product.images?.[0]?.url || item.product.imageUrl),
                price: item.product.price,
                countInStock: item.product.countInStock || 0,
                qty: item.quantity
            })),
            shippingAddress: {
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode,
                country: formData.country,
            },
            paymentMethod: formData.paymentMethod,
            itemsPrice: parseFloat(calculateTotal()),
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: parseFloat(calculateTotal()),
        };

        try {
            await api.post('/orders', orderData);
            await clearCart();
            toast.success('Order placed successfully!');
            navigate('/orders');
        } catch (error) {
            // toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col justify-center items-center text-center px-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-6 rounded-full mb-6">
                    <Truck size={48} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">Looks like there are no items in your cart. Start shopping to add items.</p>
                <button
                    onClick={() => navigate('/shop')}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Shipping & Payment */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Shipping Address Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                            <MapPin className="text-indigo-600 dark:text-indigo-400" size={24} />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shipping Address</h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Saved Addresses Selector */}
                            {user && user.addresses && user.addresses.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select a Saved Address</label>
                                    <select
                                        value={selectedAddressId}
                                        onChange={handleAddressSelect}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="new">-- Enter a New Address --</option>
                                        {user.addresses.map(addr => (
                                            <option key={addr.id} value={addr.id}>
                                                {addr.street}, {addr.city} {addr.zip_code} {addr.is_default ? '(Default)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Address Form */}
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="123 Main St"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            required
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="New York"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Code</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            required
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                            placeholder="10001"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        required
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="United States"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                            <CreditCard className="text-indigo-600 dark:text-indigo-400" size={24} />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Method</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {['Credit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery'].map((method) => {
                                    const isDisabled = method !== 'Cash on Delivery';
                                    return (
                                        <label
                                            key={method}
                                            className={`relative flex items-center p-4 border rounded-lg transition-colors 
                                                ${isDisabled ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' :
                                                    (formData.paymentMethod === method ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500 cursor-pointer' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer')}`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method}
                                                checked={formData.paymentMethod === method}
                                                onChange={!isDisabled ? handleChange : undefined}
                                                disabled={isDisabled}
                                                className={`h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 ${isDisabled ? 'bg-gray-100' : ''}`}
                                            />
                                            <div className="ml-3 flex-1 flex justify-between items-center">
                                                <span className={`block text-sm font-medium ${isDisabled ? 'text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                                    {method}
                                                </span>
                                                {isDisabled && (
                                                    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded">
                                                        Unavailable
                                                    </span>
                                                )}
                                                {!isDisabled && method === 'Cash on Delivery' && (
                                                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                        Recommended
                                                    </span>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-24">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Summary</h2>
                        </div>
                        <div className="p-6">
                            <ul className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                                {cart.map((item) => (
                                    <li key={item.id} className="flex items-start py-2">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 flex items-center justify-center">
                                            <img
                                                src={getImageUrl(item.product?.images?.[0]?.url || item.product?.imageUrl)}
                                                alt={item.product?.name}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{item.product?.name}</p>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.quantity} x ${item.product?.price}</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <p>Subtotal</p>
                                    <p>${calculateTotal()}</p>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <p>Shipping</p>
                                    <p>Free</p>
                                </div>
                                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                                    <p>Total</p>
                                    <p className="text-indigo-600 dark:text-indigo-400">${calculateTotal()}</p>
                                </div>
                            </div>

                            {!user?.is_verified && (
                                <div className="mt-6 mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700 dark:text-red-200">
                                                You need to verify your email before placing an order.{' '}
                                                <Link to="/verify-email" state={{ email: user?.email }} className="font-medium underline hover:text-red-600 dark:hover:text-red-100">
                                                    Verify now
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || !user?.is_verified}
                                className="w-full mt-6 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        Place Order <CheckCircle size={20} className="ml-2" />
                                    </>
                                )}
                            </button>

                            <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                                By placing your order, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CheckoutPage;
