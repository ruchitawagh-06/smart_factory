import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { 
  Machine, 
  MachineStatus, 
  MachineType, 
  User, 
  UserRole, 
  SensorMetrics, 
  Alert, 
  Notification, 
  ProductionLog, 
  AIAnalysis 
} from "./src/types";

// Load environment variables
dotenv.config();

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
const isGeminiEnabled = geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY" && geminiApiKey !== "";
let ai: GoogleGenAI | null = null;

if (isGeminiEnabled) {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client successfully initialized.");
  } catch (err) {
    console.error("Failed to initialize Gemini API Client:", err);
  }
} else {
  console.log("Gemini API key not found. Using high-fidelity heuristic fallback for AI predictions.");
}

const app = express();
const PORT = 3000;

app.use(express.json());

import fs from "fs";

let users: User[] = [
  {
    id: "usr_ruchita",
    username: "ruchita",
    role: "admin",
    name: "Ruchita Wagh",
    avatar: "",
    email: "ruchita.wagh@factory-dash.com"
  },
  {
    id: "usr_nehapal",
    username: "nehapal",
    role: "admin",
    name: "Neha Pal",
    avatar: "",
    email: "neha.pal@factory-dash.com"
  }
];

let userPasswords: Record<string, string> = {
  "ruchita": "ruchita123",
  "nehapal": "neha123"
};

const USERS_DB_FILE = path.join(process.cwd(), "users_db.json");

function saveUsersToDisk() {
  try {
    fs.writeFileSync(USERS_DB_FILE, JSON.stringify({ users, userPasswords }, null, 2));
  } catch (err) {
    console.error("Failed to save users database:", err);
  }
}

function loadUsersFromDisk() {
  try {
    if (fs.existsSync(USERS_DB_FILE)) {
      const dataStr = fs.readFileSync(USERS_DB_FILE, "utf-8");
      const data = JSON.parse(dataStr);
      if (data.users && Array.isArray(data.users)) {
        users = data.users;
      }
      if (data.userPasswords && typeof data.userPasswords === "object") {
        userPasswords = data.userPasswords;
      }
      console.log("Users and passwords restored from users_db.json successfully.");
    }
  } catch (err) {
    console.error("Failed to load users database from disk:", err);
  }
}

// Initial restoration of user database on startup
loadUsersFromDisk();

let machines: Machine[] = [
  {
    id: "mac_1",
    name: "Conveyor Belt",
    status: "running",
    type: "conveyor",
    department: "Assembly",
    metrics: { temp: 42.5, vibration: 2.1, rpm: 1200, power: 3.4, pressure: 0.0, humidity: 45.2 },
    healthScore: 98,
    lastMaintenance: "2026-06-15",
    runtimeHours: 320,
    productionCount: 45000,
    defectCount: 220,
    description: "Transports raw materials and finished parts smoothly across the assembly line."
  },
  {
    id: "mac_2",
    name: "CNC Milling Machine",
    status: "running",
    type: "cnc_milling",
    department: "Machining",
    metrics: { temp: 68.2, vibration: 4.8, rpm: 8500, power: 12.8, pressure: 6.2, humidity: 38.4 },
    healthScore: 89,
    lastMaintenance: "2026-05-20",
    runtimeHours: 512,
    productionCount: 18500,
    defectCount: 195,
    description: "High precision cutting and shaping tool for metal and alloy components."
  },
  {
    id: "mac_3",
    name: "Plastic Injection Molder",
    status: "running",
    type: "injection_mold",
    department: "Molding",
    metrics: { temp: 195.4, vibration: 3.2, rpm: 0, power: 18.5, pressure: 145.2, humidity: 32.1 },
    healthScore: 91,
    lastMaintenance: "2026-06-01",
    runtimeHours: 420,
    productionCount: 32000,
    defectCount: 410,
    description: "Melts plastic raw material and presses it into custom structural shells."
  },
  {
    id: "mac_4",
    name: "Robotic Assembly Arm",
    status: "running",
    type: "assembly_robot",
    department: "Assembly",
    metrics: { temp: 38.1, vibration: 1.8, rpm: 0, power: 2.1, pressure: 5.5, humidity: 42.5 },
    healthScore: 97,
    lastMaintenance: "2026-06-10",
    runtimeHours: 195,
    productionCount: 29800,
    defectCount: 95,
    description: "Intelligent robotic arm that automatically pieces together individual components."
  },
  {
    id: "mac_5",
    name: "Surface Metal Cutter",
    status: "running",
    type: "cnc_milling",
    department: "Machining",
    metrics: { temp: 48.0, vibration: 3.2, rpm: 7200, power: 8.5, pressure: 5.8, humidity: 40.0 },
    healthScore: 93,
    lastMaintenance: "2026-06-05",
    runtimeHours: 280,
    productionCount: 15400,
    defectCount: 130,
    description: "Trims edges and cuts surface profiles on sheet metal."
  },
  {
    id: "mac_6",
    name: "Hydraulic Stamping Press",
    status: "stopped",
    type: "injection_mold",
    department: "Molding",
    metrics: { temp: 21.5, vibration: 0.0, rpm: 0, power: 0.0, pressure: 0.0, humidity: 49.0 },
    healthScore: 88,
    lastMaintenance: "2026-05-18",
    runtimeHours: 610,
    productionCount: 24000,
    defectCount: 310,
    description: "Heavy hydraulic press for stamping molding sheets; currently halted on standby."
  },
  {
    id: "mac_7",
    name: "Laser Label Engraver",
    status: "maintenance",
    type: "packaging_unit",
    department: "Packaging",
    metrics: { temp: 24.5, vibration: 0.2, rpm: 0, power: 0.5, pressure: 0.0, humidity: 48.0 },
    healthScore: 76,
    lastMaintenance: "2026-06-28",
    runtimeHours: 850,
    productionCount: 65200,
    defectCount: 950,
    description: "Uses lasers to print identification codes; scheduled optical lens recalibration."
  },
  {
    id: "mac_8",
    name: "Box Packaging Unit",
    status: "stopped",
    type: "packaging_unit",
    department: "Packaging",
    metrics: { temp: 22.1, vibration: 0.0, rpm: 0, power: 0.0, pressure: 0.0, humidity: 50.1 },
    healthScore: 84,
    lastMaintenance: "2026-04-12",
    runtimeHours: 640,
    productionCount: 112000,
    defectCount: 1420,
    description: "Folds cardboard cartons and seals packaged products; offline between shifts."
  }
];

