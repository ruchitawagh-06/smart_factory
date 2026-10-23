import React, { useState, useEffect } from "react";
import { 
  Factory, 
  ShieldAlert, 
  Bot, 
  Plus, 
  Cpu, 
  Layers, 
  ChevronRight, 
  Wrench, 
  RotateCw, 
  TrendingUp, 
  Activity, 
  LogOut, 
  Info,
  Sliders,
  Sparkles,
  ShieldCheck,
  UserPlus,
  Trash2,
  X
} from "lucide-react";
import { Machine, User, Alert, Notification } from "./types";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import OEEGauges from "./components/OEEGauges";
import DigitalTwinFloor from "./components/DigitalTwinFloor";
import MachineDetailsModal from "./components/MachineDetailsModal";
import AnalyticsPanel from "./components/AnalyticsPanel";
import ReportsPanel from "./components/ReportsPanel";
import AlertsPanel from "./components/AlertsPanel";
import VoiceAssistantController from "./components/VoiceAssistantController";
import AddMachineModal from "./components/AddMachineModal";
import ProfilesPanel from "./components/ProfilesPanel";
import AboutProjectPanel from "./components/AboutProjectPanel";
import { DEFAULT_MACHINES } from "./data/defaultMachines";

const DEFAULT_USER: User = {
  id: "usr_ruchita",
  username: "ruchita",
  role: "admin",
  name: "Ruchita Wagh",
  avatar: "",
  email: "ruchita.wagh@factory-dash.com"
};

