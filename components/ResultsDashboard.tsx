import React from 'react';
import { DashboardIcon } from './icons/DocumentIcon';
import { BriefcaseIcon } from './icons/ResumeIcon';
import { ChartBarIcon } from './icons/SparklesIcon';
import { CogIcon } from './icons/XCircleIcon';

const HamburgerIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors text-left ${active ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
    const handleNavigation = (view: string) => {
        setActiveView(view);
        setIsOpen(false); // Close sidebar on navigation
    };
    
    const navContent = (
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavItem icon={<DashboardIcon />} label="Dashboard" active={activeView === 'Dashboard'} onClick={() => handleNavigation('Dashboard')} />
        <NavItem icon={<BriefcaseIcon />} label="Job Descriptions" active={activeView === 'JobDescriptions'} onClick={() => handleNavigation('JobDescriptions')} />
        <NavItem icon={<ChartBarIcon />} label="Resume Analysis" active={activeView === 'ResumeAnalysis'} onClick={() => handleNavigation('ResumeAnalysis')} />
        <NavItem icon={<CogIcon />} label="Settings" active={activeView === 'Settings'} onClick={() => handleNavigation('Settings')} />
      </nav>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="w-64 bg-slate-800 text-white flex-shrink-0 flex-col hidden md:flex">
                <div className="h-16 flex items-center justify-center px-4 bg-indigo-700">
                    <h1 className="text-xl font-bold">AI Resume Check</h1>
                </div>
                {navContent}
            </div>

            {/* Mobile Sidebar & Backdrop */}
            <div className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)}></div>
                
                {/* Sidebar */}
                <div className={`relative w-64 h-full bg-slate-800 text-white flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-16 flex items-center justify-between px-4 bg-indigo-700">
                        <h1 className="text-xl font-bold">AI Resume Check</h1>
                         <button onClick={() => setIsOpen(false)} className="p-1 text-slate-300 hover:text-white" aria-label="Close menu">
                            <CloseIcon />
                        </button>
                    </div>
                    {navContent}
                </div>
            </div>
        </>
    );
};


interface HeaderProps {
    onLogout: () => void;
    onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, onToggleSidebar }) => (
  <header className="h-16 bg-white dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
    <div className="flex items-center gap-4">
       <button 
            onClick={onToggleSidebar}
            className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Open menu"
        >
            <HamburgerIcon />
        </button>
      <h2 className="hidden sm:block text-lg font-semibold text-slate-900 dark:text-white">AI Innomatics - Placement Team</h2>
    </div>
    <div className="flex items-center gap-4">
       <span className="hidden lg:inline text-sm font-medium text-slate-700 dark:text-slate-200">Welcome, Admin</span>
       <button 
        onClick={onLogout}
        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800"
       >
        Logout
       </button>
    </div>
  </header>
);