let alerts: Alert[] = [
  {
    id: "alt_1",
    machineId: "mac_2",
    machineName: "CNC Milling Machine",
    metric: "Temperature",
    value: 82.5,
    threshold: 80,
    severity: "warning",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    recommendation: "Ensure coolant lines are unobstructed and pump flow is normal. Check spindle friction.",
    acknowledged: false
  }
];

let notifications: Notification[] = [
  {
    id: "not_1",
    message: "CNC Milling Machine triggered high temperature warning: 82.5°C",
    type: "alert",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false
  }
];

// Seed 30 days of production metrics for analytics
const productionLogs: ProductionLog[] = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date(Date.now() - (29 - i) * 24 * 3600 * 1000).toISOString().split('T')[0];
  // Weekend lower output
  const day = new Date(date).getDay();
  const isWeekend = day === 0 || day === 6;
  const target = isWeekend ? 500 : 2500;
  const units = isWeekend ? Math.floor(400 + Math.random() * 150) : Math.floor(2350 + Math.random() * 300);
  const defects = Math.floor(units * (0.01 + Math.random() * 0.015));
  const energyKwh = Math.floor(units * (0.15 + Math.random() * 0.05));
  const downtimeMinutes = isWeekend ? Math.floor(10 + Math.random() * 20) : Math.floor(15 + Math.random() * 80);
  
  return { date, units, defects, target, energyKwh, downtimeMinutes };
});

// Middleware for authentication validation (mock token checks username in header with graceful fallback)
const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    (req as any).user = users[0];
    return next();
  }
  const username = token.replace("Bearer ", "").trim();
  const user = users.find(u => u.username === username);
  if (!user) {
    (req as any).user = users[0];
    return next();
  }
  (req as any).user = user;
  next();
};

