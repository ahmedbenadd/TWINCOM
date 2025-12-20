import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTitleUpdater = () => {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        let title = 'TWINCOM';

        if (path === '/') {
            title = 'TWINCOM';
        } else if (path === '/profile') {
            title = 'Profile';
        } else if (path === '/shop') {
            title = 'Shop';
        } else if (path === '/cart') {
            title = 'Cart';
        } else if (path === '/checkout') {
            title = 'Checkout';
        } else if (path === '/login') {
            title = 'Login';
        } else if (path === '/signup') {
            title = 'Sign Up';
        } else if (path === '/orders') {
            title = 'My Orders';
        } else if (path === '/verify-email') {
            title = 'Verify Email';
        } else if (path.startsWith('/product/')) {
            title = 'Product Details';
        } else if (path.startsWith('/admin')) {
            title = 'Admin Dashboard';
        }

        document.title = title;
    }, [location]);

    return null;
};

export default PageTitleUpdater;
