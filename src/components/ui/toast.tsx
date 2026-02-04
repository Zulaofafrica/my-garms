"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// No-op fallback for when context is not available (SSR or outside provider)
const noopToast: ToastContextType = {
    showToast: (msg) => console.warn('[Toast] Context not available, message:', msg),
    success: (msg) => console.warn('[Toast] Context not available, success:', msg),
    error: (msg) => console.warn('[Toast] Context not available, error:', msg),
    warning: (msg) => console.warn('[Toast] Context not available, warning:', msg),
    info: (msg) => console.warn('[Toast] Context not available, info:', msg),
};

export function useToast() {
    const context = useContext(ToastContext);
    // Return no-op functions if context is not available (safer for hydration)
    if (!context) {
        return noopToast;
    }
    return context;
}

const toastConfig = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-emerald-900/95',
        borderColor: 'border-emerald-500/50',
        iconColor: 'text-emerald-400',
        textColor: 'text-emerald-50',
    },
    error: {
        icon: XCircle,
        bgColor: 'bg-red-900/95',
        borderColor: 'border-red-500/50',
        iconColor: 'text-red-400',
        textColor: 'text-red-50',
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-amber-900/95',
        borderColor: 'border-amber-500/50',
        iconColor: 'text-amber-400',
        textColor: 'text-amber-50',
    },
    info: {
        icon: Info,
        bgColor: 'bg-slate-800/95',
        borderColor: 'border-indigo-500/50',
        iconColor: 'text-indigo-400',
        textColor: 'text-slate-50',
    },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    const config = toastConfig[toast.type];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`
                flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-sm
                ${config.bgColor} ${config.borderColor}
                min-w-[320px] max-w-[420px]
            `}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
            <p className={`flex-1 text-sm font-medium leading-relaxed ${config.textColor}`}>
                {toast.message}
            </p>
            <button
                onClick={onRemove}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
                <X className={`w-4 h-4 ${config.textColor} opacity-70 hover:opacity-100`} />
            </button>
        </motion.div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const toast: Toast = { id, message, type };

        setToasts(prev => [...prev, toast]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, [removeToast]);

    const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
    const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
    const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
    const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map(toast => (
                        <div key={toast.id} className="pointer-events-auto">
                            <ToastItem
                                toast={toast}
                                onRemove={() => removeToast(toast.id)}
                            />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