// IoT Simulates sensors every 5 seconds
setInterval(() => {
  const nowStr = new Date().toISOString();
  
  machines = machines.map(mac => {
    if (mac.status !== "running") {
      // Offline/stopped machines cool down slowly
      const tempDiff = mac.metrics.temp - 22.0;
      const coolingRate = mac.status === "maintenance" ? 0.5 : 1.2;
      return {
        ...mac,
        metrics: {
          temp: parseFloat(Math.max(22.0, mac.metrics.temp - coolingRate).toFixed(1)),
          vibration: 0.0,
          rpm: 0,
          power: parseFloat(Math.max(0.0, mac.metrics.power - 0.2).toFixed(1)),
          pressure: parseFloat(Math.max(0.0, mac.metrics.pressure - 1.0).toFixed(1)),
          humidity: parseFloat((45.0 + Math.sin(Date.now() / 100000) * 5.0).toFixed(1))
        }
      };
    }

    // Generate sensor data based on machine type
    let temp = mac.metrics.temp;
    let vibration = mac.metrics.vibration;
    let rpm = mac.metrics.rpm;
    let power = mac.metrics.power;
    let pressure = mac.metrics.pressure;
    let humidity = mac.metrics.humidity;

    // Standard deviation and incremental steps
    const step = (min: number, max: number) => min + Math.random() * (max - min);

    switch (mac.type) {
      case "conveyor":
        temp = 40.0 + step(-1.5, 1.5);
        vibration = 2.0 + step(-0.4, 0.4);
        rpm = 1200 + Math.floor(step(-50, 50));
        power = 3.2 + step(-0.3, 0.3);
        pressure = 0.0;
        break;
      case "cnc_milling":
        temp = 48.0 + step(-2.0, 2.5); // Nominal cutting spindle heat
        vibration = 3.2 + step(-0.8, 0.9);
        rpm = 7200 + Math.floor(step(-150, 150));
        power = 8.5 + step(-0.8, 0.8);
        pressure = 5.8 + step(-0.3, 0.3);
        break;
      case "injection_mold":
        temp = 190.0 + step(-4.0, 4.0); // high heat
        vibration = 3.0 + step(-0.5, 0.6);
        rpm = 0; // hydraulic
        power = 17.5 + step(-2.0, 2.0);
        pressure = 140.0 + step(-10.0, 10.0);
        break;
      case "assembly_robot":
        temp = 37.0 + step(-1.0, 1.0);
        vibration = 1.7 + step(-0.3, 0.3);
        rpm = 0;
        power = 2.0 + step(-0.2, 0.2);
        pressure = 5.5 + step(-0.2, 0.2);
        break;
      case "packaging_unit":
        temp = 28.0 + step(-0.8, 0.8);
        vibration = 1.2 + step(-0.2, 0.2);
        rpm = 300 + Math.floor(step(-10, 10));
        power = 1.8 + step(-0.15, 0.15);
        pressure = 0.0;
        break;
    }

    // Force a temporary anomaly or alert spike on 5% chance to make control room alive
    if (Math.random() < 0.03) {
      if (Math.random() < 0.5) {
        temp += 15.0; // Overheat spike
        console.log(`Alert Event: Anomaly simulated - Temp spike on ${mac.name}`);
      } else {
        vibration += 4.2; // Vibration spike
        console.log(`Alert Event: Anomaly simulated - Vibration spike on ${mac.name}`);
      }
    }

    // Enforce limits and roundings
    temp = parseFloat(Math.max(10, temp).toFixed(1));
    vibration = parseFloat(Math.max(0, vibration).toFixed(1));
    rpm = Math.max(0, rpm);
    power = parseFloat(Math.max(0, power).toFixed(1));
    pressure = parseFloat(Math.max(0, pressure).toFixed(1));
    humidity = parseFloat((42.0 + Math.sin(Date.now() / 50000) * 8.0).toFixed(1));

    // Calculate dynamic counts
    const addedUnits = Math.floor(2 + Math.random() * 4);
    const defectProb = Math.random() < 0.02 ? 1 : 0; // 2% defect rate

    // Health calculation based on thresholds
    let healthPenalty = 0;
    const tempThreshold = mac.type === "injection_mold" ? 220.0 : 80.0;
    if (temp > tempThreshold) healthPenalty += (temp - tempThreshold) * 1.5;
    if (vibration > 8) healthPenalty += (vibration - 8) * 8;
    if (power > 16) healthPenalty += 5;
    const finalHealth = Math.max(30, Math.min(100, Math.round(100 - healthPenalty)));

    // Handle Predictive Alerts trigger
    const triggerAlert = (metric: string, val: number, thresh: number, recommendation: string, severity: 'critical' | 'warning' = 'warning') => {
      // Check if alert already active for this machine/metric to avoid flood
      const existing = alerts.find(a => a.machineId === mac.id && a.metric === metric && !a.acknowledged);
      if (!existing) {
        const newAlert: Alert = {
          id: "alt_" + Math.random().toString(36).substring(2, 9),
          machineId: mac.id,
          machineName: mac.name,
          metric,
          value: val,
          threshold: thresh,
          severity,
          timestamp: nowStr,
          recommendation,
          acknowledged: false
        };
        alerts.unshift(newAlert);

        // Keep alert log under 40 entries
        if (alerts.length > 40) alerts.pop();

        notifications.unshift({
          id: "not_" + Math.random().toString(36).substring(2, 9),
          message: `${mac.name} triggered ${metric} alert: ${val} (Threshold: ${thresh})`,
          type: "alert",
          timestamp: nowStr,
          read: false
        });
      }
    };

    // Evaluate sensor warnings
    if (temp > tempThreshold) {
      triggerAlert(
        "Temperature", 
        temp, 
        tempThreshold, 
        "Machine operating temperature exceeds safety envelope. Verify heat exchanger/coolant lines or scale down feed rate.",
        temp > (tempThreshold + 15.0) ? "critical" : "warning"
      );
    }
    if (vibration > 8.0) {
      triggerAlert(
        "Vibration", 
        vibration, 
        8.0, 
        "Critical resonant vibration detected in chassis. Inspect spindle balance, loose anchor bolts, or roller-bearing friction.",
        vibration > 10.0 ? "critical" : "warning"
      );
    }
    if (mac.type === "injection_mold" && pressure > 152.0) {
      triggerAlert(
        "Pressure", 
        pressure, 
        152.0, 
        "Hydraulic molding pressure approaching safety bypass limit. Inspect pressure relief valve and check mold clamp sensor calibration.",
        "warning"
      );
    }

    // Increment logs dynamically
    const dayIndex = productionLogs.length - 1;
    if (productionLogs[dayIndex]) {
      productionLogs[dayIndex].units += addedUnits;
      productionLogs[dayIndex].defects += defectProb;
      productionLogs[dayIndex].energyKwh += parseFloat((power * 0.05).toFixed(2));
    }

    return {
      ...mac,
      metrics: { temp, vibration, rpm, power, pressure, humidity },
      healthScore: finalHealth,
      productionCount: mac.productionCount + addedUnits,
      defectCount: mac.defectCount + defectProb,
      runtimeHours: parseFloat((mac.runtimeHours + 5 / 3600).toFixed(4)) // 5 sec runtime added
    };
  });
}, 5000);

