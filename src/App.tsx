import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCrm } from './context/CrmContext';
import { useAuth } from './context/AuthContext';
import { Dashboard } from './views/Dashboard';
import { Leads } from './views/Leads';
import { Contacts } from './views/Contacts';
import { Tasks } from './views/Tasks';
import { Analytics } from './views/Analytics';
import { Settings } from './views/Settings';
import { Auth } from './views/Auth';
import { Team } from './views/Team.tsx'; // Workspace team member permissions view
import { Toast } from './components/Toast';
import {
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
  LogOut,
  UserCog,
  CheckCircle2,
  Calendar,
  User as UserIcon,
  CheckCheck
} from 'lucide-react';

export const App: React.FC = () => {
  const { theme, toggleTheme, userPermissions, userRole, activities } = useCrm();
  const { user, isLoading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [readCount, setReadCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('crm_notif_read') || '0', 10);
  });
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = Math.max(0, activities.slice(0, 8).length - readCount);

  const handleMarkAllRead = useCallback(() => {
    const newCount = activities.slice(0, 8).length;
    setReadCount(newCount);
    localStorage.setItem('crm_notif_read', String(newCount));
  }, [activities]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  // Reset read count if new activities come in
  useEffect(() => {
    const stored = parseInt(localStorage.getItem('crm_notif_read') || '0', 10);
    if (activities.length > stored) {
      // Don't auto-read; just let badge show
    }
  }, [activities]);

  // Clear search query when switching views
  useEffect(() => {
    setGlobalSearch('');
  }, [currentView]);

  // Handle mobile drawer responsiveness on resize
  useEffect(() => {
    let prevWidth = window.innerWidth;
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (prevWidth >= 768 && currentWidth < 768) {
        setSidebarCollapsed(true);
      } else if (prevWidth < 768 && currentWidth >= 768) {
        setSidebarCollapsed(false);
      }
      prevWidth = currentWidth;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-300">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg mb-4 animate-bounce overflow-hidden">
          <img src="/logo.png" alt="Escrow CRM" className="w-12 h-12 object-contain" />
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
    // Permission Guards
    if ((currentView === 'leads' || currentView === 'contacts') && !userPermissions?.viewLeads) {
      return <Dashboard onNavigate={(v) => setCurrentView(v)} globalSearch={globalSearch} />;
    }
    if (currentView === 'tasks' && !userPermissions?.viewTasks) {
      return <Dashboard onNavigate={(v) => setCurrentView(v)} globalSearch={globalSearch} />;
    }
    if (currentView === 'analytics' && !userPermissions?.viewAnalytics) {
      return <Dashboard onNavigate={(v) => setCurrentView(v)} globalSearch={globalSearch} />;
    }
    if (currentView === 'team' && !(userRole === 'owner' || userRole === 'Sales Director' || userRole === 'CRM Manager')) {
      return <Dashboard onNavigate={(v) => setCurrentView(v)} globalSearch={globalSearch} />;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={(v) => setCurrentView(v)} globalSearch={globalSearch} />;
      case 'leads':
        return <Leads globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />;
      case 'contacts':
        return <Contacts globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />;
      case 'tasks':
        return <Tasks globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />;
      case 'analytics':
        return <Analytics />;
      case 'team':
        return <Team />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={(v) => setCurrentView(v)} globalSearch={globalSearch} />;
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

  const getSearchPlaceholder = () => {
    switch (currentView) {
      case 'dashboard': return 'Search metrics & tasks...';
      case 'leads': return 'Search leads...';
      case 'contacts': return 'Search contacts...';
      case 'tasks': return 'Search task board...';
      default: return 'Search Escrow CRM...';
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, view: 'dashboard' },
    { name: 'Leads', icon: <Users className="w-5 h-5" />, view: 'leads' },
    { name: 'Contacts', icon: <Contact className="w-5 h-5" />, view: 'contacts' },
    { name: 'Task Board', icon: <KanbanSquare className="w-5 h-5" />, view: 'tasks' },
    { name: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, view: 'analytics' },
    { name: 'Team Members', icon: <UserCog className="w-5 h-5" />, view: 'team' },
    { name: 'Settings', icon: <SettingsIcon className="w-5 h-5" />, view: 'settings' }
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.view === 'leads' || item.view === 'contacts') {
      return userPermissions?.viewLeads;
    }
    if (item.view === 'tasks') {
      return userPermissions?.viewTasks;
    }
    if (item.view === 'analytics') {
      return userPermissions?.viewAnalytics;
    }
    if (item.view === 'team') {
      return userRole === 'owner' || userRole === 'Sales Director' || userRole === 'CRM Manager';
    }
    return true;
  });

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-300 relative">
      {/* Dark backdrop overlay on mobile when sidebar is open */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-45 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`h-full bg-white dark:bg-slate-900 flex flex-col z-50 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 fixed md:relative top-0 bottom-0 left-0 shadow-lg md:shadow-none ${
          sidebarCollapsed
            ? '-translate-x-full md:translate-x-0 md:w-[78px]'
            : 'translate-x-0 md:w-[260px] w-[260px]'
        }`}
      >
        <div className="h-[72px] flex items-center px-6 gap-3 border-b border-slate-200 dark:border-slate-800/60 overflow-hidden whitespace-nowrap">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center flex-shrink-0 shadow overflow-hidden border border-slate-100 dark:border-slate-700">
            <img src="/logo.png" alt="Escrow CRM" className="w-7 h-7 object-contain" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-heading text-lg font-black text-slate-850 dark:text-white letter-spacing-tight tracking-tight">
              Escrow CRM
            </span>
          )}
        </div>

        <nav className="flex-grow py-6 px-3 space-y-1.5 overflow-y-auto">
          {filteredMenuItems.map((item) => (
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
              {user.name ? user.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : '??'}
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
                placeholder={getSearchPlaceholder()}
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

            {/* Notifications Button + Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotifOpen(prev => !prev);
                  if (!notifOpen) handleMarkAllRead();
                }}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer relative transition-colors"
                title="Notifications"
              >
                <Bell className={`w-4.5 h-4.5 transition-transform duration-200 ${notifOpen ? 'scale-110' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-[#111827]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {unreadCount === 0 && (
                  <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 absolute top-2 right-2 border-2 border-white dark:border-[#111827]"></span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-[340px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[200] overflow-hidden animate-fade-in">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Notifications</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{activities.length} recent events</p>
                    </div>
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark read
                    </button>
                  </div>

                  {/* Notification Items */}
                  <div className="overflow-y-auto max-h-[360px]">
                    {activities.length === 0 ? (
                      <div className="py-12 text-center">
                        <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                        <p className="text-sm text-slate-400 font-medium">No notifications yet</p>
                        <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Activity will appear here</p>
                      </div>
                    ) : (
                      activities.slice(0, 8).map((act, idx) => {
                        const isUnread = idx < unreadCount;
                        const getIcon = () => {
                          switch (act.type) {
                            case 'deal': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                            case 'task': return <Calendar className="w-4 h-4 text-amber-500" />;
                            default:     return <UserIcon className="w-4 h-4 text-indigo-500" />;
                          }
                        };
                        const getBg = () => {
                          switch (act.type) {
                            case 'deal': return 'bg-emerald-500/10';
                            case 'task': return 'bg-amber-500/10';
                            default:     return 'bg-indigo-500/10';
                          }
                        };
                        return (
                          <div
                            key={act.id}
                            className={`flex items-start gap-3 px-5 py-3.5 border-b border-slate-50 dark:border-slate-800/60 last:border-none transition-colors ${
                              isUnread ? 'bg-blue-50/40 dark:bg-blue-500/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${getBg()}`}>
                              {getIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-slate-700 dark:text-slate-200 leading-snug">{act.text}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{act.time}</p>
                            </div>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2"></span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {activities.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-center">
                      <button
                        onClick={() => { setCurrentView('dashboard'); setNotifOpen(false); }}
                        className="text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        View all activity on Dashboard →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
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
