import React from "react";
import { 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  Wrench, 
  BellRing, 
  ShieldAlert,
  Info
} from "lucide-react";
import { Alert, User } from "../types";

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledgeAlert: (id: string) => void;
  onClearAllAlerts: () => void;
  currentUser: User | null;
}

export default function AlertsPanel({
  alerts,
  onAcknowledgeAlert,
  onClearAllAlerts,
  currentUser
}: AlertsPanelProps) {
  
  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const historicAlerts = alerts.filter(a => a.acknowledged);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Col 1 & 2: Alarms Panel */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Active Warning Alarms */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-red-500" />
              <h2 className="text-base font-bold text-black dark:text-white uppercase tracking-wide">
                Active Machine Alerts ({activeAlerts.length})
              </h2>
            </div>
            {currentUser?.role === "admin" && alerts.length > 0 && (
              <button
                id="btn-wipe-alarms"
                onClick={onClearAllAlerts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-3 pt-1">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-sans">
                No active alarms. All machine sensor readings are within normal safety limits.
              </div>
            ) : (
              activeAlerts.map((alt) => (
                <div 
                  key={alt.id} 
                  className={`p-4 rounded-md border ${
                    alt.severity === 'critical' 
                      ? "border-red-200 bg-red-50/70 dark:bg-red-950/20 dark:border-red-900" 
                      : "border-amber-200 bg-amber-50/70 dark:bg-amber-950/20 dark:border-amber-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 rounded bg-white dark:bg-slate-800 shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        <AlertTriangle className={`h-5 w-5 ${alt.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide block">
                          Alert at {alt.machineName}
                        </span>
                        <h4 className="text-xs font-bold text-black dark:text-white mt-0.5 leading-snug">
                          {alt.metric} ({alt.value}) exceeds threshold of {alt.threshold}
                        </h4>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Time: {new Date(alt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <button
                      id={`btn-acknowledge-alert-${alt.id}`}
                      onClick={() => onAcknowledgeAlert(alt.id)}
                      className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shrink-0"
                    >
                      Acknowledge
                    </button>
                  </div>

                  {/* Recommendation */}
                  {alt.recommendation && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex gap-2 items-start text-xs text-slate-700 dark:text-slate-300">
                      <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{alt.recommendation}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alarm Log History */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wide">
              Resolved & Acknowledged Alerts
            </h3>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700 pr-1">
            {historicAlerts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-sans">
                No resolved alert logs yet.
              </div>
            ) : (
              historicAlerts.map((alt) => (
                <div key={alt.id} className="py-2.5 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <div className="overflow-hidden">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block truncate">{alt.machineName}: {alt.metric} normal</span>
                      <span className="text-[10px] text-slate-400">Time: {new Date(alt.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold shrink-0 uppercase bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                    Resolved
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Col 3: Guidelines and Safety Info */}
      <div className="space-y-6">
        
        {/* Safety limits stats */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <ShieldAlert className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wide">
              Standard Threshold Limits
            </h3>
          </div>

          <div className="space-y-3 pt-1 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between font-bold mb-1">
                <span>Temperature Limit</span>
                <span className="text-red-600">80.0°C Max</span>
              </div>
              <p className="text-[11px] text-slate-500">Normal operating range is 30°C - 75°C. Alert triggers if spindle temp goes above 80°C.</p>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between font-bold mb-1">
                <span>Vibration Limit</span>
                <span className="text-red-600">8.0 mm/s Max</span>
              </div>
              <p className="text-[11px] text-slate-500">Normal vibration range is 1.0 - 5.0 mm/s. Alert triggers if excessive shaking occurs.</p>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between font-bold mb-1">
                <span>Hydraulic Pressure</span>
                <span className="text-red-600">150.0 bar Max</span>
              </div>
              <p className="text-[11px] text-slate-500">Normal pressure is 100 - 140 bar for injection molding machines.</p>
            </div>
          </div>
        </div>

        {/* Maintenance Guide */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <Wrench className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wide">
              Operator Checklist
            </h3>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 pt-1 font-sans">
            <p>1. Check lubrication levels on mechanical axis weekly.</p>
            <p>2. Clean conveyor belts and sensors daily.</p>
            <p>3. Record all emergency stops in the shift log.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
