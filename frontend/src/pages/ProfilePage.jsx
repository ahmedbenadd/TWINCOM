import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { User, Mail, MapPin, Lock } from 'lucide-react';

const ProfilePage = () => {
    const { user, checkAuth } = useAuthStore();

    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({ full_name: '', email: '', phone: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [passwordData, setPasswordData] = useState({ password: '', newPassword: '', confirmNewPassword: '' });
    const [addressData, setAddressData] = useState({ street: '', city: '', state: '', zip_code: '', country: '', is_default: false });
    const [isAddingAddress, setIsAddingAddress] = useState(false);

    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

    useEffect(() => {
        // Only run this check once on mount if user status is ambiguous or unverified
        if (!hasCheckedAuth) {
            if (!user || user.is_verified !== true) {
                checkAuth().finally(() => setHasCheckedAuth(true));
            } else {
                setHasCheckedAuth(true);
            }
        }
    }, [user, checkAuth, hasCheckedAuth]);

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || user.username || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setAddressData({ ...addressData, [e.target.name]: value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.put('/users/profile', formData);
            await checkAuth();
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error("Failed to update profile", error);

        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            toast.error("New passwords do not match");
            return;
        }
        setIsLoading(true);
        try {
            await api.put('/users/password', { password: passwordData.password, newPassword: passwordData.newPassword });
            setPasswordData({ password: '', newPassword: '', confirmNewPassword: '' });
            toast.success('Password updated successfully');
        } catch (error) {
            console.error("Failed to update password", error);

        } finally {
            setIsLoading(false);
        }
    };

    const [editingAddressId, setEditingAddressId] = useState(null);

    const handleEditAddress = (address) => {
        setAddressData({
            street: address.street,
            city: address.city,
            state: address.state,
            zip_code: address.zip_code,
            country: address.country,
            is_default: address.is_default
        });
        setEditingAddressId(address.id);
        setIsAddingAddress(true);
        // Scroll to form if needed
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();

        // Strict Zip Validation
        if (!/^\d{5}$/.test(addressData.zip_code.toString().trim())) {
            toast.error("Zip code must be exactly 5 digits", { id: 'zip-error' });
            return;
        }

        setIsLoading(true);
        try {
            if (editingAddressId) {
                await api.put('/users/address', { ...addressData, addressId: editingAddressId });
                toast.success('Address updated successfully', { id: 'address-update' });
            } else {
                await api.post('/users/address', addressData);
                toast.success('Address added successfully', { id: 'address-add' });
            }
            await checkAuth();
            setIsAddingAddress(false);
            setEditingAddressId(null);
            setAddressData({ street: '', city: '', state: '', zip_code: '', country: '', is_default: false });
        } catch (error) {
            console.error(editingAddressId ? "Failed to update address" : "Failed to add address", error);

        } finally {
            setIsLoading(false);
        }
    };


    const handleSetDefaultAddress = async (addressId) => {
        setIsLoading(true);
        try {
            await api.put('/users/address/default', { addressId });
            await checkAuth();
            toast.success('Default address updated', { id: 'default-address' });
        } catch (error) {
            console.error("Failed to update default address", error);

        } finally {
            setIsLoading(false);
        }
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);

    const handleDeleteAddress = (addressId) => {
        setAddressToDelete(addressId);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteAddress = async () => {
        if (!addressToDelete) return;

        try {
            await api.delete('/users/address', { data: { addressId: addressToDelete } });
            await checkAuth();
            toast.success('Address deleted successfully');
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Failed to delete address", error);

        }
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Account</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar / Tabs */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <User size={20} className="mr-3" /> Profile Details
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <Lock size={20} className="mr-3" /> Security
                        </button>
                        <button
                            onClick={() => setActiveTab('addresses')}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'addresses' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <MapPin size={20} className="mr-3" /> Addresses
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-6 md:p-8">
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h2>
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                minLength={3}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Verification Status)</label>
                                            <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                                                <span className="text-gray-700 dark:text-gray-300">{formData.email}</span>
                                                {user?.is_verified ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        <svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                                                            <circle cx="4" cy="4" r="3" />
                                                        </svg>
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center space-x-3">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                            Unverified
                                                        </span>
                                                        <Link to="/verify-email" state={{ email: user?.email }} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline">
                                                            Verify Now
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-8 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                                        >
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h2>
                                <form onSubmit={handleUpdatePassword}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={passwordData.password}
                                                onChange={handlePasswordChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                required
                                                minLength={6}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                name="confirmNewPassword"
                                                value={passwordData.confirmNewPassword}
                                                onChange={handlePasswordChange}
                                                required
                                                minLength={6}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-8 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                                        >
                                            {isLoading ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
                                    <button
                                        onClick={() => {
                                            setIsAddingAddress(!isAddingAddress);
                                            setEditingAddressId(null);
                                            setAddressData({ street: '', city: '', state: '', zip_code: '', country: '', is_default: false });
                                        }}
                                        className="text-sm bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/70 transition-colors"
                                    >
                                        {isAddingAddress ? 'Cancel' : '+ Add New Address'}
                                    </button>
                                </div>

                                {isAddingAddress && (
                                    <form onSubmit={handleAddAddress} className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg mb-8 border border-gray-200 dark:border-gray-600">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                            {editingAddressId ? 'Edit Address' : 'Add New Address'}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
                                                <input
                                                    type="text"
                                                    name="street"
                                                    value={addressData.street}
                                                    onChange={handleAddressChange}
                                                    required
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={addressData.city}
                                                    onChange={handleAddressChange}
                                                    required
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State / Province</label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={addressData.state}
                                                    onChange={handleAddressChange}
                                                    required
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP / Postal Code</label>
                                                <input
                                                    type="text"
                                                    name="zip_code"
                                                    value={addressData.zip_code}
                                                    onChange={handleAddressChange}
                                                    required
                                                    minLength={5}
                                                    maxLength={5}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    value={addressData.country}
                                                    onChange={handleAddressChange}
                                                    required
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div className="md:col-span-2 flex items-center mt-2">
                                                <input
                                                    type="checkbox"
                                                    id="is_default"
                                                    name="is_default"
                                                    checked={addressData.is_default}
                                                    onChange={handleAddressChange}
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                    Set as default address
                                                </label>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsAddingAddress(false);
                                                    setEditingAddressId(null);
                                                    setAddressData({ street: '', city: '', state: '', zip_code: '', country: '', is_default: false });
                                                }}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                {isLoading ? 'Saving...' : (editingAddressId ? 'Update Address' : 'Save Address')}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {user.addresses && user.addresses.length > 0 ? (
                                        user.addresses.map((addr) => (
                                            <div key={addr.id} className="relative p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
                                                {addr.is_default && (
                                                    <span className="absolute top-4 right-4 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xs px-2 py-1 rounded-full font-medium">Default</span>
                                                )}
                                                <p className="font-medium text-gray-900 dark:text-white">{addr.street}</p>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{addr.city}, {addr.state} {addr.zip_code}</p>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">{addr.country}</p>

                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!addr.is_default && (
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); handleSetDefaultAddress(addr.id); }}
                                                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
                                                        >
                                                            Set as Default
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEditAddress(addr)}
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAddress(addr.id)}
                                                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="md:col-span-2 text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                                            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No addresses</h3>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new address.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {
                isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm transition-opacity duration-300">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all scale-100 opacity-100 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Address?</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-8 pointer-events-none">
                                    Are you sure you want to remove this address? This action cannot be undone.
                                </p>
                                <div className="flex gap-4 w-full">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteAddress}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 focus:ring-2 focus:ring-red-500"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ProfilePage;
