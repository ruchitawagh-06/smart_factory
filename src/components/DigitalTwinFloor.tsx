import React, { useState } from "react";
import { 
  Cpu, 
  Power, 
  Layers, 
  ChevronRight, 
  Wrench, 
  Sliders, 
  ExternalLink,
  Activity,
  Flame,
  CheckCircle2
} from "lucide-react";
import { Machine, MachineStatus } from "../types";

export const getMachineIcon = (mac: Machine) => {
  return Cpu;
};

interface DigitalTwinFloorProps {
  machines: Machine[];
  onSelectMachine: (machine: Machine) => void;
  selectedMachineId?: string;
  onUpdateMachine?: (updated: Partial<Machine>) => void;
}

export default function DigitalTwinFloor({
  machines,
  onSelectMachine,
  selectedMachineId,
  onUpdateMachine
}: DigitalTwinFloorProps) {
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>("All");

  // 4 Standard SCADA Departments
  const departments = ["Machining", "Molding", "Assembly", "Packaging"];

  const handleToggleStatus = (e: React.MouseEvent, mac: Machine) => {
    e.stopPropagation();
    if (!onUpdateMachine) return;
    const newStatus: MachineStatus = mac.status === "running" ? "stopped" : "running";
    onUpdateMachine({ id: mac.id, status: newStatus });
  };

  const displayedDepartments = selectedZoneFilter === "All"
    ? departments
    : departments.filter(d => d === selectedZoneFilter);

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-black dark:text-white">
              Factory Floor Layout - Machine Zones
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select any machine card to open its full animated schematic &amp; telemetry modal.
          </p>
        </div>

        {/* Legend status indicators */}
        <div className="flex items-center gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Running</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Maintenance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Stopped</span>
          </div>
        </div>
      </div>

      {/* Zone Filter Quick Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Filter Zones:
        </span>
        <button
          type="button"
          onClick={() => setSelectedZoneFilter("All")}
          className={`py-1.5 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            selectedZoneFilter === "All"
              ? "bg-blue-600 text-white shadow-xs font-semibold"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200"
          }`}
        >
          All Zones ({machines.length})
        </button>
        {departments.map((dept, idx) => {
          const count = machines.filter(m => m.department === dept).length;
          return (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedZoneFilter(dept)}
              className={`py-1.5 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                selectedZoneFilter === dept
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200"
              }`}
            >
              Zone 0{idx + 1}: {dept} ({count})
            </button>
          );
        })}
      </div>

      {/* Department Columns Grid */}
      <div className={`grid gap-4 ${
        displayedDepartments.length === 1 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
      }`}>
        {displayedDepartments.map((dept) => {
          const deptIndex = departments.indexOf(dept);
          const deptMachines = machines.filter(m => m.department === dept);

          return (
            <div 
              key={dept} 
              className="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/40 p-3.5 flex flex-col"
            >
              {/* Department Header */}
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                  {dept}
                </span>
                <span className="text-[11px] font-medium text-slate-500 px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                  Zone 0{deptIndex + 1} ({deptMachines.length})
                </span>
              </div>

              {/* Machine Cards */}
              <div className="space-y-3 flex-1">
                {deptMachines.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-md">
                    No machines in this zone
                  </div>
                ) : (
                  deptMachines.map((mac) => {
                    const isSelected = selectedMachineId === mac.id;
                    const isRunning = mac.status === "running";
                    const isMaintenance = mac.status === "maintenance";

                    return (
                      <div
                        key={mac.id}
                        id={`card-machine-${mac.id}`}
                        onClick={() => onSelectMachine(mac)}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer bg-white dark:bg-slate-800 hover:shadow-md ${
                          isSelected
                            ? "border-blue-600 ring-2 ring-blue-500/30 shadow-md bg-blue-50/20 dark:bg-blue-950/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"
                        }`}
                      >
                        {/* Title & Status */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate group-hover:text-blue-600">
                              {mac.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              ID: {mac.id} • {mac.type.replace('_', ' ')}
                            </span>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                            isRunning 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                              : isMaintenance
                                ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                                : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
                          }`}>
                            {mac.status}
                          </span>
                        </div>

                        {/* Description snippet */}
                        {mac.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                            {mac.description}
                          </p>
                        )}

                        {/* Sensor Metrics 3-Grid */}
                        <div className="grid grid-cols-3 gap-1.5 my-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 text-center">
                          <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-900/50">
                            <span className="text-[9px] text-slate-500 block uppercase font-medium">Temp</span>
                            <span className={`text-xs font-bold ${mac.metrics.temp > 75 ? "text-red-600 dark:text-red-400" : "text-slate-800 dark:text-slate-200"}`}>
                              {mac.metrics.temp}°C
                            </span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-900/50">
                            <span className="text-[9px] text-slate-500 block uppercase font-medium">Speed</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {mac.metrics.rpm} <span className="text-[9px] font-normal text-slate-400">RPM</span>
                            </span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-900/50">
                            <span className="text-[9px] text-slate-500 block uppercase font-medium">Health</span>
                            <span className={`text-xs font-bold ${
                              mac.healthScore > 85 ? "text-emerald-600 dark:text-emerald-400" : mac.healthScore > 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
                            }`}>
                              {mac.healthScore}%
                            </span>
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="pt-1">
                          {/* Quick Start / Stop Toggle */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleStatus(e, mac)}
                            className={`w-full py-1.5 px-2 rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                              isRunning
                                ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
                            }`}
                            title={isRunning ? "Halt unit" : "Start unit"}
                          >
                            <Power className="h-3 w-3" />
                            {isRunning ? "Stop Machine" : "Start Machine"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