// API Routes

// Authentication
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  
  if (userPasswords[username] !== password) {
    return res.status(401).json({ error: "Invalid password for this account." });
  }
  
  res.json({ token: username, user });
});

app.get("/api/public-profiles", (req: Request, res: Response) => {
  const list = users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    pin: userPasswords[u.username] || ""
  }));
  res.json(list);
});

app.delete("/api/public-profiles/:username", (req: Request, res: Response) => {
  const { username } = req.params;
  const normalizedUsername = username.trim().toLowerCase();
  
  if (normalizedUsername === "ruchita" || normalizedUsername === "nehapal") {
    return res.status(400).json({ error: "The lead profiles ('ruchita' and 'nehapal') cannot be deleted." });
  }

  const userToDelete = users.find(u => u.username.toLowerCase() === normalizedUsername);
  if (!userToDelete) {
    return res.status(404).json({ error: "Profile not found." });
  }

  users = users.filter(u => u.username.toLowerCase() !== normalizedUsername);
  delete userPasswords[userToDelete.username];
  saveUsersToDisk();

  res.json({ success: true, message: "Profile deleted successfully." });
});

app.post("/api/auth/register", (req: Request, res: Response) => {
  const { username, name, password, role, email, avatar } = req.body;
  
  if (!username || !name || !password || !role) {
    return res.status(400).json({ error: "Username, Full Name, Password/PIN, and Role are required." });
  }

  const normalizedUsername = username.trim().toLowerCase();
  if (users.some(u => u.username.toLowerCase() === normalizedUsername)) {
    return res.status(400).json({ error: "A user with this username already exists." });
  }

  const newUser: User = {
    id: `usr_${Math.random().toString(36).substring(2, 9)}`,
    username: normalizedUsername,
    role: role === "admin" ? "admin" : "supervisor",
    name: name.trim(),
    email: email ? email.trim() : `${normalizedUsername}@factory-dash.com`,
    avatar: ""
  };

  users.push(newUser);
  userPasswords[normalizedUsername] = password;
  saveUsersToDisk();

  // Add system notification for user creation
  notifications.unshift({
    id: `not_${Math.random().toString(36).substring(2, 9)}`,
    message: `New account registered: ${newUser.name} (${newUser.role}) from sign-up screen`,
    type: "info",
    timestamp: new Date().toISOString(),
    read: false
  });

  res.status(201).json({ success: true, user: newUser });
});

app.get("/api/auth/me", authenticateUser, (req: Request, res: Response) => {
  res.json((req as any).user);
});

// Machines
app.get("/api/machines", authenticateUser, (req: Request, res: Response) => {
  res.json(machines);
});

app.post("/api/machines", authenticateUser, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  if (user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized. Admin role required." });
  }

  const { name, type, department, description } = req.body;
  if (!name || !type || !department) {
    return res.status(400).json({ error: "Name, type, and department are required." });
  }

  // Set default metrics based on machine type
  let initialMetrics: SensorMetrics = { temp: 22.0, vibration: 0.0, rpm: 0, power: 0.0, pressure: 0.0, humidity: 45.0 };
  if (type === "cnc_milling") initialMetrics.rpm = 8000;
  if (type === "conveyor") initialMetrics.rpm = 1000;

  // Derive a simple plain description if none provided
  let easyDesc = description;
  if (!easyDesc) {
    if (type === "conveyor") easyDesc = "Transports raw materials and finished parts smoothly across the assembly line.";
    else if (type === "cnc_milling") easyDesc = "Shapes, trims, and cuts raw metal sheets into specific product sizes.";
    else if (type === "injection_mold") easyDesc = "Melts plastic raw material and presses it into custom structural shells.";
    else if (type === "assembly_robot") easyDesc = "Intelligent robotic arm that automatically pieces together individual components.";
    else easyDesc = "Specialized industrial factory equipment assisting with fabrication and packaging.";
  }

  const newMachine: Machine = {
    id: "mac_" + Math.random().toString(36).substring(2, 9),
    name,
    status: "stopped",
    type: type as MachineType,
    department,
    metrics: initialMetrics,
    healthScore: 100,
    lastMaintenance: new Date().toISOString().split('T')[0],
    runtimeHours: 0,
    productionCount: 0,
    defectCount: 0,
    description: easyDesc
  };

  machines.push(newMachine);
  notifications.unshift({
    id: "not_" + Math.random().toString(36).substring(2, 9),
    message: `New machine added: ${name} in ${department} department.`,
    type: "success",
    timestamp: new Date().toISOString(),
    read: false
  });

  res.status(201).json(newMachine);
});

