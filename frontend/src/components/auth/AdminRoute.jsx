import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const AdminRoute = () => {
    const { user, isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    if (!isAuthenticated || (user.role !== 'admin' && user.role !== 'root')) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
