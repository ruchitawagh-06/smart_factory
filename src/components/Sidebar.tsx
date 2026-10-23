import React from "react";
import { 
  LayoutDashboard, 
  Map, 
  LineChart, 
  AlertTriangle, 
  FileSpreadsheet, 
  LogOut, 
  Factory, 
  ShieldCheck, 
  GraduationCap
} from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  collapsed: boolean;
  setCollapsed: (col: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  collapsed,
  setCollapsed
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "factory_floor", label: "Machines & Floor", icon: Map },
    { id: "analytics", label: "Telemetry Charts", icon: LineChart },
    { id: "alerts", label: "Alerts & Logs", icon: AlertTriangle },
    { id: "reports", label: "Reports", icon: FileSpreadsheet },
    ...(currentUser?.role === "admin" 
      ? [{ id: "profiles", label: "User Accounts", icon: ShieldCheck }] 
      : []),
    { id: "about", label: "About Project", icon: GraduationCap }
  ];

  return (
    <aside 
      className={`bg-white dark:bg-slate-900 text-slate-800 dark:text-white border-r border-slate-200 dark:border-slate-800 h-full flex flex-col justify-between transition-all duration-200 z-20 shadow-sm ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Top Header Logo */}
      <div>
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="p-2 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Factory className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-black dark:text-white text-sm leading-tight">
                Smart Factory
              </span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                BCA Student Project
              </span>
            </div>
          )}
        </div>

        {/* Current User Card */}
        {currentUser && (
          <div className={`p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div 
              title={`${currentUser.name} (${currentUser.role})`}
              className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                currentUser.role === "admin" 
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300 dark:border-amber-700" 
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
              }`}
            >
              {currentUser.role === "admin" ? (
                <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              ) : (
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                  {currentUser.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "OP"}
                </span>
              )}
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{currentUser.name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${currentUser.role === "admin" ? "bg-amber-500" : "bg-blue-500"}`} />
                  {currentUser.role} Account
                </span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-2 space-y-1 mt-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`btn-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-sm font-semibold" 
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <IconComponent className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Sign Out */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
        <button
          id="btn-sidebar-logout"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