app.put("/api/machines/:id", authenticateUser, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  if (user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized. Admin role required." });
  }

  const { id } = req.params;
  const { name, status, department, lastMaintenance, description } = req.body;

  const index = machines.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Machine not found" });
  }

  machines[index] = {
    ...machines[index],
    name: name || machines[index].name,
    status: (status || machines[index].status) as MachineStatus,
    department: department || machines[index].department,
    lastMaintenance: lastMaintenance || machines[index].lastMaintenance,
    description: description !== undefined ? description : machines[index].description
  };

  res.json(machines[index]);
});

app.delete("/api/machines/:id", authenticateUser, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  if (user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized. Admin role required." });
  }

  const { id } = req.params;
  const index = machines.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Machine not found" });
  }

  const deletedMachine = machines[index];
  machines.splice(index, 1);

  notifications.unshift({
    id: "not_" + Math.random().toString(36).substring(2, 9),
    message: `Machine removed: ${deletedMachine.name}`,
    type: "info",
    timestamp: new Date().toISOString(),
    read: false
  });

  res.json({ success: true, message: `Machine ${id} deleted successfully.` });
});

// Alerts
app.get("/api/alerts", authenticateUser, (req: Request, res: Response) => {
  res.json(alerts);
});

app.post("/api/alerts/acknowledge", authenticateUser, (req: Request, res: Response) => {
  const { id } = req.body;
  const alertIndex = alerts.findIndex(a => a.id === id);
  if (alertIndex !== -1) {
    alerts[alertIndex].acknowledged = true;
    res.json(alerts[alertIndex]);
  } else {
    res.status(404).json({ error: "Alert not found" });
  }
});

app.post("/api/alerts/clear-all", authenticateUser, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  if (user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can wipe alerts history" });
  }
  alerts = [];
  res.json({ success: true });
});

// Notifications
app.get("/api/notifications", authenticateUser, (req: Request, res: Response) => {
  res.json(notifications);
});

app.post("/api/notifications/read-all", authenticateUser, (req: Request, res: Response) => {
  notifications = notifications.map(n => ({ ...n, read: true }));
  res.json({ success: true });
});

// Users Management
app.get("/api/users", authenticateUser, (req: Request, res: Response) => {
  const caller: User = (req as any).user;
  const list = users.map(u => ({
    ...u,
    password: caller.role === "admin" ? (userPasswords[u.username] || "") : undefined
  }));
  res.json(list);
});

app.post("/api/users", authenticateUser, (req: Request, res: Response) => {
  const caller: User = (req as any).user;
  if (caller.role !== "admin") {
    return res.status(403).json({ error: "Only admins can manage profiles." });
  }

  const { username, name, role, email, password, avatar } = req.body;
  if (!username || !name || !role || !password) {
    return res.status(400).json({ error: "Username, Name, Role, and Password are required." });
  }

  const normalizedUsername = username.trim().toLowerCase();
  if (users.some(u => u.username.toLowerCase() === normalizedUsername)) {
    return res.status(400).json({ error: "A user with this username already exists." });
  }

  const newUser: User = {
    id: `usr_${Math.random().toString(36).substring(2, 9)}`,
    username: normalizedUsername,
    role: role === "admin" ? "admin" : "supervisor",
    name: name.trim(),
    email: email ? email.trim() : `${normalizedUsername}@factory-dash.com`,
    avatar: ""
  };

  users.push(newUser);
  userPasswords[normalizedUsername] = password;
  saveUsersToDisk();

  // Add system notification for user creation
  notifications.unshift({
    id: `not_${Math.random().toString(36).substring(2, 9)}`,
    message: `New profile created: ${newUser.name} (${newUser.role}) by ${caller.name}`,
    type: "info",
    timestamp: new Date().toISOString(),
    read: false
  });

  res.status(201).json(newUser);
});

app.put("/api/users/:id", authenticateUser, (req: Request, res: Response) => {
  const caller: User = (req as any).user;
  if (caller.role !== "admin") {
    return res.status(403).json({ error: "Only admins can manage profiles." });
  }

  const { id } = req.params;
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "Profile not found." });
  }

  const existingUser = users[userIndex];
  const { name, role, email, password, avatar } = req.body;

  if (name) existingUser.name = name.trim();
  if (role) existingUser.role = role === "admin" ? "admin" : "supervisor";
  if (email) existingUser.email = email.trim();
  if (avatar) existingUser.avatar = avatar;
  if (password) {
    userPasswords[existingUser.username] = password;
  }
  saveUsersToDisk();

  res.json(existingUser);
});

