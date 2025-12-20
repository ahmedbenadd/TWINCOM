import Navbar from './Navbar';
import Footer from './Footer';
// Theme logic moved to ThemeToggle component, but MainLayout still needs to handle global theme class application if not handled elsewhere. 
// Actually ThemeToggle handles it via useEffect. But ThemeToggle might not be mounted on all pages if only in Navbar?
// Navbar is in MainLayout. So if Navbar has ThemeToggle, we are good.
// BUT wait, MainLayout was handling the useEffect document class toggle. If I remove it from here, and ThemeToggle is NOT in Navbar (it might be), then it breaks.
// Let's check Navbar. If Navbar doesn't have it, I should import ThemeToggle here just for the side effect or keep the side effect here.
// Better: Keep the side effect in MainLayout or a top level App provider.
// Given the setup, I'll keep the side effect in App.jsx or MainLayout/AdminLayout to ensure it applies even if no toggle button is visible.
// For now, I'll keep the side effect in ThemeToggle and rely on it being present in Navbar or AdminHeader.
// However, MainLayout previously had the side effect.
// Let's simplified MainLayout to just return children and structure.
import { useEffect } from 'react'; // Keeping useEffect just in case we need it if ThemeToggle isn't rendered
import useThemeStore from '../../store/useThemeStore';

const MainLayout = ({ children }) => {
    const { theme } = useThemeStore();

    // Keep this to ensure theme applies on load even if toggle isn't clicked
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
