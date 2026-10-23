import React from "react";
import { Activity, CheckCircle, Percent, AlertCircle } from "lucide-react";

interface OEEGaugesProps {
  totalUnits: number;
  totalDefects: number;
  runningCount: number;
  totalMachines: number;
}

export default function OEEGauges({
  totalUnits,
  totalDefects,
  runningCount,
  totalMachines
}: OEEGaugesProps) {
  // Compute Availability
  const availability = totalMachines > 0 ? Math.round((runningCount / totalMachines) * 100) : 0;
  
  // Compute Performance
  const performance = totalUnits > 0 ? Math.min(99, Math.round(90 + (runningCount * 1.5))) : 0;
  
  // Compute Quality
  const goodUnits = Math.max(0, totalUnits - totalDefects);
  const quality = totalUnits > 0 ? Math.round((goodUnits / totalUnits) * 100) : 100;

  // Overall Efficiency
  const oee = Math.round((availability / 100) * (performance / 100) * (quality / 100) * 100);

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-black dark:text-white">
            Factory Performance & Efficiency (OEE)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Key operational metrics calculated from active machines and production count
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
          <Percent className="h-3.5 w-3.5" />
          Overall Score: {oee}%
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Efficiency Card */}
        <div className="p-4 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Overall Efficiency</span>
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-black dark:text-white">{oee}%</span>
            <span className="text-xs text-slate-500">
              {oee >= 75 ? "Normal" : "Low"}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${oee >= 75 ? 'bg-blue-600' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, oee)}%` }}
            />
          </div>
        </div>

        {/* Machine Availability */}
        <div className="p-4 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Machine Availability</span>
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-black dark:text-white">{availability}%</span>
            <span className="text-xs text-slate-500">{runningCount}/{totalMachines} active</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, availability)}%` }}
            />
          </div>
        </div>

        {/* Operating Performance */}
        <div className="p-4 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Performance Rate</span>
            <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-black dark:text-white">{performance}%</span>
            <span className="text-xs text-slate-500">Speed ratio</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, performance)}%` }}
            />
          </div>
        </div>

        {/* Quality Score */}
        <div className="p-4 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Quality Output</span>
            <AlertCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-black dark:text-white">{quality}%</span>
            <span className="text-xs text-slate-500">{goodUnits} good units</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="h-full bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, quality)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
