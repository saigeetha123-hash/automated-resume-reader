import React, { useState } from 'react';
import { useToast } from './Toast';

// --- Reusable Helper Components ---

interface SettingsCardProps {
    title: string;
    children: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <div className="p-6 space-y-6">
            {children}
        </div>
    </div>
);

interface FormRowProps {
    label: string;
    children: React.ReactNode;
}

const FormRow: React.FC<FormRowProps> = ({ label, children }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <div className="md:col-span-2">
            {children}
        </div>
    </div>
);

interface ToggleSwitchProps {
    label: string;
    description: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, description, enabled, onChange }) => (
    <div className="flex justify-between items-center">
        <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">{label}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <button
            type="button"
            className={`${enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:ring-offset-slate-800`}
            role="switch"
            aria-checked={enabled}
            onClick={() => onChange(!enabled)}
        >
            <span
                aria-hidden="true"
                className={`${enabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    </div>
);

const ChevronDownIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


// --- Main Settings View Component ---
interface SettingsViewProps {
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ isDarkMode, setIsDarkMode }) => {
    const { addToast } = useToast();
    
    // State for profile info
    const [name, setName] = useState('Admin User');
    const [email, setEmail] = useState('admin@example.com');
    const [phone, setPhone] = useState('123-456-7890');

    // State for password change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    
    // State for notifications
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [inAppNotifications, setInAppNotifications] = useState(true);

    // State for language
    const [language, setLanguage] = useState('en-US');

    const formInputClasses = "block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800";

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for save logic
        addToast("Profile information saved!", 'success');
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            addToast("New passwords do not match.", 'error');
            return;
        }
        // Placeholder for password change logic
        addToast("Password changed successfully!", 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    };


    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Application Settings</h2>
            
            <SettingsCard title="Profile Information">
                <form onSubmit={handleSaveProfile}>
                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <img className="h-20 w-20 rounded-full" src="https://via.placeholder.com/150" alt="Profile" />
                            <div>
                                 <button type="button" className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-500 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600">
                                    Change Picture
                                </button>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">JPG, PNG, or GIF. 1MB max.</p>
                            </div>
                        </div>
                        <FormRow label="Full Name">
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className={formInputClasses} />
                        </FormRow>
                        <FormRow label="Email Address">
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={formInputClasses} />
                        </FormRow>
                        <FormRow label="Phone Number">
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={formInputClasses} />
                        </FormRow>
                    </div>
                     <div className="text-right mt-6">
                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">Save Changes</button>
                    </div>
                </form>
            </SettingsCard>

            <SettingsCard title="Password & Security">
                <form onSubmit={handleChangePassword}>
                    <div className="space-y-6">
                        <FormRow label="Current Password">
                            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={formInputClasses} required />
                        </FormRow>
                         <FormRow label="New Password">
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={formInputClasses} required />
                        </FormRow>
                         <FormRow label="Confirm New Password">
                            <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className={formInputClasses} required />
                        </FormRow>
                    </div>
                    <div className="text-right mt-6">
                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">Change Password</button>
                    </div>
                </form>
            </SettingsCard>

            <SettingsCard title="Notifications">
                <ToggleSwitch 
                    label="Email Notifications" 
                    description="Get notified about analysis results and summaries via email."
                    enabled={emailNotifications}
                    onChange={setEmailNotifications}
                />
                 <ToggleSwitch 
                    label="In-App Notifications" 
                    description="Receive notifications directly within the application."
                    enabled={inAppNotifications}
                    onChange={setInAppNotifications}
                />
            </SettingsCard>

            <SettingsCard title="Appearance & Language">
                <FormRow label="Language">
                    <div className="relative">
                        <select value={language} onChange={e => setLanguage(e.target.value)} className={`${formInputClasses} appearance-none`}>
                            <option value="en-US">English (United States)</option>
                            <option value="es-ES">Español (España)</option>
                            <option value="fr-FR">Français (France)</option>
                            <option value="de-DE">Deutsch (Deutschland)</option>
                        </select>
                        <ChevronDownIcon />
                    </div>
                </FormRow>
                <FormRow label="Interface Theme">
                    <ToggleSwitch 
                        label="Dark Mode" 
                        description="Switch between light and dark themes."
                        enabled={isDarkMode}
                        onChange={setIsDarkMode}
                    />
                </FormRow>
            </SettingsCard>
        </div>
    );
};