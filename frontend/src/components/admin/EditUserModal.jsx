import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';

const EditUserModal = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        role: 'user',
        is_active: true,
        is_verified: false,
        password: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                email: user.email || '',
                role: user.role || (user.is_admin ? 'admin' : 'user'), // Fallback for legacy
                is_active: user.is_active !== undefined ? user.is_active : true,
                is_verified: user.is_verified || false,
                password: ''
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${user.id}`, formData);
            toast.success('User updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Edit User">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Set New Password <span className="text-xs text-gray-500 font-normal">(Leave blank to keep current)</span>
                    </label>
                    <input
                        type="password"
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                    <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="flex items-center space-x-4 pt-2">
                    <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Active</span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_verified}
                            onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Verified</span>
                    </label>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditUserModal;