export default function App() {
  // Session authentication state (defaults to null so the website opens directly with the login page)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      localStorage.removeItem("scada_auth_token");
      localStorage.removeItem("scada_user");
    } catch (e) {}
    return null;
  });
  const [authToken, setAuthToken] = useState<string>("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Control Room Layout State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Dynamic Telemetry State - Pre-initialized with full factory floor machine fleet
  const [machines, setMachines] = useState<Machine[]>(DEFAULT_MACHINES);
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "alt_1",
      machineId: "mac_2",
      machineName: "CNC Milling Machine",
      metric: "Temperature",
      value: 82.5,
      threshold: 80,
      severity: "warning",
      timestamp: new Date().toISOString(),
      recommendation: "Ensure coolant lines are unobstructed and pump flow is normal. Check spindle friction.",
      acknowledged: false
    }
  ]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "not_1",
      message: "CNC Milling Machine triggered high temperature warning: 82.5°C",
      type: "alert",
      timestamp: new Date().toISOString(),
      read: false
    }
  ]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'alert' | 'success' | 'info' }[]>([]);
  const [publicProfiles, setPublicProfiles] = useState<{ username: string; name: string; role: string; pin: string }[]>(() => {
    const defaultProfiles = [
      { username: "ruchita", name: "Ruchita Wagh (Lead Project Developer & Admin)", role: "admin", pin: "ruchita123" },
      { username: "nehapal", name: "Neha Pal (Lead Project Developer & Admin)", role: "admin", pin: "neha123" }
    ];
    const saved = localStorage.getItem("scada_public_profiles");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((p: any) => p.name?.includes("Alex") || p.username === "admin" || p.name?.includes("Marcus"))) {
          localStorage.setItem("scada_public_profiles", JSON.stringify(defaultProfiles));
          return defaultProfiles;
        }
        return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return defaultProfiles;
  });
  const [deletingUsername, setDeletingUsername] = useState<string | null>(null);

  // Registration view states
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"admin" | "supervisor">("supervisor");
  const [regError, setRegError] = useState("");

  // Load public login presets
  const fetchPublicProfiles = async () => {
    try {
      const response = await fetch("/api/public-profiles");
      if (response.ok) {
        const data = await response.json();
        setPublicProfiles(data);
        localStorage.setItem("scada_public_profiles", JSON.stringify(data));
      }
    } catch (err) {
      console.error("Failed to load public profiles", err);
    }
  };

  // Always start on login portal when page loads
  useEffect(() => {
    // If not logged in, fetch available profile presets for quick login
    if (!currentUser) {
      fetchPublicProfiles();
    }
  }, [currentUser]);

  // Fetch logged user data
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error("Auth me check failed:", err);
      handleLogout();
    }
  };

  // Login execution
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("scada_auth_token", data.token);
        localStorage.setItem("scada_user", JSON.stringify(data.user));
        setAuthToken(data.token);
        setCurrentUser(data.user);
        addToast(`Welcome back, ${data.user.name}! SCADA twin linked.`, "success");
      } else {
        const errData = await response.json();
        setAuthError(errData.error || "Login credentials failed.");
      }
    } catch (err) {
      setAuthError("Failed to interface with credentials server.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!regUsername || !regName || !regPassword) {
      setRegError("Please fill out all fields.");
      return;
    }
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername,
          name: regName,
          password: regPassword,
          role: regRole
        })
      });
      if (response.ok) {
        addToast(`Successfully registered: ${regName}!`, "success");
        // Automatically fill credentials for login
        setUsername(regUsername.trim().toLowerCase());
        setPassword(regPassword);
        // Switch back to login form
        setIsRegistering(false);
        // Reset fields
        setRegName("");
        setRegUsername("");
        setRegPassword("");
        // Reload preset logins list
        fetchPublicProfiles();
      } else {
        const errData = await response.json();
        setRegError(errData.error || "Failed to register account.");
      }
    } catch (err) {
      setRegError("Failed to connect to registration server.");
    }
  };

  const handleLogout = () => {
    localStorage.setItem("scada_auth_token", "logged_out");
    localStorage.removeItem("scada_user");
    setAuthToken("");
    setCurrentUser(null);
    setSelectedMachine(null);
    addToast("Logged out from SCADA central control room.", "info");
  };

  const handlePublicDelete = async (username: string, name: string) => {
    try {
      const response = await fetch(`/api/public-profiles/${username}`, {
        method: "DELETE"
      });
      if (response.ok) {
        addToast(`Successfully deleted profile for ${name}`, "info");
        setDeletingUsername(null);
        fetchPublicProfiles();
      } else {
        const errData = await response.json();
        addToast(errData.error || "Failed to delete account.", "alert");
      }
    } catch (err) {
      addToast("Failed to connect to server.", "alert");
    }
  };

  // Helper toaster triggers
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToast = (message: string, type: 'alert' | 'success' | 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Background Real-Time Telemetry Polling Loop
  useEffect(() => {
    const pollSCADAState = async () => {
      try {
        const headers: Record<string, string> = {};
        if (authToken && authToken !== "logged_out") {
          headers["Authorization"] = `Bearer ${authToken}`;
        }
        
        // Fetch Machines
        const macResponse = await fetch("/api/machines", { headers });
        if (macResponse.ok) {
          const macData: Machine[] = await macResponse.json();
          if (Array.isArray(macData) && macData.length > 0) {
            setMachines(macData);
          }
          
          // Keep active side panel details up-to-date with live sensors
          setSelectedMachine((prev) => {
            if (!prev) return null;
            const fresh = macData.find((m) => m.id === prev.id);
            return fresh || prev;
          });
        }

        // Fetch Alerts (stored for Alarms tab, without spamming popup toasts)
        const alertResponse = await fetch("/api/alerts", { headers });
        if (alertResponse.ok) {
          const alertData: Alert[] = await alertResponse.json();
          setAlerts(alertData);
        }

        // Fetch Event Notifications list
        const notifResponse = await fetch("/api/notifications", { headers });
        if (notifResponse.ok) {
          const notifData = await notifResponse.json();
          setNotifications(notifData);
        }

      } catch (err) {
        console.warn("SCADA state sync failed. Checking connection...", err);
      }
    };

    pollSCADAState();
    const interval = setInterval(pollSCADAState, 4000); // 4 seconds telemetry refreshes
    return () => clearInterval(interval);
  }, [authToken]);

  // Handle Admin Add Machine
  const handleAddMachine = async (machineData: { name: string; type: string; department: string }) => {
    try {
      const response = await fetch("/api/machines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(machineData)
      });
      if (response.ok) {
        const newMac = await response.json();
        setMachines((prev) => [...prev, newMac]);
        addToast(`Provisioned hardware asset ${newMac.name} successfully.`, "success");
      }
    } catch (err) {
      console.error("Add machine failed:", err);
    }
  };

  // Handle Admin Update Machine
  const handleUpdateMachine = async (updatedFields: Partial<Machine>) => {
    try {
      const response = await fetch(`/api/machines/${updatedFields.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(updatedFields)
      });
      if (response.ok) {
        const result = await response.json();
        setMachines((prev) => prev.map((m) => (m.id === result.id ? result : m)));
        setSelectedMachine(result);
        addToast(`Configured parameters committed on ${result.name}.`, "success");
      }
    } catch (err) {
      console.error("Update machine failed:", err);
    }
  };

  // Handle Admin Delete Machine
  const handleDeleteMachine = async (id: string) => {
    try {
      const response = await fetch(`/api/machines/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        setMachines((prev) => prev.filter((m) => m.id !== id));
        setSelectedMachine(null);
        addToast("Machine asset decommissioned permanently.", "info");
      }
    } catch (err) {
      console.error("Delete machine failed:", err);
    }
  };

  // Acknowledge alert
  const handleAcknowledgeAlert = async (id: string) => {
    try {
      const response = await fetch("/api/alerts/acknowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ id })
      });
      if (response.ok) {
        const acknowledged = await response.json();
        setAlerts((prev) => prev.map(a => a.id === id ? acknowledged : a));
        addToast("Alert acknowledged. Warning indicators reset.", "success");
      }
    } catch (err) {
      console.error("Acknowledge alert failed:", err);
    }
  };

  // Clear all alerts (Admin only)
  const handleClearAllAlerts = async () => {
    try {
      const response = await fetch("/api/alerts/clear-all", {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (response.ok) {
        setAlerts([]);
        addToast("Alarms history log cleared.", "info");
      }
    } catch (err) {
      console.error("Clear alerts failed:", err);
    }
  };

  // Read all notifications list
  const handleReadAllNotifications = async () => {
    try {
      await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Read all notifs failed:", err);
    }
  };

  // Select a machine focusing it
  const handleSelectMachineById = (id: string) => {
    const mac = machines.find(m => m.id === id);
    if (mac) {
      setSelectedMachine(mac);
      setShowDetailsModal(true);
      setActiveTab("factory_floor");
    }
  };

  // Open modal details on any machine
  const handleOpenMachineDetails = (mac: Machine) => {
    setSelectedMachine(mac);
    setShowDetailsModal(true);
  };

  // Globally search filter machines
  const filteredMachines = machines.filter(m => {
    const q = searchQuery.toLowerCase();
    return (
      m.id.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q)
    );
  });

  // Overview metrics calculations
  const totalMachinesCount = machines.length;
  const runningCount = machines.filter(m => m.status === "running").length;
  const stoppedCount = machines.filter(m => m.status === "stopped").length;
  const maintenanceCount = machines.filter(m => m.status === "maintenance").length;
  
  const todayProduction = machines.reduce((sum, m) => sum + m.productionCount, 0);
  const totalDefects = machines.reduce((sum, m) => sum + m.defectCount, 0);
  const averageHealth = totalMachinesCount > 0 
    ? Math.round(machines.reduce((sum, m) => sum + m.healthScore, 0) / totalMachinesCount)
    : 100;

  // Render Login Portal if not signed in
  if (!currentUser) {
    const admins = publicProfiles.filter(p => p.role === "admin");
    const supervisors = publicProfiles.filter(p => p.role === "supervisor");

    return (
      <div className={`min-h-screen flex items-center justify-center p-4 relative font-sans transition-colors ${
        darkMode ? "bg-slate-950 text-white dark-theme" : "bg-slate-100 text-slate-900 light-theme"
      }`}>
        <div className={`w-full max-w-md p-6 sm:p-8 rounded-xl relative z-10 border shadow-md transition-all ${
          darkMode 
            ? "bg-slate-900 border-slate-800 text-white" 
            : "bg-white border-slate-200 text-slate-900"
        }`}>
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg mb-2 flex items-center justify-center">
              <Factory className="h-7 w-7" />
            </div>
            <h1 className="font-bold text-xl text-black dark:text-white">Smart Factory SCADA System</h1>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">BCA 5th Sem Project • Ruchita Wagh &amp; Neha Pal</p>
          </div>

          {!isRegistering ? (
            /* SIGN IN FORM */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
                <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">Student & Admin Login</span>
                <button
                  type="button"
                  onClick={() => { setIsRegistering(true); setAuthError(""); }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                >
                  Register Account
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">Username</label>
                  <input
                    id="input-login-username"
                    type="text"
                    required
                    placeholder="Enter username or select below"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full text-xs rounded-md px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      darkMode 
                        ? "bg-slate-800 text-white border-slate-700 placeholder-slate-500" 
                        : "bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-400"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">PIN / Password</label>
                  <input
                    id="input-login-password"
                    type="password"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full text-xs rounded-md px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      darkMode 
                        ? "bg-slate-800 text-white border-slate-700 placeholder-slate-500" 
                        : "bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-400"
                    }`}
                  />
                </div>

                {authError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 border border-red-200 rounded text-center font-medium">
                    {authError}
                  </p>
                )}

                <button
                  id="btn-login-submit"
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer uppercase shadow-sm"
                >
                  Sign In to System
                </button>
              </form>
            </div>
          ) : (
            /* NEW REGISTRATION FORM */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
                <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">New Student / Operator Sign Up</span>
                <button
                  type="button"
                  onClick={() => { setIsRegistering(false); setRegError(""); }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium cursor-pointer underline"
                >
                  Back to Login
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ruchita Wagh"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className={`w-full text-xs border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      darkMode ? "bg-slate-800 text-white border-slate-700" : "bg-slate-50 text-slate-900 border-slate-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ruchita"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className={`w-full text-xs border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      darkMode ? "bg-slate-800 text-white border-slate-700" : "bg-slate-50 text-slate-900 border-slate-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">PIN / Password</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1234"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className={`w-full text-xs border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      darkMode ? "bg-slate-800 text-white border-slate-700" : "bg-slate-50 text-slate-900 border-slate-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">Role Permission</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole("admin")}
                      className={`py-2 px-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        regRole === "admin"
                          ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                          : darkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole("supervisor")}
                      className={`py-2 px-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        regRole === "supervisor"
                          ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                          : darkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <Sliders className="h-3.5 w-3.5" />
                      Supervisor
                    </button>
                  </div>
                </div>

                {regError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 border border-red-200 rounded text-center font-medium">
                    {regError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2.5 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer uppercase shadow-sm mt-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </button>
              </form>
            </div>
          )}

          {/* Multiple login profiles section - Extremely easy to understand */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-blue-900/40">
            <span className="text-[10px] text-blue-900 dark:text-blue-400 font-mono block uppercase mb-2 text-center font-bold">
              Multiple Login Access Profiles (Click to fill)
            </span>
            
            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 font-sans">
              {admins.length > 0 && (
                <div>
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono font-bold uppercase block mb-1">Admin Access Profiles (Can Manage Machines)</span>
                  <div className="grid grid-cols-1 gap-1">
                    {admins.map((adm) => (
                      <div key={adm.username} className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => { setUsername(adm.username); setPassword(adm.pin); }}
                          className={`flex-1 text-left px-2 py-1 text-[10px] font-sans border rounded transition-all flex justify-between items-center cursor-pointer ${
                            darkMode 
                              ? "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-slate-200" 
                              : "border-amber-200 bg-amber-50/60 hover:bg-amber-100/80 text-slate-800"
                          }`}
                        >
                          <span className="font-medium truncate mr-1">{adm.name}</span>
                          <span className="font-mono text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-400/10 px-1 rounded shrink-0">{adm.username} / {adm.pin}</span>
                        </button>
                        {adm.username !== "admin" && (
                          deletingUsername === adm.username ? (
                            <div className="flex items-center gap-1 shrink-0 animate-in fade-in duration-150">
                              <button
                                type="button"
                                onClick={() => handlePublicDelete(adm.username, adm.name)}
                                className="px-1.5 py-1 text-[8px] font-bold bg-rose-600 hover:bg-rose-500 rounded text-white transition-all cursor-pointer shrink-0"
                              >
                                Delete?
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingUsername(null)}
                                className="px-1.5 py-1 text-[8px] font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 rounded text-slate-700 dark:text-slate-300 transition-all cursor-pointer shrink-0"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingUsername(adm.username)}
                              className="p-1.5 rounded border border-rose-200 hover:border-rose-500 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/5 dark:text-rose-400 transition-all cursor-pointer shrink-0"
                              title="Delete Account"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {supervisors.length > 0 && (
                <div>
                  <span className="text-[9px] text-blue-600 dark:text-blue-400 font-mono font-bold uppercase block mb-1">Supervisor Access Profiles (Can View Dashboard Only)</span>
                  <div className="grid grid-cols-1 gap-1">
                    {supervisors.map((sup) => (
                      <div key={sup.username} className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => { setUsername(sup.username); setPassword(sup.pin); }}
                          className={`flex-1 text-left px-2 py-1 text-[10px] font-sans border rounded transition-all flex justify-between items-center cursor-pointer ${
                            darkMode 
                              ? "border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-slate-200" 
                              : "border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-slate-800"
                          }`}
                        >
                          <span className="font-medium truncate mr-1">{sup.name}</span>
                          <span className="font-mono text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/10 px-1 rounded shrink-0">{sup.username} / {sup.pin}</span>
                        </button>
                        {deletingUsername === sup.username ? (
                          <div className="flex items-center gap-1 shrink-0 animate-in fade-in duration-150">
                            <button
                              type="button"
                              onClick={() => handlePublicDelete(sup.username, sup.name)}
                              className="px-1.5 py-1 text-[8px] font-bold bg-rose-600 hover:bg-rose-500 rounded text-white transition-all cursor-pointer shrink-0"
                            >
                              Delete?
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingUsername(null)}
                              className="px-1.5 py-1 text-[8px] font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 rounded text-slate-700 dark:text-slate-300 transition-all cursor-pointer shrink-0"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingUsername(sup.username)}
                            className="p-1.5 rounded border border-rose-200 hover:border-rose-500 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/5 dark:text-rose-400 transition-all cursor-pointer shrink-0"
                            title="Delete Account"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Absolute Dynamic Floating Toast Notifications for Login Screen */}
        <div className="fixed bottom-5 right-5 z-50 space-y-3 pointer-events-none max-w-sm">
          {toasts.map((t) => (
            <div 
              key={t.id} 
              className={`p-4 rounded-xl shadow-2xl flex items-center justify-between gap-3 border pointer-events-auto animate-in slide-in-from-bottom-5 duration-300 ${
                t.type === "alert" 
                  ? "bg-rose-950/90 border-rose-500 text-rose-100 shadow-rose-500/10" 
                  : t.type === "success" 
                    ? "bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-emerald-500/10" 
                    : "bg-[#0b192e]/95 border-blue-500 text-blue-100 shadow-blue-500/10"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {t.type === "alert" ? (
                  <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
                ) : (
                  <Sparkles className="h-5 w-5 text-blue-400 shrink-0" />
                )}
                <p className="text-xs leading-normal font-sans font-medium truncate">{t.message}</p>
              </div>
              <button 
                type="button"
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Master Dashboard view layout (signed in)
  return (
    <div className={`min-h-screen flex font-sans relative transition-colors duration-200 ${
      darkMode ? "bg-slate-900 text-white dark-theme" : "bg-slate-50 text-slate-900 light-theme"
    }`}>
      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 pointer-events-none max-w-sm">
        {toasts.map((t) => (
          <div 
            key={t.id} 
              className={`p-3 rounded-md shadow-md flex items-center justify-between gap-2.5 border pointer-events-auto text-xs font-medium ${
                t.type === "alert" 
                  ? "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/80 dark:text-red-200 dark:border-red-900" 
                  : t.type === "success" 
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-900" 
                    : "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-900"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {t.type === "alert" ? (
                  <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
                ) : (
                  <Activity className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
                <p className="leading-snug truncate">{t.message}</p>
              </div>
              <button 
                type="button"
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                title="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onLogout={handleLogout}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Container Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Header bar */}
        <Header 
          currentUser={currentUser} 
          onLogout={handleLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notifications={notifications}
          onReadAllNotifications={handleReadAllNotifications}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          toggleSidebar={() => setCollapsed(!collapsed)}
        />

        {/* Content canvas scrolling window */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative">
          
          {/* Dashboard Tab render */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Factory Status Overview Bar */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    Live Status
                  </span>
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Total Machines: <strong className="text-black dark:text-white font-bold">{totalMachinesCount} units</strong> in operation
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> {runningCount} Running
                  </span>
                  <span className="flex items-center gap-1.5 text-red-700 dark:text-red-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-red-500" /> {stoppedCount} Stopped
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> {maintenanceCount} Maintenance
                  </span>
                </div>
              </div>

              {/* KPI Cards row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Total Machines */}
                <div id="card-kpi-total" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg flex items-center justify-between shadow-xs select-none">
                  <div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium block">Total Machines</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-3xl font-extrabold text-black dark:text-white">
                        {totalMachinesCount}
                      </span>
                      <span className="text-xs text-slate-500 font-normal">units</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Installed in plant</span>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    <Cpu className="h-6 w-6" />
                  </div>
                </div>

                {/* Running */}
                <div id="card-kpi-running" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg flex items-center justify-between shadow-xs select-none">
                  <div>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium block flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Running
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-3xl font-extrabold text-black dark:text-white">
                        {runningCount}
                      </span>
                      <span className="text-xs text-emerald-600 font-normal">active</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
                      {totalMachinesCount > 0 ? Math.round((runningCount / totalMachinesCount) * 100) : 0}% active rate
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                    <Activity className="h-6 w-6" />
                  </div>
                </div>

                {/* Stopped */}
                <div id="card-kpi-stopped" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg flex items-center justify-between shadow-xs select-none">
                  <div>
                    <span className="text-xs text-red-700 dark:text-red-400 font-medium block flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500" /> Stopped
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-3xl font-extrabold text-black dark:text-white">
                        {stoppedCount}
                      </span>
                      <span className="text-xs text-red-600 font-normal">idle</span>
                    </div>
                    <span className="text-[11px] text-red-600 dark:text-red-400 mt-1 block">
                      Halted / Standby
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                </div>

                {/* Maintenance */}
                <div id="card-kpi-maintenance" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg flex items-center justify-between shadow-xs select-none">
                  <div>
                    <span className="text-xs text-amber-700 dark:text-amber-400 font-medium block flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500" /> Maintenance
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-3xl font-extrabold text-black dark:text-white">
                        {maintenanceCount}
                      </span>
                      <span className="text-xs text-amber-600 font-normal">in service</span>
                    </div>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 block">
                      Routine Service
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                    <Wrench className="h-6 w-6" />
                  </div>
                </div>

              </div>

              {/* Master Overall Equipment Effectiveness (OEE) Gauges Widget */}
              <OEEGauges 
                totalUnits={todayProduction} 
                totalDefects={totalDefects} 
                runningCount={runningCount} 
                totalMachines={totalMachinesCount} 
              />

              {/* Machine List & Assistant row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Assembly Line List */}
                <div className="lg:col-span-2 glass-panel p-5 rounded-lg space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                    <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wide">
                      Machine Overview ({filteredMachines.length} items)
                    </span>
                    {currentUser?.role === "admin" && (
                      <button
                        id="btn-trigger-add-modal-overview"
                        onClick={() => setShowAddModal(true)}
                        className="py-1 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Machine
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredMachines.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleOpenMachineDetails(m)}
                        className={`p-3 rounded-md border text-left hover:border-blue-500 transition-all flex justify-between items-center group cursor-pointer ${
                          darkMode 
                            ? "bg-slate-800/80 border-slate-700 text-white" 
                            : "bg-slate-50 border-slate-200 text-slate-900 hover:bg-blue-50/50"
                        }`}
                      >
                        <div className="overflow-hidden pr-2 flex-1">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {m.name}
                          </span>
                          {m.description && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 line-clamp-1">
                              {m.description}
                            </span>
                          )}
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase mt-1 block font-medium">Zone: {m.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 dark:text-slate-300">{m.metrics.temp}°C</span>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Student Project Quick Overview & Actions */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 space-y-4 shadow-sm">
                  <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                    <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wide block">
                      Project Information
                    </span>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                      BCA 5th Sem Web Development
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-slate-500">Student Developers:</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">Ruchita Wagh &amp; Neha Pal</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-slate-500">Project Type:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">SCADA Machine Monitor</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-slate-500">Logged In As:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{currentUser?.name}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">System Telemetry:</span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active Simulation
                      </span>
                    </div>
                  </div>

                  {/* Navigation Shortcuts */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Quick Shortcuts
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setActiveTab("factory_floor")}
                        className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded text-xs font-medium text-slate-800 dark:text-white transition-colors"
                      >
                        Machines Floor
                      </button>
                      <button
                        onClick={() => setActiveTab("analytics")}
                        className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded text-xs font-medium text-slate-800 dark:text-white transition-colors"
                      >
                        Telemetry Charts
                      </button>
                      <button
                        onClick={() => setActiveTab("alerts")}
                        className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded text-xs font-medium text-slate-800 dark:text-white transition-colors"
                      >
                        View Alerts ({alerts.filter(a => !a.acknowledged).length})
                      </button>
                      <button
                        onClick={() => setActiveTab("about")}
                        className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs font-medium transition-colors"
                      >
                        About Project
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Machines Floor Tab render */}
          {activeTab === "factory_floor" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <DigitalTwinFloor 
                machines={machines} 
                onSelectMachine={(mac) => handleOpenMachineDetails(mac)} 
                selectedMachineId={selectedMachine?.id} 
                onUpdateMachine={handleUpdateMachine}
              />
            </div>
          )}

          {/* Telemetry Charts Tab render */}
          {activeTab === "analytics" && (
            <div className="animate-in fade-in duration-300">
              <AnalyticsPanel authToken={authToken} />
            </div>
          )}

          {/* Alarms Tab render */}
          {activeTab === "alerts" && (
            <div className="animate-in fade-in duration-300">
              <AlertsPanel 
                alerts={alerts} 
                onAcknowledgeAlert={handleAcknowledgeAlert} 
                onClearAllAlerts={handleClearAllAlerts} 
                currentUser={currentUser} 
              />
            </div>
          )}

          {/* Compliance Reports Tab render */}
          {activeTab === "reports" && (
            <div className="animate-in fade-in duration-300">
              <ReportsPanel 
                authToken={authToken} 
                currentUser={currentUser} 
                machines={machines} 
              />
            </div>
          )}

          {/* Profile Access Manager Tab render */}
          {activeTab === "profiles" && currentUser?.role === "admin" && (
            <div className="animate-in fade-in duration-300">
              <ProfilesPanel 
                authToken={authToken}
                currentUser={currentUser}
                addToast={addToast}
              />
            </div>
          )}

          {/* About Project Tab render */}
          {activeTab === "about" && (
            <div className="animate-in fade-in duration-300">
              <AboutProjectPanel />
            </div>
          )}

        </main>
      </div>

      {/* Admin placed hardware adder Modal */}
      {showAddModal && (
        <AddMachineModal 
          onClose={() => setShowAddModal(false)} 
          onAddMachine={handleAddMachine} 
        />
      )}

      {/* Machine Details & Interactive Digital Twin Schematic Modal */}
      <MachineDetailsModal 
        machine={selectedMachine} 
        isOpen={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)} 
        currentUser={currentUser}
        onUpdateMachine={handleUpdateMachine}
        onDeleteMachine={handleDeleteMachine}
        authToken={authToken}
      />
    </div>
  );
}
