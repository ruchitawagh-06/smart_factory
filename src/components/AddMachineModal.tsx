import React, { useState } from "react";
import { X, Cpu, Plus } from "lucide-react";

interface AddMachineModalProps {
  onClose: () => void;
  onAddMachine: (machineData: { name: string; type: string; department: string }) => void;
}

export default function AddMachineModal({
  onClose,
  onAddMachine
}: AddMachineModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("assembly_robot");
  const [department, setDepartment] = useState("Assembly");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddMachine({ name, type, department });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div 
        id="modal-add-machine" 
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 relative"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-black dark:text-white uppercase tracking-wide">
              Add New Machine
            </h2>
          </div>
          <button
            id="btn-close-add-machine"
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-slate-700 dark:text-slate-300 font-medium block mb-1">
              Machine Name
            </label>
            <input
              id="input-add-machine-name"
              type="text"
              required
              placeholder="e.g. Primary Assembly Arm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-700 dark:text-slate-300 font-medium block mb-1">
                Machine Type
              </label>
              <select
                id="select-add-machine-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="assembly_robot">Assembly Robot</option>
                <option value="cnc_milling">CNC Milling Machine</option>
                <option value="injection_mold">Injection Mold Press</option>
                <option value="conveyor">Conveyor Belt Track</option>
                <option value="packaging_unit">Packaging Unit</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-700 dark:text-slate-300 font-medium block mb-1">
                Department Zone
              </label>
              <select
                id="select-add-machine-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Assembly">Assembly</option>
                <option value="Machining">Machining</option>
                <option value="Molding">Molding</option>
                <option value="Packaging">Packaging</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <button
              id="btn-submit-add-machine"
              type="submit"
              className="flex-1 py-2 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Save Machine
            </button>
            <button
              id="btn-cancel-add-machine"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
