import React, { useState, useEffect } from "react";
import { 
  Wrench, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  RotateCw, 
  Play, 
  RefreshCw,
  Info,
  ShieldCheck,
  Zap,
  Flame,
  Gauge
} from "lucide-react";
import { Machine, MachineStatus } from "../types";

interface MachineSchematicAnimationProps {
  machine: Machine;
  onUpdateMachine?: (updated: Partial<Machine>) => void;
  currentUserRole?: string;
}

interface MachinePart {
  id: string;
  name: string;
  status: "ok" | "warning" | "critical" | "offline";
  description: string;
  wear: number; // 0 to 100%
  telemetry: string;
}

export default function MachineSchematicAnimation({
  machine,
  onUpdateMachine,
  currentUserRole
}: MachineSchematicAnimationProps) {
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [parts, setParts] = useState<MachinePart[]>([]);
  const [repairingPartId, setRepairingPartId] = useState<string | null>(null);

  // Derive part statuses based on machine state and metrics
  useEffect(() => {
    const isOffline = machine.status === "offline";
    const isMaintenance = machine.status === "maintenance";
    const isStopped = machine.status === "stopped";
    const h = machine.healthScore;

    let derivedParts: MachinePart[] = [];

    switch (machine.type) {
      case "cnc_milling":
        derivedParts = [
          {
            id: "spindle",
            name: "High-Speed Spindle",
            status: isOffline ? "offline" : isStopped ? "critical" : machine.metrics.temp > 80 ? "critical" : machine.metrics.rpm > 1600 ? "warning" : "ok",
            description: "Main rotating spindle carrying the milling tool cutter.",
            wear: Math.max(0, Math.min(100, 100 - h + 12)),
            telemetry: `${machine.metrics.rpm} RPM | Temp: ${machine.metrics.temp}°C`
          },
          {
            id: "axis_drives",
            name: "XYZ Linear Axis Drives",
            status: isOffline ? "offline" : isMaintenance ? "warning" : machine.metrics.vibration > 7.5 ? "warning" : "ok",
            description: "Precision servo-driven ball screws for XYZ positioning.",
            wear: Math.max(0, Math.min(100, 100 - h + 5)),
            telemetry: `Vibe: ${machine.metrics.vibration} mm/s | Accel: 1.2g`
          },
          {
            id: "coolant_pump",
            name: "Flood Coolant Pump",
            status: isOffline ? "offline" : isStopped ? "offline" : machine.metrics.temp > 85 ? "critical" : "ok",
            description: "Pumps high-pressure synthetic coolant fluid to cutter head.",
            wear: Math.max(0, Math.min(100, 100 - h + 8)),
            telemetry: `Flow: 15.4 L/min | Pressure: 3.2 bar`
          },
          {
            id: "tool_carousel",
            name: "Cutter Tool Head",
            status: isOffline ? "offline" : isMaintenance ? "warning" : "ok",
            description: "Carbide milling cutter holding the active cutting tool insert.",
            wear: Math.max(0, Math.min(100, 100 - h + 20)),
            telemetry: `Feed Rate: 320 mm/min | Load: 45%`
          }
        ];
        break;

      case "conveyor":
        derivedParts = [
          {
            id: "drive_motor",
            name: "Heavy Duty Gearmotor",
            status: isOffline ? "offline" : isStopped ? "critical" : machine.metrics.temp > 78 ? "warning" : "ok",
            description: "Primary induction motor and reducer driving the belt.",
            wear: Math.max(0, Math.min(100, 100 - h + 10)),
            telemetry: `Temp: ${machine.metrics.temp}°C | Power: ${machine.metrics.power} kW`
          },
          {
            id: "belt_system",
            name: "Polyurethane Belt System",
            status: isOffline ? "offline" : isStopped ? "critical" : machine.metrics.vibration > 8.0 ? "warning" : "ok",
            description: "Friction-grip textured polyurethane belt conveying materials.",
            wear: Math.max(0, Math.min(100, 100 - h + 18)),
            telemetry: `Tension: 24 N/mm | Slip: 0.2%`
          },
          {
            id: "optical_sensors",
            name: "Optical Beam Sensors",
            status: isOffline ? "offline" : isMaintenance ? "warning" : "ok",
            description: "Photoelectric sensors tracking package passing and routing.",
            wear: Math.max(0, Math.min(100, 100 - h + 4)),
            telemetry: `Beam: Active | Response: 12ms`
          },
          {
            id: "tension_rollers",
            name: "Automatic Tension Roller",
            status: isOffline ? "offline" : isMaintenance ? "warning" : "ok",
            description: "Mechanical pulley keeping belt tight and centered.",
            wear: Math.max(0, Math.min(100, 100 - h + 11)),
            telemetry: `Offset: 1.2mm | Rotation: Smooth`
          }
        ];
        break;

      case "injection_mold":
        derivedParts = [
          {
            id: "clamp_hydraulic",
            name: "Hydraulic Toggle Clamp",
            status: isOffline ? "offline" : isStopped ? "critical" : machine.metrics.pressure < 80 ? "warning" : "ok",
            description: "High tonnage hydraulic ram holding the mold blocks shut.",
            wear: Math.max(0, Math.min(100, 100 - h + 9)),
            telemetry: `Pressure: ${machine.metrics.pressure} bar | Clamp Force: 2500 kN`
          },
          {
            id: "heating_band",
            name: "Heating Band Ring",
            status: isOffline ? "offline" : isStopped ? "critical" : machine.metrics.temp > 92 ? "critical" : machine.metrics.temp < 60 ? "warning" : "ok",
            description: "Electric element bands heating raw plastic pellets to fluid state.",
            wear: Math.max(0, Math.min(100, 100 - h + 15)),
            telemetry: `Core Temp: ${machine.metrics.temp}°C | Duty: 62%`
          },
          {
            id: "extrusion_screw",
            name: "Reciprocating Screw",
            status: isOffline ? "offline" : isMaintenance ? "warning" : "ok",
            description: "Rotates to feed and extrude molten plastic into the mold cavity.",
            wear: Math.max(0, Math.min(100, 100 - h + 13)),
            telemetry: `Torque: 420 Nm | Position: 45mm`
          },
          {
            id: "cooling_channel",
            name: "Water Cooling Channel",
            status: isOffline ? "offline" : isStopped ? "offline" : "ok",
            description: "Internal tubes cooling the solidifying plastic product.",
            wear: Math.max(0, Math.min(100, 100 - h + 7)),
            telemetry: `Inlet: 18°C | Flow: 8.5 L/min`
          }
        ];
        break;

      case "assembly_robot":
        derivedParts = [
          {
            id: "servo_actuators",
            name: "Servo Joint Actuators",
            status: isOffline ? "offline" : isStopped ? "critical" : machine.metrics.vibration > 8.0 ? "warning" : "ok",
            description: "Precision servo motors powering articulating limb joints.",
            wear: Math.max(0, Math.min(100, 100 - h + 12)),
            telemetry: `Duty Cycle: 82% | Current Draw: 8.4A`
          },
          {
            id: "gripper_claw",
            name: "Pneumatic Gripper Claw",
            status: isOffline ? "offline" : isMaintenance ? "warning" : "ok",
            description: "Mechanical end effector picking up assembly elements.",
            wear: Math.max(0, Math.min(100, 100 - h + 16)),
            telemetry: `Stroke: 50mm | Pressure: 6.2 bar`
          },
          {
            id: "hydraulic_pump",
            name: "High-Pressure Pump",
            status: isOffline ? "offline" : isStopped ? "critical" : machine.metrics.temp > 80 ? "warning" : "ok",
            description: "Supplies system-wide force transfer fluid.",
            wear: Math.max(0, Math.min(100, 100 - h + 11)),
            telemetry: `Temp: ${machine.metrics.temp}°C | Oil Level: 92%`
          },
          {
            id: "controller_board",
            name: "Feedback Controller Board",
            status: isOffline ? "offline" : "ok",
            description: "Micro-processor processing sensor feeds and motor pulses.",
            wear: Math.max(0, Math.min(100, 100 - h + 4)),
            telemetry: `Bus Load: 34% | Ping: 2ms`
          }
        ];
        break;

      case "packaging_unit":
      default:
        derivedParts = [
          {
            id: "cutter_blade",
            name: "Piston Cutter Blade",
            status: isOffline ? "offline" : isStopped ? "critical" : machine.metrics.vibration > 7.5 ? "warning" : "ok",
            description: "Guillotine blade shearing plastic wrap or cardboard.",
            wear: Math.max(0, Math.min(100, 100 - h + 22)),
            telemetry: `Stroke: Cyclic | Sharpness: 84%`
          },
          {
            id: "pneumatic_ram",
            name: "Pneumatic Ram Press",
            status: isOffline ? "offline" : isStopped ? "critical" : "ok",
            description: "Piston plunger forming and packing cartons down.",
            wear: Math.max(0, Math.min(100, 100 - h + 10)),
            telemetry: `Pressure: 5.8 bar | Cycles: ${machine.productionCount}`
          },
          {
            id: "infeed_rollers",
            name: "Infeed Box Roller",
            status: isOffline ? "offline" : isMaintenance ? "warning" : "ok",
            description: "Rollers feeding empty flat cardboard into the forming station.",
            wear: Math.max(0, Math.min(100, 100 - h + 14)),
            telemetry: `RPM: 120 | Feed rate: 0.8m/s`
          },
          {
            id: "heat_seal",
            name: "Heating Seal Bar",
            status: isOffline ? "offline" : isStopped ? "critical" : machine.metrics.temp > 85 ? "critical" : machine.metrics.temp < 55 ? "warning" : "ok",
            description: "Thermostatically controlled block fusing wrapping materials.",
            wear: Math.max(0, Math.min(100, 100 - h + 16)),
            telemetry: `Temp: ${machine.metrics.temp}°C | Power: ${machine.metrics.power} kW`
          }
        ];
        break;
    }

    setParts(derivedParts);
    if (!selectedPartId && derivedParts.length > 0) {
      setSelectedPartId(derivedParts[0].id);
    }
  }, [machine, selectedPartId]);

  const handleRepairPart = (partId: string) => {
    if (!onUpdateMachine) return;
    setRepairingPartId(partId);
    
    setTimeout(() => {
      // Simulate fixing the machine metrics/health on the server
      const currentHealth = machine.healthScore;
      const targetHealth = Math.min(100, currentHealth + 15);
      
      // Reset alert metrics to normal values
      const updatedMetrics = { ...machine.metrics };
      if (updatedMetrics.temp > 75) updatedMetrics.temp = 62;
      if (updatedMetrics.vibration > 6) updatedMetrics.vibration = 4.2;
      if (updatedMetrics.pressure < 80) updatedMetrics.pressure = 95;
      if (updatedMetrics.pressure > 110) updatedMetrics.pressure = 95;

      onUpdateMachine({
        id: machine.id,
        healthScore: targetHealth,
        metrics: updatedMetrics,
        defectCount: Math.max(0, machine.defectCount - 1),
        // If it was stopped/maintenance, resume operation
        status: machine.status === "stopped" || machine.status === "maintenance" ? "running" : machine.status
      });

      setRepairingPartId(null);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok":
        return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
      case "warning":
        return "text-amber-400 border-amber-500/20 bg-amber-500/5";
      case "critical":
        return "text-rose-400 border-rose-500/30 bg-rose-500/5 blinking-red-border";
      case "offline":
      default:
        return "text-slate-400 border-slate-700 bg-slate-900/40";
    }
  };

  const selectedPart = parts.find(p => p.id === selectedPartId);

  return (
    <div className="border border-slate-700 bg-slate-900 text-white rounded-xl p-4 space-y-4 shadow-sm">
      {/* Schematic Header Info */}
      <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-sky-400 animate-pulse" />
          <span className="text-xs font-semibold text-white tracking-wider uppercase">
            LIVE SCHEMATIC DIAGRAM &amp; DIAGNOSTICS
          </span>
        </div>
        <div className="text-[10px] font-mono bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-400/30 uppercase">
          {machine.status} MODE
        </div>
      </div>

      {/* Grid Layout: SVG Schematic Left, Component Board Right */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
        
        {/* Interactive SVG Animation Frame (3 Cols) */}
        <div className="md:col-span-3 bg-slate-950 rounded-xl border border-slate-700 relative flex items-center justify-center p-3 overflow-hidden min-h-[220px]">
          {/* Subtle grid layer */}
          <div className="absolute inset-0 bg-slate-900/40 opacity-30 pointer-events-none" />
          
          {/* Live scanning bar if running */}
          {machine.status === "running" && (
            <div className="absolute left-0 right-0 h-0.5 bg-sky-500/10 border-b border-sky-400/20 w-full animate-pulse pointer-events-none" 
                 style={{ animation: 'scanline 2.5s infinite linear' }} />
          )}

          {/* SVG Canvas drawing */}
          {machine.type === "cnc_milling" && (
            <svg viewBox="0 0 400 240" className="w-full max-w-sm h-auto select-none">
              {/* CNC Machine Frame Background */}
              <rect x="50" y="30" width="300" height="180" rx="8" fill="#0d1b35" stroke="#1d3056" strokeWidth="2" />
              <rect x="70" y="50" width="260" height="110" rx="4" fill="#050c18" stroke="#1d2e4e" />
              
              {/* XYZ Linear Axis rails (Guides) */}
              {/* X Guide */}
              <line x1="80" y1="60" x2="320" y2="60" stroke="#1e2e4a" strokeWidth="4" strokeDasharray="5 3" />
              {/* Y Guide */}
              <line x1="200" y1="50" x2="200" y2="160" stroke="#1e2e4a" strokeWidth="4" strokeDasharray="5 3" />

              {/* Milling Bed (X Axis Table sliding) */}
              <g transform={`translate(${machine.status === "running" ? Math.sin(Date.now() / 800) * 20 : 0}, 0)`}>
                <rect x="140" y="145" width="120" height="10" rx="2" fill="#2d3f60" stroke="#fff" strokeWidth="1" />
                <rect x="170" y="155" width="60" height="15" fill="#1b2845" stroke="#3b82f6" strokeWidth="1" />
                
                {/* CNC Workpiece block */}
                <rect x="185" y="125" width="30" height="20" rx="2" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
              </g>

              {/* Spindle Carriage & Tool Head assembly (Z-axis plunging) */}
              <g transform={`translate(0, ${machine.status === "running" ? Math.cos(Date.now() / 1500) * 5 : 0})`}>
                {/* Carriage block */}
                <rect x="180" y="45" width="40" height="40" rx="3" fill="#1e2e4a" stroke="#fff" strokeWidth="1" 
                      className={`cursor-pointer transition-all ${selectedPartId === "axis_drives" ? "stroke-sky-400 stroke-2" : "stroke-slate-500"}`}
                      onClick={() => setSelectedPartId("axis_drives")} />
                
                {/* Spindle cylinder */}
                <rect x="192" y="85" width="16" height="30" fill="#334155" stroke="#475569" strokeWidth="1"
                      className={`cursor-pointer transition-all ${selectedPartId === "spindle" ? "stroke-sky-400 stroke-2" : "stroke-slate-500"}`}
                      onClick={() => setSelectedPartId("spindle")} />
                
                {/* Milling Tool/Drill Bit (rotating) */}
                <polygon points="196,115 204,115 202,128 198,128" fill="#94a3b8" stroke="#fff" strokeWidth="1"
                         className={`cursor-pointer transition-all ${selectedPartId === "tool_carousel" ? "stroke-sky-400 stroke-2 animate-pulse" : "stroke-slate-500"}`}
                         onClick={() => setSelectedPartId("tool_carousel")} />
                
                {/* Spindle rotation blur rings */}
                {machine.status === "running" && (
                  <ellipse cx="200" cy="115" rx="14" ry="3" fill="none" stroke="#60a5fa" strokeWidth="1.5" className="animate-pulse" />
                )}
              </g>

              {/* Coolant fluid nozzles & spray */}
              <path d="M 120,40 Q 150,60 178,118" fill="none" stroke="#1d4ed8" strokeWidth="1.5" />
              <circle cx="120" cy="40" r="3" fill="#3b82f6" 
                      className={`cursor-pointer ${selectedPartId === "coolant_pump" ? "stroke-sky-400 stroke-2" : ""}`}
                      onClick={() => setSelectedPartId("coolant_pump")} />
              
              {/* Coolant droplets animation */}
              {machine.status === "running" && (
                <>
                  <circle cx="150" cy="65" r="1.5" fill="#60a5fa" className="animate-bounce" style={{ animationDelay: "0s" }} />
                  <circle cx="165" cy="90" r="1.5" fill="#60a5fa" className="animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <circle cx="175" cy="110" r="1.5" fill="#60a5fa" className="animate-bounce" style={{ animationDelay: "0.4s" }} />
                </>
              )}

              {/* Fault warning rings */}
              {parts.some(p => p.status === "critical") && (
                <g className="animate-ping" style={{ transformOrigin: "200px 100px" }}>
                  <circle cx="200" cy="100" r="30" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
                </g>
              )}
            </svg>
          )}

          {machine.type === "conveyor" && (
            <svg viewBox="0 0 400 240" className="w-full max-w-sm h-auto select-none">
              {/* Conveyor Bed Casing */}
              <rect x="40" y="110" width="320" height="30" rx="4" fill="#0d1b35" stroke="#1d3056" strokeWidth="2" />
              
              {/* Left drive drum */}
              <circle cx="65" cy="125" r="14" fill="#1b2845" stroke="#fff" strokeWidth="1.5"
                      className={`cursor-pointer ${selectedPartId === "drive_motor" ? "stroke-sky-400 stroke-2" : ""} ${machine.status === "running" ? "animate-spin" : ""}`}
                      style={{ transformOrigin: "65px 125px", animationDuration: "1.5s" }}
                      onClick={() => setSelectedPartId("drive_motor")} />
              <line x1="65" y1="115" x2="65" y2="135" stroke="#475569" strokeWidth="2" />

              {/* Right tension drum */}
              <circle cx="335" cy="125" r="14" fill="#1b2845" stroke="#fff" strokeWidth="1.5"
                      className={`cursor-pointer ${selectedPartId === "tension_rollers" ? "stroke-sky-400 stroke-2" : ""} ${machine.status === "running" ? "animate-spin" : ""}`}
                      style={{ transformOrigin: "335px 125px", animationDuration: "1.5s" }}
                      onClick={() => setSelectedPartId("tension_rollers")} />

              {/* Endless Belt loops running */}
              <rect x="65" y="113" width="270" height="24" rx="2" fill="none" stroke="#cbd5e1" strokeWidth="2" 
                    strokeDasharray={machine.status === "running" ? "10 5" : "0"}
                    className={`cursor-pointer ${selectedPartId === "belt_system" ? "stroke-sky-400" : ""} ${machine.status === "running" ? "animate-infinite" : ""}`}
                    style={{ animation: machine.status === "running" ? "scanline 1s infinite linear" : "none" }}
                    onClick={() => setSelectedPartId("belt_system")} />

              {/* Optical photobeam sensor */}
              <rect x="230" y="65" width="12" height="24" rx="1" fill="#334155" stroke="#475569" 
                    className={`cursor-pointer ${selectedPartId === "optical_sensors" ? "stroke-sky-400 stroke-2" : ""}`}
                    onClick={() => setSelectedPartId("optical_sensors")} />
              {/* Photo-beam laser */}
              <line x1="236" y1="89" x2="236" y2="113" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" className="animate-pulse" />

              {/* Conveyed Cargo Packages moving */}
              {machine.status === "running" && (
                <>
                  {/* Package A */}
                  <g className="conveyor-package" style={{ animation: "convey1 4s infinite linear" }}>
                    <rect x="0" y="85" width="24" height="24" rx="2" fill="#d97706" stroke="#f59e0b" strokeWidth="1" />
                    <line x1="0" y1="97" x2="24" y2="97" stroke="#b45309" strokeWidth="1.5" />
                  </g>
                  {/* Package B */}
                  <g className="conveyor-package" style={{ animation: "convey1 4s infinite linear", animationDelay: "2s" }}>
                    <rect x="0" y="85" width="24" height="24" rx="2" fill="#d97706" stroke="#f59e0b" strokeWidth="1" />
                    <line x1="0" y1="97" x2="24" y2="97" stroke="#b45309" strokeWidth="1.5" />
                  </g>
                </>
              )}

              {machine.status === "stopped" && (
                <g transform="translate(180, 85)">
                  <rect x="0" y="0" width="24" height="24" rx="2" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
                  {/* Warning Sign */}
                  <polygon points="12,2 20,18 4,18" fill="#ef4444" stroke="#fff" strokeWidth="1" />
                  <text x="12" y="15" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">!</text>
                </g>
              )}

              {/* CSS Injection for Conveyor Package movement */}
              <style>{`
                @keyframes convey1 {
                  0% { transform: translate(65px, 0px); opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { transform: translate(300px, 0px); opacity: 0; }
                }
              `}</style>
            </svg>
          )}

          {machine.type === "injection_mold" && (
            <svg viewBox="0 0 400 240" className="w-full max-w-sm h-auto select-none">
              {/* Industrial Extruder Barrel */}
              <rect x="40" y="90" width="160" height="40" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              
              {/* Helical Injection Screw inside barrel */}
              <rect x="50" y="102" width="140" height="16" rx="2" fill="#64748b" stroke="#94a3b8" strokeWidth="1"
                    className={`cursor-pointer ${selectedPartId === "extrusion_screw" ? "stroke-sky-400 stroke-2" : ""} ${machine.status === "running" ? "animate-pulse" : ""}`}
                    onClick={() => setSelectedPartId("extrusion_screw")} />

              {/* Hopper holding polymer pellets */}
              <polygon points="60,40 100,40 88,90 72,90" fill="#334155" stroke="#475569" strokeWidth="1.5" />
              <circle cx="80" cy="55" r="4" fill="#3b82f6" />
              <circle cx="75" cy="70" r="4" fill="#3b82f6" />
              <circle cx="85" cy="73" r="4" fill="#3b82f6" />

              {/* Heater bands around barrel */}
              <rect x="110" y="87" width="10" height="46" rx="1" fill="#f59e0b" 
                    className={`cursor-pointer ${selectedPartId === "heating_band" ? "stroke-sky-400 stroke-2" : ""} ${machine.status === "running" ? "animate-pulse" : ""}`}
                    onClick={() => setSelectedPartId("heating_band")} />
              <rect x="150" y="87" width="10" height="46" rx="1" fill="#f59e0b" 
                    className={`cursor-pointer ${selectedPartId === "heating_band" ? "stroke-sky-400 stroke-2" : ""}`}
                    onClick={() => setSelectedPartId("heating_band")} />

              {/* Mold Clamping Unit block on the right */}
              {/* Left Stationary Platen */}
              <rect x="220" y="70" width="20" height="80" rx="2" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
              
              {/* Right Moving Platen (opens and closes) */}
              <g transform={`translate(${machine.status === "running" ? Math.abs(Math.sin(Date.now() / 2000)) * 18 : 10}, 0)`}>
                <rect x="270" y="70" width="20" height="80" rx="2" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" 
                      className={`cursor-pointer ${selectedPartId === "clamp_hydraulic" ? "stroke-sky-400" : ""}`}
                      onClick={() => setSelectedPartId("clamp_hydraulic")} />
                {/* Hydraulic Ram actuator shaft */}
                <rect x="290" y="100" width="50" height="20" fill="#475569" stroke="#64748b" />
              </g>

              {/* Water cooling tube lines */}
              <path d="M 230,50 L 230,70" stroke="#06b6d4" strokeWidth="2" strokeDasharray="3 3"
                    className={`animate-pulse cursor-pointer ${selectedPartId === "cooling_channel" ? "stroke-sky-400" : ""}`}
                    onClick={() => setSelectedPartId("cooling_channel")} />
            </svg>
          )}

          {machine.type === "assembly_robot" && (
            <svg viewBox="0 0 400 240" className="w-full max-w-sm h-auto select-none">
              {/* Pedestal Base */}
              <rect x="150" y="180" width="100" height="20" rx="3" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
              
              {/* Robotic Segment Joint 1 (Base shoulder) */}
              <circle cx="200" cy="180" r="16" fill="#1e293b" stroke="#fff" strokeWidth="1.5"
                      className={`cursor-pointer ${selectedPartId === "hydraulic_pump" ? "stroke-sky-400" : ""}`}
                      onClick={() => setSelectedPartId("hydraulic_pump")} />

              {/* Rotating Arm link groups */}
              <g transform={`rotate(${machine.status === "running" ? Math.sin(Date.now() / 1500) * 20 - 40 : -40}, 200, 180)`}>
                {/* Arm segment 1 (Shoulder to Elbow) */}
                <rect x="193" y="100" width="14" height="80" rx="6" fill="#3b82f6" stroke="#fff" strokeWidth="1"
                      className={`cursor-pointer ${selectedPartId === "servo_actuators" ? "stroke-sky-400" : ""}`}
                      onClick={() => setSelectedPartId("servo_actuators")} />

                {/* Elbow Joint */}
                <circle cx="200" cy="100" r="12" fill="#1e293b" stroke="#fff" strokeWidth="1.5" />

                <g transform={`rotate(${machine.status === "running" ? Math.cos(Date.now() / 1200) * 35 + 50 : 50}, 200, 100)`}>
                  {/* Arm segment 2 (Elbow to Wrist) */}
                  <rect x="194" y="30" width="12" height="70" rx="5" fill="#3b82f6" stroke="#fff" strokeWidth="1"
                        className={`cursor-pointer ${selectedPartId === "servo_actuators" ? "stroke-sky-400" : ""}`}
                        onClick={() => setSelectedPartId("servo_actuators")} />

                  {/* Wrist joint */}
                  <circle cx="200" cy="30" r="8" fill="#1e293b" stroke="#fff" strokeWidth="1" />

                  {/* Gripper end effector claw */}
                  <g transform="translate(190, 10)">
                    <rect x="0" y="0" width="20" height="10" fill="#475569" stroke="#fff" strokeWidth="1"
                          className={`cursor-pointer ${selectedPartId === "gripper_claw" ? "stroke-sky-400" : ""}`}
                          onClick={() => setSelectedPartId("gripper_claw")} />
                    
                    {/* Left & Right pinch claw fingers */}
                    <path d="M 0,10 Q -5,18 0,22" fill="none" stroke="#fff" strokeWidth="1.5" />
                    <path d="M 20,10 Q 25,18 20,22" fill="none" stroke="#fff" strokeWidth="1.5" />
                    
                    {/* Assembled chip being carried */}
                    {machine.status === "running" && (
                      <rect x="6" y="16" width="8" height="8" rx="1" fill="#22c55e" className="animate-pulse" />
                    )}
                  </g>
                </g>
              </g>

              {/* PLC controller box on side */}
              <rect x="50" y="150" width="40" height="50" rx="4" fill="#0d1527" stroke="#1d3056" strokeWidth="1.5"
                    className={`cursor-pointer ${selectedPartId === "controller_board" ? "stroke-sky-400 stroke-2" : ""}`}
                    onClick={() => setSelectedPartId("controller_board")} />
              <rect x="58" y="160" width="24" height="10" fill="#000" rx="1" />
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 absolute left-17 bottom-11 led-glow-green" />
            </svg>
          )}

          {machine.type === "packaging_unit" && (
            <svg viewBox="0 0 400 240" className="w-full max-w-sm h-auto select-none">
              {/* Packaging Frame */}
              <rect x="40" y="30" width="320" height="180" rx="6" fill="#091326" stroke="#1a2d52" strokeWidth="2" />

              {/* Feed Roller Rollers on Left */}
              <circle cx="80" cy="140" r="22" fill="#1e293b" stroke="#475569" strokeWidth="1.5"
                      className={`cursor-pointer ${selectedPartId === "infeed_rollers" ? "stroke-sky-400 stroke-2" : ""} ${machine.status === "running" ? "animate-spin" : ""}`}
                      style={{ transformOrigin: "80px 140px", animationDuration: "2.5s" }}
                      onClick={() => setSelectedPartId("infeed_rollers")} />
              <circle cx="80" cy="140" r="6" fill="#64748b" />

              {/* Vertical sealing ram piston column */}
              <rect x="200" y="40" width="20" height="60" fill="#334155" stroke="#475569" strokeWidth="1" />
              
              {/* Sealed plunging head */}
              <g transform={`translate(0, ${machine.status === "running" ? Math.abs(Math.sin(Date.now() / 1000)) * 25 : 5})`}>
                {/* Plunger Block */}
                <rect x="170" y="100" width="80" height="16" rx="2" fill="#475569" stroke="#fff" strokeWidth="1"
                      className={`cursor-pointer ${selectedPartId === "pneumatic_ram" ? "stroke-sky-400 stroke-2" : ""}`}
                      onClick={() => setSelectedPartId("pneumatic_ram")} />
                
                {/* Heated Sealing bar underneath */}
                <rect x="180" y="116" width="60" height="8" fill="#ef4444" 
                      className={`cursor-pointer ${selectedPartId === "heat_seal" ? "stroke-sky-400 animate-pulse" : ""}`}
                      onClick={() => setSelectedPartId("heat_seal")} />

                {/* Shear Cutter Blade */}
                <line x1="245" y1="100" x2="245" y2="128" stroke="#cbd5e1" strokeWidth="2.5"
                      className={`cursor-pointer ${selectedPartId === "cutter_blade" ? "stroke-sky-400" : ""}`}
                      onClick={() => setSelectedPartId("cutter_blade")} />
              </g>

              {/* Box Packages conveying underneath press */}
              <g transform="translate(140, 155)">
                <rect x="50" y="10" width="40" height="30" rx="1" fill="#b45309" stroke="#fff" strokeWidth="1" />
                {/* Package Lid flapped open */}
                <path d="M 50,10 L 40,0" stroke="#fff" strokeWidth="1.5" />
                <path d="M 90,10 L 100,0" stroke="#fff" strokeWidth="1.5" />
              </g>
            </svg>
          )}

          {/* Prompt/Instruction Indicator */}
          <div className="absolute bottom-2 left-3 text-[9px] font-mono text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
            ⚡ CLICK COMPONENTS ON SCHEMATIC TO DIAGNOSE
          </div>
        </div>

        {/* Diagnostic Status Dashboard Board (2 Cols) */}
        <div className="md:col-span-2 flex flex-col justify-between gap-3 font-sans">
          
          {/* Sub-component quick selection lists */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-mono block uppercase font-bold tracking-wider">
              System Sub-Components
            </span>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {parts.map((p) => {
                const isSelected = p.id === selectedPartId;
                const statusTheme = getStatusColor(p.status);

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPartId(p.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? "border-sky-400 bg-sky-500/20 text-white shadow" 
                        : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-1.5">
                      <span className="text-xs font-semibold truncate">{p.name}</span>
                      <span className="text-[9px] font-mono text-slate-400 truncate">{p.telemetry}</span>
                    </div>
                    
                    {/* Status Dot/Indicator */}
                    <span className={`text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded shrink-0 border ${statusTheme}`}>
                      {p.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Detailed Part Specs Information Panel */}
          {selectedPart && (
            <div className="p-3 border border-slate-700 bg-slate-950 rounded-xl flex flex-col justify-between relative overflow-hidden animate-in fade-in duration-200">
              {/* Subtle visual accent */}
              <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    {selectedPart.name}
                  </span>
                  <span className={`text-[10px] font-mono font-bold ${
                    selectedPart.wear > 45 ? "text-rose-400" : selectedPart.wear > 25 ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    Wear: {selectedPart.wear}%
                  </span>
                </div>
                
                <p className="text-[10px] text-slate-400 leading-normal mb-2.5">
                  {selectedPart.description}
                </p>

                {/* Sub-Metric diagnostics details */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800 mb-2.5">
                  <div>
                    <span className="text-[8px] text-slate-500 block">HEALTH METRIC</span>
                    <span className="font-semibold text-white">{100 - selectedPart.wear}% Fit</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 block">CURRENT STATUS</span>
                    <span className={`font-semibold capitalize ${
                      selectedPart.status === "ok" ? "text-emerald-400" : selectedPart.status === "warning" ? "text-amber-400" : "text-rose-400"
                    }`}>{selectedPart.status}</span>
                  </div>
                </div>
              </div>

              {/* Simulate repair command action if not OK */}
              {onUpdateMachine && selectedPart.status !== "ok" && selectedPart.status !== "offline" && (
                <button
                  type="button"
                  disabled={repairingPartId !== null}
                  onClick={() => handleRepairPart(selectedPart.id)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    repairingPartId === selectedPart.id 
                      ? "bg-sky-500/10 text-sky-400 border border-sky-400/30 cursor-not-allowed"
                      : "bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/10"
                  }`}
                >
                  {repairingPartId === selectedPart.id ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Calibrating & Repairing...
                    </>
                  ) : (
                    <>
                      <Wrench className="h-3.5 w-3.5" />
                      Run Auto-Repair & Re-Calibrate
                    </>
                  )}
                </button>
              )}

              {selectedPart.status === "ok" && (
                <div className="py-2 flex items-center gap-1.5 justify-center bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded-lg uppercase">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Component fully operational
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
