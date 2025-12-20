import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useAdminUIStore from '../../store/useAdminUIStore';

const AddEditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const { setTitle } = useAdminUIStore();

    // Separate state for images to handle them easier
    const [imageUrls, setImageUrls] = useState(['', '', '', '']);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        long_description: '',
        brand: '',
        category: '',
        quantity: '',
        quantity: '',
        is_hidden: false,
        specs: [] // Array of { key: '', value: '' } for easier editing
    });

    useEffect(() => {
        setTitle(isEditMode ? 'Loading Product...' : 'Add New Product');
    }, [isEditMode, setTitle]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data.categories || []);
            } catch (error) {
                console.error('Failed to fetch categories');
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (isEditMode) {
            const fetchProduct = async () => {
                try {
                    const { data } = await api.get(`/products/${id}`);
                    const product = data.product; // Extract product object

                    // Update Header Title
                    setTitle(`Edit Product: ${product.name}`);

                    setFormData({
                        name: product.name || '',
                        price: product.price || '',
                        description: product.description || '',
                        long_description: product.long_description || '',
                        brand: product.brand || '',
                        category: product.category?.id || product.category_id || '',
                        quantity: product.quantity || 0,
                        quantity: product.quantity || 0,
                        is_hidden: product.is_hidden || false,
                        specs: product.specs
                            ? Object.entries(product.specs).map(([key, value]) => ({ key, value }))
                            : []
                    });

                    // Populate images
                    if (product.images && Array.isArray(product.images)) {
                        const newImages = ['', '', '', ''];
                        product.images.forEach((img, idx) => {
                            if (idx < 4) newImages[idx] = img.url;
                        });
                        setImageUrls(newImages);
                    }
                } catch (error) {

                    setTitle('Error Fetching Product');
                }
            };
            fetchProduct();
        }
    }, [id, isEditMode, setTitle]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (index, value) => {
        const newImages = [...imageUrls];
        newImages[index] = value;
        setImageUrls(newImages);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Transform images to backend format
        const imagesPayload = imageUrls
            .filter(url => url.trim() !== '')
            .map(url => ({ url, alt_text: formData.name }));

        const { category, ...restFormData } = formData;

        const payload = {
            ...restFormData,
            category_id: formData.category,
            images: imagesPayload,
            specs: formData.specs.reduce((acc, { key, value }) => {
                if (key.trim() && value.trim()) acc[key.trim()] = value.trim();
                return acc;
            }, {})
        };

        try {
            if (isEditMode) {
                await api.put(`/products/${id}`, payload);
                toast.success('Product updated successfully');
            } else {
                await api.post('/products', payload);
                toast.success('Product created successfully');
            }
            navigate('/admin/products');
        } catch (error) {
            console.error(error);
            // Error managed by interceptor
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            {/* Header - Fixed */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 z-10 flex justify-between items-center bg-transparent">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isEditMode ? 'Edit Product Details' : 'Product Details'}
                </h1>

                {/* Visibility Toggle */}
                <div className="flex items-center space-x-3">
                    <div className="text-right">
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">Visibility</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">{formData.is_hidden ? 'Hidden' : 'Visible'}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, is_hidden: !prev.is_hidden }))}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${formData.is_hidden ? 'bg-gray-200 dark:bg-gray-600' : 'bg-green-500'}`}
                        role="switch"
                        aria-checked={!formData.is_hidden}
                    >
                        <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.is_hidden ? 'translate-x-0' : 'translate-x-5'}`}
                        />
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto custom-scrollbar p-6">
                <form id="product-form" onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6 max-w-4xl mx-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                            <input type="number" name="price" required value={formData.price} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Quantity</label>
                            <input type="number" name="quantity" required value={formData.quantity} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Short Description</label>
                        <textarea name="description" rows={2} required value={formData.description} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Long Description</label>
                        <textarea name="long_description" rows={6} value={formData.long_description} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URLs (e.g., /public/productImages/name.jpg)</label>
                        <div className="space-y-3">
                            {imageUrls.map((url, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    placeholder={`Image URL ${index + 1}`}
                                    value={url}
                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">First image will be the main cover image.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
                            <input type="text" name="brand" required value={formData.brand} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                            <select
                                name="category"
                                required
                                value={formData.category}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Specifications Editor */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specifications (Key - Value)</label>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, specs: [...prev.specs, { key: '', value: '' }] }))}
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                            >
                                + Add Spec
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.specs.map((spec, index) => (
                                <div key={index} className="flex gap-4 items-start">
                                    <input
                                        type="text"
                                        placeholder="Key (e.g., Processor)"
                                        value={spec.key}
                                        onChange={(e) => {
                                            const newSpecs = [...formData.specs];
                                            newSpecs[index].key = e.target.value;
                                            setFormData({ ...formData, specs: newSpecs });
                                        }}
                                        className="block w-1/3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value (e.g., Ryzen 7 5700G)"
                                        value={spec.value}
                                        onChange={(e) => {
                                            const newSpecs = [...formData.specs];
                                            newSpecs[index].value = e.target.value;
                                            setFormData({ ...formData, specs: newSpecs });
                                        }}
                                        className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newSpecs = formData.specs.filter((_, i) => i !== index);
                                            setFormData({ ...formData, specs: newSpecs });
                                        }}
                                        className="text-red-600 hover:text-red-800 pt-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            {formData.specs.length === 0 && (
                                <p className="text-sm text-gray-500 italic">No specifications added yet.</p>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* Footer - Fixed Buttons */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end space-x-3 z-10">
                <button type="button" onClick={() => navigate('/admin/products')} className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium">
                    Cancel
                </button>
                <button
                    type="submit"
                    form="product-form" // Link button to form via ID
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm font-medium"
                >
                    {isEditMode ? 'Save Changes' : 'Create Product'}
                </button>
            </div>
        </div>
    );
};

export default AddEditProduct;