app.delete("/api/users/:id", authenticateUser, (req: Request, res: Response) => {
  const caller: User = (req as any).user;
  if (caller.role !== "admin") {
    return res.status(403).json({ error: "Only admins can delete profiles." });
  }

  const { id } = req.params;
  const userToDelete = users.find(u => u.id === id);
  if (!userToDelete) {
    return res.status(404).json({ error: "Profile not found." });
  }

  if (userToDelete.id === caller.id) {
    return res.status(400).json({ error: "You cannot delete your own active profile." });
  }

  if (userToDelete.username === "admin") {
    return res.status(400).json({ error: "The default master 'admin' profile cannot be deleted." });
  }

  users = users.filter(u => u.id !== id);
  delete userPasswords[userToDelete.username];
  saveUsersToDisk();

  // Add notification
  notifications.unshift({
    id: `not_${Math.random().toString(36).substring(2, 9)}`,
    message: `Profile deleted: ${userToDelete.name} (${userToDelete.role}) by ${caller.name}`,
    type: "info",
    timestamp: new Date().toISOString(),
    read: false
  });

  res.json({ success: true, message: "Profile deleted successfully." });
});

// Production Analytics
app.get("/api/analytics", authenticateUser, (req: Request, res: Response) => {
  const filter = (req.query.filter as string) || "weekly";
  let logsSlice = [...productionLogs];

  if (filter === "today") {
    // Generate simulated hour-by-hour analytics for today (last 12 hours)
    const hourLogs = Array.from({ length: 12 }).map((_, i) => {
      const hour = `${8 + i}:00`;
      const units = Math.floor(180 + Math.random() * 80);
      const defects = Math.floor(units * (0.01 + Math.random() * 0.012));
      const energyKwh = Math.floor(units * 0.18);
      const downtimeMinutes = Math.random() < 0.25 ? Math.floor(Math.random() * 15) : 0;
      return { hour, units, defects, energyKwh, downtimeMinutes };
    });
    return res.json({ type: "today", data: hourLogs });
  }

  if (filter === "weekly") {
    logsSlice = productionLogs.slice(-7);
  } else if (filter === "monthly") {
    logsSlice = productionLogs.slice(-30);
  } else if (filter === "yearly") {
    // Aggregate by months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const aggregated = monthNames.map((m, idx) => {
      const scale = idx === 5 ? 1.0 : 0.85 + Math.random() * 0.15; // June peak
      const units = Math.floor(62000 * scale);
      const defects = Math.floor(units * 0.015);
      const energyKwh = Math.floor(units * 0.17);
      const downtimeMinutes = Math.floor(1200 * scale);
      return { month: m, units, defects, energyKwh, downtimeMinutes };
    });
    return res.json({ type: "yearly", data: aggregated });
  }

  res.json({ type: "daily", data: logsSlice });
});

