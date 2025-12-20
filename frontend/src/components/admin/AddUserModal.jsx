import { useState } from 'react';
import { User, Mail, Lock, Shield } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';

const AddUserModal = ({ onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/users', formData);
            toast.success('User created successfully');
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            // Error managed by interceptor or default
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Add New User" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            required
                            value={formData.full_name}
                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                            className="block w-full pl-10 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm p-2.5 transition-colors"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="block w-full pl-10 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm p-2.5 transition-colors"
                            placeholder="john@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="block w-full pl-10 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm p-2.5 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Shield size={18} className="text-gray-400" />
                        </div>
                        <select
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            className="block w-full pl-10 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm p-2.5 transition-colors"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Only Root Admin can create other Admins.
                    </p>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? 'Creating...' : 'Create User'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddUserModal;
