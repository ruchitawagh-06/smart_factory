export type MachineStatus = 'running' | 'stopped' | 'maintenance' | 'offline';
export type MachineType = 'assembly_robot' | 'cnc_milling' | 'injection_mold' | 'conveyor' | 'packaging_unit';
export type UserRole = 'admin' | 'supervisor';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  avatar: string;
  email: string;
}

export interface SensorMetrics {
  temp: number; // °C
  vibration: number; // mm/s or g-force scale
  rpm: number; // rotations per minute
  power: number; // kW
  pressure: number; // bar
  humidity: number; // %
}

export interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
  type: MachineType;
  department: string;
  metrics: SensorMetrics;
  healthScore: number; // 0-100
  lastMaintenance: string;
  runtimeHours: number;
  productionCount: number;
  defectCount: number;
  qrCode?: string; // Data URL for QR Code
  description?: string; // Easy translation of what the machine does
}

export interface MetricThresholds {
  tempMax: number;
  vibrationMax: number;
  powerMax: number;
}

export interface Alert {
  id: string;
  machineId: string;
  machineName: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  recommendation: string;
  acknowledged: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'alert' | 'success' | 'info';
  timestamp: string;
  read: boolean;
}

export interface ProductionLog {
  date: string;
  units: number;
  defects: number;
  target: number;
  energyKwh: number;
  downtimeMinutes: number;
}

export interface AIAnalysis {
  riskScore: number; // 0-100
  estimatedFailureTime: string;
  maintenanceSuggestions: string[];
  explanation: string;
}