// Gemini-Powered AI Predictive Maintenance Analysis
app.post("/api/machines/:id/predict-ai", authenticateUser, async (req: Request, res: Response) => {
  const { id } = req.params;
  const machine = machines.find(m => m.id === id);
  if (!machine) {
    return res.status(404).json({ error: "Machine not found" });
  }

  // Create prompt listing current metrics & historical warnings
  const currentTemp = machine.metrics.temp;
  const currentVib = machine.metrics.vibration;
  const currentRpm = machine.metrics.rpm;
  const currentPower = machine.metrics.power;
  const currentPressure = machine.metrics.pressure;
  const currentHealth = machine.healthScore;
  const lastMaint = machine.lastMaintenance;
  const runtime = machine.runtimeHours.toFixed(1);

  const prompt = `Analyze this Industry 4.0 production machine telemetry for predictive maintenance:
Machine Name: ${machine.name}
Type: ${machine.type}
Department: ${machine.department}
Current Health Score: ${currentHealth}%
Accumulated Runtime: ${runtime} hours
Last Maintenance Date: ${lastMaint}
Current Metrics:
- Temperature: ${currentTemp}°C
- Vibration Level: ${currentVib} mm/s
- Spindle RPM: ${currentRpm} RPM
- Draw Power: ${currentPower} kW
- Operating Hydraulic/Pneumatic Pressure: ${currentPressure} bar

Identify if any sensor signature indicates early mechanical fatigue, roller bearing degradation, hydraulic seals leakage, or insulation wear.
Based on the metrics, output your prediction as a JSON object of exactly this TypeScript shape, with no other wrapping text:
{
  "riskScore": number, // 0 to 100
  "estimatedFailureTime": "string descriptive estimation e.g., '14 days' or '230 operating hours' or 'No immediate risk'",
  "maintenanceSuggestions": ["string recommendation 1", "string recommendation 2"],
  "explanation": "concise, highly technical engineer summary (2 sentences)"
}`;

  if (isGeminiEnabled && ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        }
      });

      const responseText = response.text || "";
      console.log("Gemini AI Twin Response:", responseText);
      const parsed: AIAnalysis = JSON.parse(responseText);
      return res.json(parsed);
    } catch (err) {
      console.error("Gemini API call failed, using heuristic model:", err);
    }
  }

  // Polished high-fidelity heuristic fallback if API key is not configured or fails
  // This calculates highly realistic parameters based on machine status, metrics and type
  let riskScore = 100 - currentHealth;
  let estimatedFailureTime = "No immediate risk";
  const maintenanceSuggestions: string[] = [];
  let explanation = "";

  if (currentHealth < 80 || currentTemp > 75 || currentVib > 6.0) {
    riskScore = Math.max(35, Math.min(95, riskScore + 15));
    estimatedFailureTime = `${Math.floor(5 + Math.random() * 10)} operating days`;
    
    if (machine.type === "cnc_milling") {
      maintenanceSuggestions.push("Schedule spindle bearing lubrication and examine drive belt tension.");
      maintenanceSuggestions.push("Check coolant flow velocity and measure radiator fin temperatures.");
      explanation = `Slight thermally induced axis expansion detected due to continuous operational stress. Bearings indicate a minor resonant frequency signature at 4.8 kHz requiring localized lubrication.`;
    } else if (machine.type === "injection_mold") {
      maintenanceSuggestions.push("Perform dynamic pressure decay test on high-pressure clamp cylinder.");
      maintenanceSuggestions.push("Inspect heating element coils for resistivity degradation and clean nozzle manifold.");
      explanation = `Pressure transients indicate micro-leakage potential in primary hydraulic bypass rings. High thermal exposure at 195°C is accelerating fluid viscosity decline.`;
    } else {
      maintenanceSuggestions.push("Inspect chassis structural anchors for loose vibration dampening elements.");
      maintenanceSuggestions.push("Recalibrate encoder settings and verify current limits in high-voltage cabinet.");
      explanation = `Anomalous current loading has led to minor chassis vibration resonance. Mechanical joint tightening is advised within the next planned maintenance window.`;
    }
  } else {
    riskScore = Math.max(5, Math.min(25, riskScore));
    estimatedFailureTime = "Excellent state - Over 1000 hours";
    maintenanceSuggestions.push("Perform standard weekly optical sensor dusting and visual inspection.");
    maintenanceSuggestions.push("Maintain current torque cycles and review quarterly lubrication logs.");
    explanation = `Acoustic emission and thermo-fluid sensors confirm all mechanical parameters are operating within pristine standard margins. Heat dissipation profiles are balanced perfectly.`;
  }

  const result: AIAnalysis = {
    riskScore,
    estimatedFailureTime,
    maintenanceSuggestions,
    explanation
  };

  setTimeout(() => {
    res.json(result);
  }, 500); // Simulate network latency
});

