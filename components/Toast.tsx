import React, { useState, createContext, useContext, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';

// --- Types and Context Definition ---

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};


// --- Icon Components ---

const CheckCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const InformationCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


// --- Toast Component ---

interface ToastProps {
    toast: ToastMessage;
    onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleDismiss = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            onDismiss(toast.id);
        }, 300); // Corresponds to animation duration
    }, [toast.id, onDismiss]);

    useEffect(() => {
        const timer = setTimeout(handleDismiss, 5000);
        return () => clearTimeout(timer);
    }, [handleDismiss]);

    const typeStyles = {
        success: {
            bg: 'bg-emerald-50 dark:bg-emerald-900/50',
            border: 'border-emerald-200 dark:border-emerald-500/30',
            icon: <CheckCircleIcon />,
            iconColor: 'text-emerald-500',
            textColor: 'text-emerald-800 dark:text-emerald-200'
        },
        error: {
            bg: 'bg-rose-50 dark:bg-rose-900/50',
            border: 'border-rose-200 dark:border-rose-500/30',
            icon: <XCircleIcon />,
            iconColor: 'text-rose-500',
            textColor: 'text-rose-800 dark:text-rose-200'
        },
        info: {
            bg: 'bg-sky-50 dark:bg-sky-900/50',
            border: 'border-sky-200 dark:border-sky-500/30',
            icon: <InformationCircleIcon />,
            iconColor: 'text-sky-500',
            textColor: 'text-sky-800 dark:text-sky-200'
        },
    };

    const styles = typeStyles[toast.type];
    const animationClasses = isExiting 
        ? 'opacity-0 translate-x-full' 
        : 'opacity-100 translate-x-0';

    return (
        <div
            role="alert"
            className={`flex items-start w-full max-w-sm p-4 rounded-lg shadow-lg border ${styles.bg} ${styles.border} transform-gpu transition-all duration-300 ease-in-out ${animationClasses}`}
        >
            <div className={`flex-shrink-0 ${styles.iconColor}`}>
                {styles.icon}
            </div>
            <div className="ml-3 w-0 flex-1">
                <p className={`text-sm font-medium ${styles.textColor}`}>
                    {toast.message}
                </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
                <button
                    onClick={handleDismiss}
                    className="inline-flex rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    aria-label="Dismiss"
                >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

// --- Toast Provider ---

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = crypto.randomUUID();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    // Ensure the portal target exists
    useEffect(() => {
        let portalRoot = document.getElementById('toast-portal-root');
        if (!portalRoot) {
            portalRoot = document.createElement('div');
            portalRoot.id = 'toast-portal-root';
            document.body.appendChild(portalRoot);
        }
    }, []);
    
    const portalRoot = typeof document !== 'undefined' ? document.getElementById('toast-portal-root') : null;

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {portalRoot && ReactDOM.createPortal(
                <div className="fixed top-5 right-5 z-[100] space-y-2">
                    {toasts.map(toast => (
                        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
                    ))}
                </div>,
                portalRoot
            )}
        </ToastContext.Provider>
    );
};