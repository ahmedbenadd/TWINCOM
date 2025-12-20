import { useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api'; // Assuming you have an api service
import toast from 'react-hot-toast';
import { User, Lock, Save, Shield } from 'lucide-react';

const AdminSettings = () => {
    const { user, checkAuth } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');

    // Profile State
    const [profileData, setProfileData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            // Re-using the update profile endpoint? 
            // Usually /users/profile or /users/:id 
            // Let's assume userController has an updateProfile (updateUser) endpoint for "me" or use /users/:id
            // userController.updateUser uses req.user.id. endpoint is PUT /api/users/profile usually?
            // Checking userRoutes... endpoint is PUT /profile likely? 
            // Let's check userRoutes later, but for now assuming PUT /users/profile based on userController.updateUser

            await api.put('/users/profile', profileData);
            toast.success('Profile updated successfully');
            checkAuth(); // Refresh user data
        } catch (error) {
            // toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("New passwords don't match");
        }
        try {
            // Corrected endpoint based on userRoutes.js
            await api.put('/users/password', {
                password: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            // toast.error(error.response?.data?.message || 'Failed to update password');
        }
    };

    const isRoot = user?.role === 'root';
    const isAdminOrRoot = user?.role === 'admin' || user?.role === 'root';

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            {/* Header - Fixed */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 z-10 flex flex-col space-y-4">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>

                {/* Tabs */}
                <div className="flex space-x-6 text-sm font-medium">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${activeTab === 'profile'
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <User size={16} />
                        <span>Profile Details</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${activeTab === 'security'
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <Shield size={16} />
                        <span>Security</span>
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto custom-scrollbar p-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 max-w-3xl mx-auto">
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-2xl font-bold">
                                    {user?.full_name?.charAt(0) || 'A'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user?.full_name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role} Role</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileData.full_name}
                                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                        disabled={isAdminOrRoot}
                                        className={`mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border ${isAdminOrRoot ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    />
                                    {isAdminOrRoot && <p className="mt-1 text-xs text-orange-500">Admin/Root names cannot be changed directly.</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {isAdminOrRoot ? 'Username' : 'Email Address'}
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">@</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={profileData.email}
                                            disabled={isAdminOrRoot}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            className={`block w-full pl-10 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border ${isAdminOrRoot ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        />
                                    </div>
                                    {isAdminOrRoot && <p className="mt-1 text-xs text-orange-500">Admin/Root usernames cannot be changed directly.</p>}
                                </div>

                                {/* Phone Number hidden for Admins/Root */}
                                {user?.role === 'user' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                        <input
                                            type="text"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    <Save size={18} className="mr-2" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <Lock className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700 dark:text-yellow-200">
                                            For your security, please use a strong password. {isRoot && "As Root, this is the only way to recover your account if you forget your password (email reset is disabled)."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    <Lock size={18} className="mr-2" />
                                    Update Password
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
