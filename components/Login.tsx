import React, { useState, useEffect } from 'react';

interface LoginProps {
    onLogin: () => void;
}

// Default user for the very first run
const initialUsers = [
    { email: 'admin@example.com', password: 'password123' }
];

const USERS_STORAGE_KEY = 'resume-app-users';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [isSignInView, setIsSignInView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // Load users from localStorage on initial render, or use default.
    const [users, setUsers] = useState(() => {
        try {
            const savedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
            if (savedUsers) {
                const parsedUsers = JSON.parse(savedUsers);
                // Ensure it's an array, in case localStorage gets corrupted
                return Array.isArray(parsedUsers) ? parsedUsers : initialUsers;
            }
        } catch (e) {
            console.error("Failed to load users from local storage", e);
        }
        return initialUsers;
    });

    // Save users to localStorage whenever the users state changes.
    useEffect(() => {
        try {
            window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        } catch (e) {
            console.error("Failed to save users to local storage", e);
        }
    }, [users]);


    const toggleView = () => {
        setIsSignInView(!isSignInView);
        // Reset all fields and messages when toggling
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError(null);
        setSuccessMessage(null);
    };

    const handleSignIn = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            onLogin();
        } else {
            setError('Invalid email or password. Please try again.');
            // Clear only the password field on a failed attempt
            setPassword('');
        }
    };

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (users.some(u => u.email === email)) {
            setError('An account with this email already exists.');
            return;
        }
        
        // Basic email validation
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        // Add new user
        const newUser = { email, password };
        setUsers([...users, newUser]);

        // Show success message and switch to sign-in view
        setSuccessMessage('Account created successfully! Please sign in.');
        // Instead of calling toggleView, we just set the view and clear fields
        setIsSignInView(true);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    const handleSubmit = isSignInView ? handleSignIn : handleSignUp;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Resume Check</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to manage your recruitment pipeline.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8">
                    <div className="mb-6">
                        <div className="flex border-b border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => isSignInView || toggleView()}
                                className={`flex-1 py-3 text-sm font-semibold transition-colors ${isSignInView ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => !isSignInView || toggleView()}
                                className={`flex-1 py-3 text-sm font-semibold transition-colors ${!isSignInView ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-100 dark:bg-rose-900/50 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-lg relative mb-4 text-sm" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    {successMessage && (
                        <div className="bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-lg relative mb-4 text-sm" role="alert">
                            <span className="block sm:inline">{successMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value.trim())}
                                    className="appearance-none block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete={isSignInView ? "current-password" : "new-password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {!isSignInView && (
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Confirm Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="confirm-password"
                                        name="confirm-password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {isSignInView ? 'Sign In' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};