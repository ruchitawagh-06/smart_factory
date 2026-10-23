import React, { useState, useEffect } from "react";
import { 
  UserPlus, 
  Trash2, 
  Edit, 
  UserCheck, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ShieldCheck, 
  Sliders,
  Check,
  X,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import { User, UserRole } from "../types";

interface ProfilesPanelProps {
  authToken: string;
  currentUser: User | null;
  addToast: (msg: string, type: 'alert' | 'success' | 'info') => void;
}

interface UserWithPassword extends User {
  password?: string;
}

export default function ProfilesPanel({
  authToken,
  currentUser,
  addToast
}: ProfilesPanelProps) {
  const [usersList, setUsersList] = useState<UserWithPassword[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("supervisor");
  const [avatar, setAvatar] = useState("");

  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Fetch all profiles
  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/users", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsersList(data);
      } else {
        addToast("Could not retrieve profile registry.", "alert");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to connect to profiles database.", "alert");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [authToken]);

  const togglePasswordVisibility = (username: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  const handleEditInit = (user: UserWithPassword) => {
    setEditingUserId(user.id);
    setUsername(user.username);
    setName(user.name);
    setPassword(user.password || "");
    setEmail(user.email);
    setRole(user.role);
    setAvatar(user.avatar);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setUsername("");
    setName("");
    setPassword("");
    setEmail("");
    setRole("supervisor");
    setAvatar("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !name || !password) {
      addToast("Name, username, and password are required.", "alert");
      return;
    }

    const payload = {
      username: username.trim().toLowerCase(),
      name: name.trim(),
      password: password.trim(),
      email: email.trim(),
      role,
      avatar: ""
    };

    try {
      if (editingUserId) {
        // Edit existing profile
        const response = await fetch(`/api/users/${editingUserId}`, {
          method: "PUT",
          headers: { 
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          addToast(`Successfully updated profile: ${payload.name}`, "success");
          handleCancelEdit();
          fetchProfiles();
        } else {
          const err = await response.json();
          addToast(err.error || "Failed to update profile.", "alert");
        }
      } else {
        // Create new profile
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          addToast(`Successfully registered new admin/supervisor: ${payload.name}`, "success");
          handleCancelEdit();
          fetchProfiles();
        } else {
          const err = await response.json();
          addToast(err.error || "Failed to add profile.", "alert");
        }
      }
    } catch (err) {
      addToast("Failed to commit profile updates.", "alert");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete the user profile for '${name}'? This person will lose all login access.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });

      if (response.ok) {
        addToast(`Deleted profile for ${name}.`, "info");
        fetchProfiles();
      } else {
        const err = await response.json();
        addToast(err.error || "Failed to remove profile.", "alert");
      }
    } catch (err) {
      addToast("Failed to delete profile.", "alert");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <h1 className="text-xl font-bold text-black dark:text-white uppercase">User Accounts Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage Admin and Student / Supervisor access accounts for the system.
          </p>
        </div>
        <button
          onClick={fetchProfiles}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          Reload Accounts
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Accounts list (8 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-blue-600" />
              Registered Accounts
            </h2>

            <div className="space-y-3.5">
              {usersList.map((user) => {
                const isAdmin = user.role === "admin";
                const isSelf = currentUser?.id === user.id;
                const isMasterAdmin = user.username === "admin";
                const passwordVisible = showPasswordMap[user.username] || false;

                return (
                  <div 
                    key={user.id} 
                    className={`p-4 rounded-md transition-all border ${
                      editingUserId === user.id 
                        ? "bg-blue-50/70 border-blue-400 dark:bg-blue-900/30 dark:border-blue-700" 
                        : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700"
                    } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Role Icon Badge - No Photo */}
                      <div className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border shadow-xs ${
                        isAdmin 
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700" 
                          : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                      }`}>
                        {isAdmin ? (
                          <ShieldCheck className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <span className="font-bold text-blue-700 dark:text-blue-300 text-xs">
                            {user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "OP"}
                          </span>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</span>
                          {isSelf && (
                            <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 px-1.5 py-0.5 rounded">
                              YOU
                            </span>
                          )}
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                            isAdmin 
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700" 
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 flex-wrap">
                          <span className="font-mono text-slate-700 dark:text-slate-300">@{user.username}</span>
                          <span className="text-slate-400">•</span>
                          <span className="truncate max-w-[160px] sm:max-w-none">{user.email}</span>
                        </div>

                        {/* Password / PIN display for clarity */}
                        <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Login PIN / Pass:</span>
                          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-blue-600 dark:text-blue-300 select-all font-semibold">
                            {passwordVisible ? user.password : "••••••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(user.username)}
                            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-0.5"
                            title="Toggle Password Visibility"
                          >
                            {passwordVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleEditInit(user)}
                        title="Edit User Credentials"
                        className="p-2 rounded-md bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={isSelf || isMasterAdmin}
                        title={isSelf ? "Cannot delete yourself" : isMasterAdmin ? "Cannot delete Master admin" : "Delete Profile"}
                        className={`p-2 rounded-md border transition-colors ${
                          isSelf || isMasterAdmin
                            ? "opacity-30 cursor-not-allowed text-slate-400 border-slate-200 dark:border-slate-700"
                            : "bg-white dark:bg-slate-700 hover:bg-red-50 hover:text-red-600 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 cursor-pointer"
                        }`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Add/Edit Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <UserPlus className="h-4 w-4 text-emerald-600" />
              {editingUserId ? "Update Account" : "Create New Account"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs text-slate-700 dark:text-slate-300 font-medium block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ruchita Wagh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-600 rounded-md pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 font-sans"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="text-xs text-slate-700 dark:text-slate-300 font-medium block mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">@</span>
                  <input
                    type="text"
                    required
                    disabled={!!editingUserId}
                    placeholder="e.g. ruchita_admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-600 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                  />
                </div>
                {!editingUserId && (
                  <p className="text-[10px] text-slate-500 mt-1">This will be used to log in.</p>
                )}
              </div>

              {/* Password / PIN */}
              <div>
                <label className="text-xs text-slate-700 dark:text-slate-300 font-medium block mb-1 flex justify-between">
                  <span>Password / PIN</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. ruchita123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-600 rounded-md pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="text-xs text-slate-700 dark:text-slate-300 font-medium block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="e.g. ruchitawagh06@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-600 rounded-md pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 font-sans"
                  />
                </div>
              </div>

              {/* Account Role */}
              <div>
                <label className="text-xs text-slate-700 dark:text-slate-300 font-medium block mb-1">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`py-2.5 px-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      role === "admin"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-400"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    System Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("supervisor")}
                    className={`py-2.5 px-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      role === "supervisor"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-400"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Sliders className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Supervisor
                  </button>
                </div>
              </div>

              {/* Account Icon Badge Preview (No Photo) */}
              <div className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                  role === "admin" 
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700" 
                    : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                }`}>
                  {role === "admin" ? (
                    <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    {role === "admin" ? "Admin Security Badge" : "Supervisor Badge"}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Icon-based identification (no photo used)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  {editingUserId ? "Update Account" : "Save Account"}
                </button>
                
                {editingUserId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3.5 py-2.5 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
