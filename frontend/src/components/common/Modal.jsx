import { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300">
            {/* Backdrop click handler */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className={`relative w-full ${sizeClasses[size] || sizeClasses.md} transform rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh] animate-fade-in-up`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-6">{title}</h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
