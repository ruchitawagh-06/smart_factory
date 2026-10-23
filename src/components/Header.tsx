import React, { useState } from "react";
import { 
  Bell, 
  Search, 
  CheckCheck, 
  Wifi, 
  Moon, 
  Sun, 
  Menu, 
  LogOut,
  GraduationCap
} from "lucide-react";
import { User, Notification } from "../types";

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifications: Notification[];
  onReadAllNotifications: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  toggleSidebar: () => void;
}

export default function Header({
  currentUser,
  onLogout,
  searchQuery,
  setSearchQuery,
  notifications,
  onReadAllNotifications,
  darkMode,
  setDarkMode,
  toggleSidebar
}: HeaderProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={`border-b h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 z-30 relative transition-colors ${
      darkMode 
        ? "bg-slate-900 border-slate-800 text-white" 
        : "bg-white border-slate-200 text-slate-800 shadow-sm"
    }`}>
      {/* Mobile Sidebar Toggle & Project Tag */}
      <div className="flex items-center gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={toggleSidebar}
          className={`p-1.5 rounded-md transition-colors ${
            darkMode 
              ? "hover:bg-slate-800 text-slate-300" 
              : "hover:bg-slate-100 text-slate-600"
          }`}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium">
            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>BCA Project: Ruchita Wagh &amp; Neha Pal</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-medium">
            <Wifi className="h-3 w-3 animate-pulse text-emerald-600" />
            <span>Live Server</span>
          </div>
        </div>
      </div>

      {/* Global Simple Search */}
      <div className="flex-1 max-w-sm mx-3 sm:mx-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="input-header-search"
            type="text"
            placeholder="Search machine name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs rounded-md border pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              darkMode
                ? "bg-slate-800 text-white placeholder-slate-400 border-slate-700"
                : "bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-300 focus:bg-white"
            }`}
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark/Light Mode Toggle */}
        <button
          id="btn-toggle-theme"
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-md transition-colors ${
            darkMode 
              ? "text-amber-400 hover:bg-slate-800" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4 text-blue-600" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            id="btn-toggle-notifications"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className={`p-2 rounded-md transition-all relative ${
              darkMode 
                ? "text-slate-300 hover:bg-slate-800" 
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifDropdown && (
            <div className={`absolute right-0 mt-2 w-80 rounded-md shadow-lg z-50 overflow-hidden border ${
              darkMode 
                ? "bg-slate-900 border-slate-700 text-white" 
                : "bg-white border-slate-200 text-slate-900"
            }`}>
              <div className={`p-3 border-b flex items-center justify-between ${
                darkMode ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50"
              }`}>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">System Notifications</span>
                {unreadCount > 0 && (
                  <button
                    id="btn-notifications-read-all"
                    onClick={() => {
                      onReadAllNotifications();
                      setShowNotifDropdown(false);
                    }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No new alerts or logs.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 text-xs transition-colors ${
                        notif.read 
                          ? "bg-transparent text-slate-500" 
                          : "bg-blue-50/60 dark:bg-blue-950/40 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`h-2 w-2 rounded-full mt-1 shrink-0 ${
                          notif.type === "alert" ? "bg-red-500" : notif.type === "success" ? "bg-green-500" : "bg-blue-500"
                        }`} />
                        <div className="flex-1">
                          <p className="leading-snug">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(notif.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          id="btn-header-logout"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-medium transition-colors"
          title="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

