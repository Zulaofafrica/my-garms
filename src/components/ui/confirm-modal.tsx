"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';

type ConfirmType = 'warning' | 'info' | 'danger';

interface ConfirmOptions {
    title?: string;
    message: string;
    type?: ConfirmType;
    confirmText?: string;
    cancelText?: string;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

// No-op fallback for SSR
const noopConfirm: ConfirmContextType = {
    confirm: async () => {
        console.warn('[ConfirmModal] Context not available');
        return false;
    },
};

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        return noopConfirm;
    }
    return context;
}

const typeConfig = {
    warning: {
        icon: AlertTriangle,
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-400',
        confirmBg: 'bg-amber-600 hover:bg-amber-500',
    },
    danger: {
        icon: AlertTriangle,
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-400',
        confirmBg: 'bg-red-600 hover:bg-red-500',
    },
    info: {
        icon: HelpCircle,
        iconBg: 'bg-indigo-500/20',
        iconColor: 'text-indigo-400',
        confirmBg: 'bg-indigo-600 hover:bg-indigo-500',
    },
};

interface ModalState {
    isOpen: boolean;
    options: ConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        options: null,
        resolve: null,
    });

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setModal({
                isOpen: true,
                options,
                resolve,
            });
        });
    }, []);

    const handleConfirm = () => {
        modal.resolve?.(true);
        setModal({ isOpen: false, options: null, resolve: null });
    };

    const handleCancel = () => {
        modal.resolve?.(false);
        setModal({ isOpen: false, options: null, resolve: null });
    };

    const config = modal.options?.type ? typeConfig[modal.options.type] : typeConfig.info;
    const Icon = config.icon;

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            <AnimatePresence>
                {modal.isOpen && modal.options && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                            onClick={handleCancel}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
                        >
                            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                                {/* Header */}
                                <div className="p-6 pb-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-full ${config.iconBg}`}>
                                            <Icon className={`w-6 h-6 ${config.iconColor}`} />
                                        </div>
                                        <div className="flex-1 pt-1">
                                            {modal.options.title && (
                                                <h3 className="text-lg font-semibold text-white mb-1">
                                                    {modal.options.title}
                                                </h3>
                                            )}
                                            <p className="text-slate-300 leading-relaxed">
                                                {modal.options.message}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleCancel}
                                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-slate-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 p-4 pt-2 border-t border-slate-800 bg-slate-900/50">
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                                    >
                                        {modal.options.cancelText || 'Cancel'}
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-colors ${config.confirmBg}`}
                                    >
                                        {modal.options.confirmText || 'Confirm'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </ConfirmContext.Provider>
    );
}
