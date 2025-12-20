import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Edit, Shield, Users as UsersIcon, Search, Check, X, Key, Trash2, FilterX, Plus } from 'lucide-react';
import EditUserModal from '../../components/admin/EditUserModal';
import AddUserModal from '../../components/admin/AddUserModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import useAuthStore from '../../store/useAuthStore';

const AdminUsers = () => {
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [confirmation, setConfirmation] = useState({ isOpen: false, type: null, data: null });
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'admins'
    const [statusFilter, setStatusFilter] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                search,
                status: statusFilter,
                sort,
                role: activeTab === 'admins' ? 'admin' : 'user'
            });

            const { data } = await api.get(`/users/all?${queryParams}`);
            setUsers(data.users || []);
        } catch (error) {
            console.error("Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setSort('newest');
        setPage(1);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search, activeTab, statusFilter, sort]);

    // Handle Search is now automatic via effect

    // Client-side filtering is removed in favor of Server-side
    const filteredUsers = users; // Data is already filtered by API

    // Pagination Logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const nextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const prevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [search, activeTab, statusFilter, sort]);

    const handleUpdateRole = async () => {
        if (!editingUser) return;
        try {
            await api.put(`/users/${editingUser.id}/role`, { role: editingUser.role });
            setEditingUser(null);
            fetchUsers(search); // Re-fetch users to update the list
        } catch (error) {
            console.error("Failed to update user role", error);
            // Optionally, show an error message to the user
        }
    };

    const handlePasswordReset = (userId) => {
        setConfirmation({
            isOpen: true,
            type: 'reset',
            data: userId,
            title: 'Reset Password',
            message: "Are you sure you want to reset this user's password? A temporary password will be sent to their email.",
            isDangerous: false
        });
    };

    const confirmPasswordReset = async () => {
        const userId = confirmation.data;
        try {
            await api.post(`/users/${userId}/reset-password`);
            alert("Password reset email sent successfully!");
        } catch (error) {
            console.error("Failed to send password reset email", error);
            alert("Failed to send password reset email.");
        }
    };

    const handleDelete = (userId) => {
        setConfirmation({
            isOpen: true,
            type: 'delete',
            data: userId,
            title: 'Delete User',
            message: "Are you sure you want to delete this user? This action cannot be undone.",
            isDangerous: true
        });
    };

    const confirmDelete = async () => {
        const userId = confirmation.data;
        try {
            await api.delete(`/users/${userId}`);
            fetchUsers(search);
            // Reuse toast logic if available or standardize
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const handleConfirmAction = () => {
        if (confirmation.type === 'reset') {
            confirmPasswordReset();
        } else if (confirmation.type === 'delete') {
            confirmDelete();
        }
    };



    const isRoot = currentUser?.role === 'root';

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            {/* Header - Fixed */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 z-10">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">Users Management</h1>

                        {isRoot && (
                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shrink-0">
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${activeTab === 'users'
                                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <UsersIcon size={14} />
                                    <span>Customers</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('admins')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${activeTab === 'admins'
                                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <Shield size={14} />
                                    <span>Admins</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="relative flex-grow sm:flex-grow-0">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab === 'admins' ? 'admins' : 'users'}...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-8 py-2 w-full sm:w-64 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
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
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Users</option>
                            <option value="verified">Verified</option>
                            <option value="unverified">Unverified</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="name_asc">Name (A-Z)</option>
                            <option value="name_desc">Name (Z-A)</option>
                        </select>

                        <button
                            onClick={clearFilters}
                            title="Clear Filters"
                            disabled={!search && !statusFilter && sort === 'newest'}
                            className={`p-2 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors ${!search && !statusFilter && sort === 'newest'
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                                : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'
                                }`}
                        >
                            <FilterX size={18} />
                        </button>

                        {/* Add User Button */}
                        <button
                            onClick={() => setIsAddUserOpen(true)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm ml-2"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Add User</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto custom-scrollbar p-6">
                <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">Joined</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                            <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">
                                                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div className="ml-4 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white break-words">{user.full_name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 break-all">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingUser?.id === user.id ? (
                                                <select
                                                    value={editingUser.role}
                                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                                    className="text-sm rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            ) : (
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'root' ? 'bg-purple-100 text-purple-800' :
                                                    user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {user.role ? user.role.toUpperCase() : 'USER'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.is_verified ? 'Verified' : 'Unverified'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                            {editingUser?.id === user.id ? (
                                                <>
                                                    <button onClick={handleUpdateRole} className="text-green-600 hover:text-green-900"><Check size={18} /></button>
                                                    <button onClick={() => setEditingUser(null)} className="text-gray-600 hover:text-gray-900"><X size={18} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => setEditingUser(user)} className="text-indigo-600 hover:text-indigo-900" title="Edit Role" disabled={user.role === 'root' || currentUser?.role !== 'root'}>
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => handlePasswordReset(user.id)} className="text-amber-600 hover:text-amber-900" title="Reset Password" disabled={currentUser?.role !== 'root'}>
                                                        <Key size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900" title="Delete User" disabled={user.role === 'root' || currentUser?.role !== 'root'}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <UsersIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No users found</h3>
                                            <p className="text-sm max-w-sm mx-auto">
                                                We couldn't find any users matching your criteria.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onUpdate={() => fetchUsers(search)}
                />
            )}

            {isAddUserOpen && (
                <AddUserModal
                    onClose={() => setIsAddUserOpen(false)}
                    onUpdate={() => fetchUsers(search)}
                />
            )}

            <ConfirmationModal
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
                onConfirm={handleConfirmAction}
                title={confirmation.title}
                message={confirmation.message}
                isDangerous={confirmation.isDangerous}
                confirmText={confirmation.type === 'delete' ? 'Delete' : 'Reset'}
            />

            {/* Footer - Fixed Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center z-10 flex-shrink-0">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    From <span className="font-medium text-gray-900 dark:text-white">{filteredUsers.length === 0 ? 0 : (page - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(page * itemsPerPage, filteredUsers.length)}</span> of <span className="font-medium text-gray-900 dark:text-white">{filteredUsers.length}</span>
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
                        disabled={page === totalPages || totalPages === 0}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