// Voice Command parsing endpoint
app.post("/api/voice-command", authenticateUser, async (req: Request, res: Response) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: "No voice command text supplied" });
  }

  const prompt = `You are the SCADA Voice Assistant for Siemens Smart Factory 4.0 Digital Twin.
The operator says: "${command}"

We have the following screens and machines in the app:
Screens:
- "dashboard" (main dashboard metrics/OEE)
- "factory_floor" (the interactive digital twin floor map)
- "analytics" (charts, graphs, production, energy metrics)
- "alerts" (predictive alarms and log panel)
- "reports" (daily/weekly report panel with printable outputs)

Machines available (by ID):
- "mac_1": Conveyor Belt
- "mac_2": Metal Cutter
- "mac_3": Plastic Molder
- "mac_4": Assembly Robot
- "mac_5": Label Engraver
- "mac_6": Box Packager

Determine what visual action the app should perform in response to the user's intent.
Available visual actions are:
- "navigate" (to a screen above)
- "focus_machine" (open the details side panel for a specific machine ID)
- "alert_action" (acknowledge alert or trigger maintenance window)
- "none" (unrecognized command)

Output your response as a JSON object of exactly this TypeScript shape, with no other wrapping text:
{
  "action": "navigate" | "focus_machine" | "alert_action" | "none",
  "target": "string name of screen OR machineId or alertId",
  "speechResponse": "string highly professional voice response speaking back to the factory engineer (15 words max, using Siemens industrial vocabulary)"
}`;

  if (isGeminiEnabled && ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });
      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err) {
      console.error("Gemini voice assistant parse failed, using heuristic:", err);
    }
  }

  // Advanced heuristic parsing if Gemini is off
  const lower = command.toLowerCase();
  let action: 'navigate' | 'focus_machine' | 'alert_action' | 'none' = "none";
  let target = "";
  let speechResponse = "Request received. Command could not be parsed to an automated action.";

  if (lower.includes("floor") || lower.includes("layout") || lower.includes("map") || lower.includes("twin")) {
    action = "navigate";
    target = "factory_floor";
    speechResponse = "Navigating to the 4.0 Interactive Digital Twin factory floor layout.";
  } else if (lower.includes("chart") || lower.includes("analytic") || lower.includes("graph") || lower.includes("trend") || lower.includes("energy")) {
    action = "navigate";
    target = "analytics";
    speechResponse = "Opening manufacturing analytics and telemetry energy trend dashboard.";
  } else if (lower.includes("alert") || lower.includes("alarm") || lower.includes("notification") || lower.includes("warning")) {
    action = "navigate";
    target = "alerts";
    speechResponse = "Displaying active system warnings and predictive maintenance alerts.";
  } else if (lower.includes("report") || lower.includes("export") || lower.includes("pdf")) {
    action = "navigate";
    target = "reports";
    speechResponse = "Opening the automated production compliance report generator.";
  } else if (lower.includes("dashboard") || lower.includes("home") || lower.includes("main") || lower.includes("overview")) {
    action = "navigate";
    target = "dashboard";
    speechResponse = "Returning to the master command control panel overview.";
  } else if (lower.includes("cut") || lower.includes("metal") || lower.includes("mac 2") || lower.includes("machine 2")) {
    action = "focus_machine";
    target = "mac_2";
    speechResponse = "Showing telemetry details for the Metal Cutter.";
  } else if (lower.includes("conveyor") || lower.includes("belt") || lower.includes("mac 1") || lower.includes("machine 1")) {
    action = "focus_machine";
    target = "mac_1";
    speechResponse = "Showing telemetry details for the Conveyor Belt.";
  } else if (lower.includes("mold") || lower.includes("press") || lower.includes("plastic") || lower.includes("mac 3") || lower.includes("machine 3")) {
    action = "focus_machine";
    target = "mac_3";
    speechResponse = "Showing telemetry details for the Plastic Molder.";
  } else if (lower.includes("robot") || lower.includes("assembly") || lower.includes("mac 4") || lower.includes("machine 4")) {
    action = "focus_machine";
    target = "mac_4";
    speechResponse = "Showing telemetry details for the Assembly Robot.";
  } else if (lower.includes("engraver") || lower.includes("label") || lower.includes("laser") || lower.includes("mac 5") || lower.includes("machine 5")) {
    action = "focus_machine";
    target = "mac_5";
    speechResponse = "Showing telemetry details for the Label Engraver.";
  } else if (lower.includes("packaging") || lower.includes("box") || lower.includes("station") || lower.includes("mac 6") || lower.includes("machine 6")) {
    action = "focus_machine";
    target = "mac_6";
    speechResponse = "Showing telemetry details for the Box Packager.";
  } else {
    speechResponse = `Voice assistant ready. Please ask to go to a screen or inspect a machine.`;
  }

  res.json({ action, target, speechResponse });
});

// Reports Export CSV Endpoint
app.get("/api/reports/export", authenticateUser, (req: Request, res: Response) => {
  const type = (req.query.type as string) || "production";
  
  // Format standard output based on query
  if (type === "production") {
    let csv = "Date,Total Units Produced,Defects Logged,Defect Rate %,Target Units,Yield Rate %\n";
    productionLogs.forEach(log => {
      const defRate = ((log.defects / log.units) * 100).toFixed(2);
      const yieldRate = (((log.units - log.defects) / log.units) * 100).toFixed(2);
      csv += `${log.date},${log.units},${log.defects},${defRate}%,${log.target},${yieldRate}%\n`;
    });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=production_report.csv");
    return res.status(200).send(csv);
  }

  if (type === "energy") {
    let csv = "Date,Units Produced,Energy Consumed (kWh),Energy Efficiency Score (units/kWh)\n";
    productionLogs.forEach(log => {
      const score = (log.units / log.energyKwh).toFixed(2);
      csv += `${log.date},${log.units},${log.energyKwh},${score}\n`;
    });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=energy_report.csv");
    return res.status(200).send(csv);
  }

  if (type === "maintenance") {
    let csv = "Machine Name,Department,Current Status,Health Score,Runtime Hours,Last Maintenance Date\n";
    machines.forEach(mac => {
      csv += `"${mac.name}","${mac.department}","${mac.status}",${mac.healthScore}%,${mac.runtimeHours.toFixed(1)},${mac.lastMaintenance}\n`;
    });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=maintenance_compliance_report.csv");
    return res.status(200).send(csv);
  }

  res.status(400).json({ error: "Invalid report type requested." });
});


// Vite Dev Server Middleware or Production Static Service Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static production assets from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Factory Digital Twin Server running on port ${PORT}`);
  });
}

startServer();
