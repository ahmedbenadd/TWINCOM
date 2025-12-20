import React from 'react';
import Modal from './Modal';
import { AlertTriangle, AlertCircle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Action Required" size="sm">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className={`mx-auto sm:mx-0 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${isDangerous ? 'bg-red-100' : 'bg-amber-100'} mb-2 sm:mb-0`}>
                    {isDangerous ? (
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    ) : (
                        <AlertTriangle className="h-6 w-6 text-amber-600" />
                    )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {message}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto transition-colors"
                    onClick={onClose}
                >
                    {cancelText}
                </button>
                <button
                    type="button"
                    className={`inline-flex w-full justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto transition-colors ${isDangerous
                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                            : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                        }`}
                    onClick={() => { onConfirm(); onClose(); }}
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
