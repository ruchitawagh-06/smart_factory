import React, { useState, useEffect } from "react";
import { 
  X, 
  Wrench, 
  Cpu, 
  Trash2, 
  Flame, 
  Activity, 
  TrendingUp, 
  Zap, 
  Hourglass, 
  Calendar, 
  ShieldAlert, 
  Edit3, 
  Save, 
  Printer,
  Power,
  Maximize2
} from "lucide-react";
import { Machine, User, MachineStatus } from "../types";

interface MachineDetailsPanelProps {
  machine: Machine;
  onClose: () => void;
  currentUser: User | null;
  onUpdateMachine: (updated: Partial<Machine>) => void;
  onDeleteMachine: (id: string) => void;
  authToken: string;
  onOpenModal?: () => void;
}

export default function MachineDetailsPanel({
  machine,
  onClose,
  currentUser,
  onUpdateMachine,
  onDeleteMachine,
  authToken,
  onOpenModal
}: MachineDetailsPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(machine.name);
  const [editStatus, setEditStatus] = useState<MachineStatus>(machine.status);
  const [editDept, setEditDept] = useState(machine.department);
  const [editMaintDate, setEditMaintDate] = useState(machine.lastMaintenance);

  // Sync state if machine changes
  useEffect(() => {
    setEditName(machine.name);
    setEditStatus(machine.status);
    setEditDept(machine.department);
    setEditMaintDate(machine.lastMaintenance);
    setIsEditing(false);
  }, [machine]);

  const handleSave = () => {
    onUpdateMachine({
      id: machine.id,
      name: editName,
      status: editStatus,
      department: editDept,
      lastMaintenance: editMaintDate
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${machine.name}?`)) {
      onDeleteMachine(machine.id);
    }
  };

  const handleToggleRunning = () => {
    const nextStatus: MachineStatus = machine.status === "running" ? "stopped" : "running";
    onUpdateMachine({
      id: machine.id,
      status: nextStatus
    });
  };

  const handleSetMaintenance = () => {
    onUpdateMachine({
      id: machine.id,
      status: "maintenance"
    });
  };

  // Simple print report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 shadow-sm space-y-5">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
        <div>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider block">
            Machine Quick Inspector
          </span>
          <h3 className="text-lg font-bold text-black dark:text-white">
            {machine.name}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {onOpenModal && (
            <button
              onClick={onOpenModal}
              className="p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 transition-colors"
              title="Expand into full modal dialog"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Editing Form */}
      {isEditing ? (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md space-y-3">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
            Edit Machine Details
          </h4>
          
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
              Machine Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full text-xs border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as MachineStatus)}
                className="w-full text-xs border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="running">Running</option>
                <option value="stopped">Stopped</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                Department
              </label>
              <select
                value={editDept}
                onChange={(e) => setEditDept(e.target.value)}
                className="w-full text-xs border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Assembly">Assembly</option>
                <option value="Machining">Machining</option>
                <option value="Molding">Molding</option>
                <option value="Packaging">Packaging</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
              Last Maintenance Date
            </label>
            <input
              type="date"
              value={editMaintDate}
              onChange={(e) => setEditMaintDate(e.target.value)}
              className="w-full text-xs border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded flex items-center justify-center gap-1"
            >
              <Save className="h-3.5 w-3.5" />
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="py-1.5 px-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Overview Mode */
        <div className="space-y-4">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Machine ID</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{machine.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Department Zone</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{machine.department}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Current Status</span>
              <span className={`inline-block font-semibold uppercase px-2 py-0.5 rounded text-[10px] mt-0.5 ${
                machine.status === 'running' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                  : machine.status === 'maintenance'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {machine.status}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Last Maintenance</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{machine.lastMaintenance}</span>
            </div>
          </div>

          {/* Quick Operator Controls */}
          <div>
            <span className="text-xs font-bold text-black dark:text-white block mb-2">
              Operator Controls
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleToggleRunning}
                className={`flex-1 py-2 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 text-white transition-colors ${
                  machine.status === "running"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <Power className="h-4 w-4" />
                {machine.status === "running" ? "Stop Machine" : "Start Machine"}
              </button>

              <button
                onClick={handleSetMaintenance}
                className="py-2 px-3 rounded text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1"
              >
                <Wrench className="h-4 w-4" />
                Maintenance
              </button>
            </div>
          </div>

          {/* Real-Time Sensor Metrics */}
          <div>
            <span className="text-xs font-bold text-black dark:text-white block mb-2">
              Live Sensor Readings
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px]">Temperature</span>
                  <span className="text-base font-bold text-black dark:text-white">{machine.metrics.temp}°C</span>
                </div>
                <Flame className={`h-5 w-5 ${machine.metrics.temp > 75 ? 'text-red-500' : 'text-blue-500'}`} />
              </div>

              <div className="p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px]">Spindle Speed</span>
                  <span className="text-base font-bold text-black dark:text-white">{machine.metrics.rpm} RPM</span>
                </div>
                <TrendingUp className="h-5 w-5 text-indigo-500" />
              </div>

              <div className="p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px]">Vibration</span>
                  <span className="text-base font-bold text-black dark:text-white">{machine.metrics.vibration} mm/s</span>
                </div>
                <Activity className="h-5 w-5 text-teal-500" />
              </div>

              <div className="p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px]">Power Usage</span>
                  <span className="text-base font-bold text-black dark:text-white">{machine.metrics.power} kW</span>
                </div>
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Simple Health & Safety Diagnosis */}
          <div className="p-3.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs">
            <span className="font-bold text-blue-900 dark:text-blue-300 block mb-1 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-blue-600" />
              Health Status: {machine.healthScore}% - {machine.healthScore > 80 ? "Optimal" : "Needs Inspection"}
            </span>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              {machine.metrics.temp > 75 
                ? "Warning: Temperature exceeds normal threshold. Inspect cooling fan."
                : "Machine operating parameters are within regular safety limits."}
            </p>
          </div>

          {/* Admin Controls */}
          {currentUser?.role === "admin" && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 py-1.5 px-3 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-medium flex items-center justify-center gap-1"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Info
              </button>
              <button
                onClick={handleDelete}
                className="py-1.5 px-3 border border-red-300 hover:bg-red-50 text-red-600 rounded text-xs font-medium flex items-center justify-center gap-1"
                title="Delete machine"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
