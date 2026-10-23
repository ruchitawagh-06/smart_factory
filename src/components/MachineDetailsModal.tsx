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
  Calendar, 
  ShieldAlert, 
  Edit3, 
  Save, 
  Power,
  RotateCw,
  Gauge,
  Droplets,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  Printer
} from "lucide-react";
import { Machine, User, MachineStatus } from "../types";
import MachineSchematicAnimation from "./MachineSchematicAnimation";

interface MachineDetailsModalProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUpdateMachine: (updated: Partial<Machine>) => void;
  onDeleteMachine: (id: string) => void;
  authToken: string;
}

export default function MachineDetailsModal({
  machine,
  isOpen,
  onClose,
  currentUser,
  onUpdateMachine,
  onDeleteMachine,
  authToken
}: MachineDetailsModalProps) {
  if (!isOpen || !machine) return null;

  const [activeTab, setActiveTab] = useState<"schematic" | "sensors" | "controls" | "admin">("schematic");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(machine.name);
  const [editStatus, setEditStatus] = useState<MachineStatus>(machine.status);
  const [editDept, setEditDept] = useState(machine.department);
  const [editMaintDate, setEditMaintDate] = useState(machine.lastMaintenance);
  const [editDesc, setEditDesc] = useState(machine.description || "");

  // Synchronize state when machine changes
  useEffect(() => {
    setEditName(machine.name);
    setEditStatus(machine.status);
    setEditDept(machine.department);
    setEditMaintDate(machine.lastMaintenance);
    setEditDesc(machine.description || "");
    setIsEditing(false);
  }, [machine]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSave = () => {
    onUpdateMachine({
      id: machine.id,
      name: editName,
      status: editStatus,
      department: editDept,
      lastMaintenance: editMaintDate,
      description: editDesc
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to decommission and delete ${machine.name}? This action cannot be undone.`)) {
      onDeleteMachine(machine.id);
      onClose();
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

  const isRunning = machine.status === "running";
  const isMaintenance = machine.status === "maintenance";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-lg shrink-0 ${
              isRunning 
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" 
                : isMaintenance
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                  : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
            }`}>
              <Cpu className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold truncate text-slate-900 dark:text-white">
                  {machine.name}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                  isRunning 
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700" 
                    : isMaintenance
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                      : "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300 border border-red-300 dark:border-red-700"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    isRunning ? "bg-emerald-500 animate-pulse" : isMaintenance ? "bg-amber-500" : "bg-red-500"
                  }`} />
                  {machine.status}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                  Zone: {machine.department}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {machine.description || `Industrial hardware asset ID: ${machine.id}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Power Toggle */}
            <button
              type="button"
              onClick={handleToggleRunning}
              className={`py-1.5 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer ${
                isRunning
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <Power className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isRunning ? "Halt Machine" : "Start Unit"}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/30 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("schematic")}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "schematic"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Live Schematic &amp; Diagnostics
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sensors")}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "sensors"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Gauge className="h-3.5 w-3.5" />
            Live Sensor Readings
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("controls")}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "controls"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            Controls &amp; Service
          </button>

          {currentUser?.role === "admin" && (
            <button
              type="button"
              onClick={() => setActiveTab("admin")}
              className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "admin"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              Admin Configuration
            </button>
          )}
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: Animated SCADA Schematic */}
          {activeTab === "schematic" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3 text-xs text-blue-900 dark:text-blue-300 flex items-center justify-between">
                <div>
                  <span className="font-bold">Interactive SCADA Digital Twin:</span> Click sub-components directly on the schematic to inspect wear %, sensor telemetry, or trigger auto-repair calibration.
                </div>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 uppercase">
                  {machine.type.replace('_', ' ')}
                </span>
              </div>

              {/* Render Animated Schematic */}
              <MachineSchematicAnimation 
                machine={machine} 
                onUpdateMachine={onUpdateMachine}
                currentUserRole={currentUser?.role}
              />
            </div>
          )}

          {/* TAB 2: Live Sensor Readings */}
          {activeTab === "sensors" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Sensor Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Temperature */}
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-medium">Temperature</span>
                    <Flame className={`h-4 w-4 ${machine.metrics.temp > 75 ? "text-red-500 animate-pulse" : "text-blue-500"}`} />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {machine.metrics.temp}°C
                  </div>
                  <span className={`text-[10px] font-medium block mt-1 ${
                    machine.metrics.temp > 75 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {machine.metrics.temp > 75 ? "Exceeds thermal threshold (75°C)" : "Normal operating temperature"}
                  </span>
                </div>

                {/* Speed / RPM */}
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-medium">Spindle / Belt Speed</span>
                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {machine.metrics.rpm} <span className="text-xs font-normal text-slate-500">RPM</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {machine.status === "running" ? "Drive motor engaged" : "Drive motor idle"}
                  </span>
                </div>

                {/* Vibration */}
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-medium">Chassis Vibration</span>
                    <Activity className={`h-4 w-4 ${machine.metrics.vibration > 6 ? "text-amber-500 animate-bounce" : "text-teal-500"}`} />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {machine.metrics.vibration} <span className="text-xs font-normal text-slate-500">mm/s</span>
                  </div>
                  <span className={`text-[10px] font-medium block mt-1 ${
                    machine.metrics.vibration > 6 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {machine.metrics.vibration > 6 ? "Moderate harmonic resonance" : "Balanced linear vibration"}
                  </span>
                </div>

                {/* Power Usage */}
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-medium">Power Consumption</span>
                    <Zap className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {machine.metrics.power} <span className="text-xs font-normal text-slate-500">kW</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    3-phase industrial feed
                  </span>
                </div>

                {/* Pressure */}
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-medium">Hydraulic / Line Pressure</span>
                    <Gauge className="h-4 w-4 text-cyan-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {machine.metrics.pressure} <span className="text-xs font-normal text-slate-500">bar</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Fluid line pressure
                  </span>
                </div>

                {/* Humidity */}
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-medium">Ambient Humidity</span>
                    <Droplets className="h-4 w-4 text-sky-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {machine.metrics.humidity}%
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Cleanroom ambient envelope
                  </span>
                </div>
              </div>

              {/* Production & Defect Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Total Production</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{machine.productionCount.toLocaleString()} units</span>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Defect Count</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{machine.defectCount} items</span>
                  </div>
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Runtime Hours</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{machine.runtimeHours} hrs</span>
                  </div>
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
              </div>

              {/* Health Score Summary Banner */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Machine Operational Health Score
                  </span>
                  <span className={`font-extrabold ${
                    machine.healthScore > 85 ? "text-emerald-600 dark:text-emerald-400" : machine.healthScore > 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    {machine.healthScore}% Healthy
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      machine.healthScore > 85 ? "bg-emerald-500" : machine.healthScore > 70 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${machine.healthScore}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Controls & Maintenance */}
          {activeTab === "controls" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Operator Direct Commands
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleToggleRunning}
                    className={`p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      isRunning
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-xs"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    }`}
                  >
                    <Power className="h-4 w-4" />
                    {isRunning ? "Emergency Stop / Halt" : "Start Production Run"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSetMaintenance}
                    className="p-3 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Wrench className="h-4 w-4" />
                    Place In Maintenance Mode
                  </button>
                </div>
              </div>

              {/* Maintenance Metadata */}
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/40 space-y-3 text-xs">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Scheduled Service &amp; Maintenance Record
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 block">Last Maintenance:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{machine.lastMaintenance}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Department Zone:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{machine.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Machine Serial ID:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{machine.id}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block mb-1">Operational Description:</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {machine.description || "Active production unit integrated with central SCADA telemetry network."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Admin Configuration */}
          {activeTab === "admin" && currentUser?.role === "admin" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Modify Hardware Parameters (Admin Privileges)
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      Machine Display Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-xs border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                        Operational Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as MachineStatus)}
                        className="w-full text-xs border border-slate-300 dark:border-slate-600 rounded px-2.5 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="running">Running</option>
                        <option value="stopped">Stopped</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                        Department Zone
                      </label>
                      <select
                        value={editDept}
                        onChange={(e) => setEditDept(e.target.value)}
                        className="w-full text-xs border border-slate-300 dark:border-slate-600 rounded px-2.5 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="Machining">Zone 1: Machining</option>
                        <option value="Molding">Zone 2: Molding</option>
                        <option value="Assembly">Zone 3: Assembly</option>
                        <option value="Packaging">Zone 4: Packaging</option>
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
                      className="w-full text-xs border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      Equipment Description
                    </label>
                    <textarea
                      rows={2}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full text-xs border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Save className="h-4 w-4" />
                      Save Hardware Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800 text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      Decommission Machine
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-mono text-[11px]">
            SCADA Asset Telemetry • Ruchita Wagh &amp; Neha Pal (BCA Project)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
