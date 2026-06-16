import React, { useState } from 'react';
import { useCrm } from './context/CrmContext';
import { useAuth } from './context/AuthContext';
import { Dashboard } from './views/Dashboard';
import { Leads } from './views/Leads';
import { Contacts } from './views/Contacts';
import { Tasks } from './views/Tasks';
import { Analytics } from './views/Analytics';
import { Settings } from './views/Settings';
import { Auth } from './views/Auth';
import { Toast } from './components/Toast';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Contact,
  KanbanSquare,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  Moon,
  Sun,
  Bell,
  Search,
  LogOut
} from 'lucide-react';

export const App: React.FC = () => {
  const { theme, toggleTheme } = useCrm();
  const { user, isLoading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-300">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4 animate-bounce">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-2 font-semibold text-sm">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Syncing CRM secure session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={(v) => setCurrentView(v)} />;
      case 'leads':
        return <Leads />;
      case 'contacts':
        return <Contacts />;
      case 'tasks':
        return <Tasks />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={(v) => setCurrentView(v)} />;
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'leads': return 'Leads Directory';
      case 'contacts': return 'Contacts Directory';
      case 'tasks': return 'Task Kanban Board';
      case 'analytics': return 'Performance Reports';
      case 'settings': return 'System Settings';
      default: return 'CRM Dashboard';
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, view: 'dashboard' },
    { name: 'Leads', icon: <Users className="w-5 h-5" />, view: 'leads' },
    { name: 'Contacts', icon: <Contact className="w-5 h-5" />, view: 'contacts' },
    { name: 'Task Board', icon: <KanbanSquare className="w-5 h-5" />, view: 'tasks' },
    { name: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, view: 'analytics' },
    { name: 'Settings', icon: <SettingsIcon className="w-5 h-5" />, view: 'settings' }
  ];

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-300 relative">
      {/* Sidebar Navigation */}
      <aside
        className={`h-full bg-white dark:bg-slate-900 flex flex-col z-50 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${
          sidebarCollapsed ? 'w-[78px]' : 'w-[260px]'
        }`}
      >
        <div className="h-[72px] flex items-center px-6 gap-3 border-b border-slate-200 dark:border-slate-800/60 overflow-hidden whitespace-nowrap">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow">
            <ShieldCheck className="w-5 h-5" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-heading text-lg font-black text-slate-850 dark:text-white letter-spacing-tight tracking-tight">
              ApexCRM
            </span>
          )}
        </div>

        <nav className="flex-grow py-6 px-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`w-full flex items-center gap-4 px-4.5 py-3 rounded-xl font-medium transition-all relative whitespace-nowrap cursor-pointer ${
                currentView === item.view
                  ? 'text-blue-600 dark:text-white bg-blue-50 dark:bg-slate-800 border-l-4 border-blue-600 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {item.icon}
              {!sidebarCollapsed && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center justify-center flex-shrink-0 shadow border border-blue-100 dark:border-slate-700">
              {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)}
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-slate-800 dark:text-white text-xs font-bold leading-normal truncate" title={user.name}>
                  {user.name}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] leading-tight truncate" title={user.role}>
                  {user.role}
                </span>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-450 hover:bg-slate-100 dark:hover:bg-slate-805 cursor-pointer transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-grow flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-[72px] bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 px-6 md:px-8 flex items-center justify-between z-40 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg md:text-xl font-bold font-heading text-slate-800 dark:text-slate-100">
              {getViewTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Contextual Search box */}
            <div className="relative hidden sm:block w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search metrics..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer transition-colors"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5 text-indigo-500" /> : <Sun className="w-4.5 h-4.5 text-amber-500" />}
            </button>

            {/* Notifications Button */}
            <button
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 border-2 border-white dark:border-[#111827]"></span>
            </button>
          </div>
        </header>

        {/* Dynamic View Panel wrapper */}
        <div className="flex-grow p-6 md:p-8 overflow-y-auto bg-slate-50/50 dark:bg-[#0b0f19]/40 relative">
          {renderView()}
        </div>
      </main>

      {/* Toast Alert Dialog */}
      <Toast />
    </div>
  );
};

export default App;
