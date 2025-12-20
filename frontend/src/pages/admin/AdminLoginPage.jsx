import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // We use the same login endpoint, but we check role afterwards
            // OR the backend could have a specific admin login.
            // For now, client-side check is okay if backend is robust.
            // But ideally, we want to know BEFORE redirecting.
            // Let's rely on api call returning user role.

            const response = await api.post('/auth/admin/login', { email, password });

            const userRole = response.data.user.role;

            // Backend now handles strict separation and returns 403 if role is user

            // If Admin or Root, proceed
            const { setUser } = useAuthStore.getState();
            setUser(response.data.user); // Update store state manually
            toast.success(`Welcome back, ${response.data.user.role === 'root' ? 'Root Admin' : 'Admin'}`);
            navigate('/admin');

        } catch (err) {
            console.error("Login failed", err);
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 shadow-2xl relative z-10 overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                            <ShieldCheck className="text-white h-8 w-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
                        <p className="text-slate-400 text-sm mt-2">Restricted Access Only</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    placeholder="admin_username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>
                    </form>
                </div>
                <div className="bg-slate-900/50 p-4 text-center border-t border-slate-700">
                    <p className="text-xs text-slate-500">
                        Unauthorized access is prohibited and logged.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
