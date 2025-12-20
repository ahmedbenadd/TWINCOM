import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../../store/useThemeStore';
import { useEffect } from 'react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useThemeStore();

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors"
            title="Toggle Theme"
        >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
};

export default ThemeToggle;
