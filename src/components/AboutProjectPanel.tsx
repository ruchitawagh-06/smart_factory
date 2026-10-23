import React from "react";
import { 
  GraduationCap, 
  Code, 
  Layers, 
  CheckCircle2, 
  BookOpen, 
  Cpu, 
  Server, 
  ShieldCheck, 
  FileText,
  UserCheck
} from "lucide-react";

export default function AboutProjectPanel() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                College Academic Project
              </span>
              <h2 className="text-xl font-bold text-black dark:text-white mt-0.5">
                Smart Factory Machine Monitoring & SCADA System
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                BCA (Bachelor of Computer Applications) - 5th Semester Major Web Development Project
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded text-xs font-semibold self-start sm:self-auto">
            Status: Completed & Verified
          </div>
        </div>

        {/* Student Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md">
            <span className="text-[11px] text-slate-500 block font-medium">Student Developers</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Ruchita Wagh &amp; Neha Pal</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md">
            <span className="text-[11px] text-slate-500 block font-medium">Course &amp; Semester</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">BCA - 5th Semester</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md">
            <span className="text-[11px] text-slate-500 block font-medium">Project Domain</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Web Development &amp; SCADA</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md">
            <span className="text-[11px] text-slate-500 block font-medium">Academic Year</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">2025 - 2026</span>
          </div>
        </div>

        {/* Student Contributor Profile Badges (Clean badges, No Photos) */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block mb-3">
            Project Development Team
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                RW
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">Ruchita Wagh</span>
                <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">Student Developer • BCA 5th Sem</span>
              </div>
            </div>

            <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                NP
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">Neha Pal</span>
                <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Student Developer • BCA 5th Sem</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Project Objectives & Tech Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Objectives */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wide">
              Project Objectives
            </h3>
          </div>

          <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Machine Telemetry:</strong> Monitor real-time factory machinery metrics including temperature, pressure, vibration, and RPM.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Machine Controls:</strong> Allow authorized operators to start, stop, and assign machines to maintenance windows.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Zone Organization:</strong> Segment equipment into departments (Machining, Molding, Assembly, Packaging).</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Role-Based Access:</strong> Provide separate Admin and Student/Supervisor accounts with role permissions.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Alerts & Reports:</strong> Automatically log threshold alerts and export compliance reports as CSV documents.</span>
            </li>
          </ul>
        </div>

        {/* Technology Stack */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <Code className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wide">
              Technologies Used
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded">
              <span className="font-bold text-blue-600 dark:text-blue-400 block mb-0.5">Frontend Technologies</span>
              <p className="text-slate-600 dark:text-slate-300">
                HTML5, CSS3, Tailwind CSS, React.js (Hooks, State Management), TypeScript, Lucide Icons.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">Backend & API Server</span>
              <p className="text-slate-600 dark:text-slate-300">
                Node.js runtime environment, Express.js REST API routes for authentication, machines, and telemetry.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Data Storage & Session</span>
              <p className="text-slate-600 dark:text-slate-300">
                In-Memory data structures, LocalStorage token management, and structured JSON REST endpoints.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* College Project Submission Notice */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
        <div>
          <span className="font-bold block">Academic Declaration</span>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
            This project has been developed as an authentic web development practical implementation for the 5th Semester BCA examination.
          </p>
        </div>
        <div className="shrink-0 text-right font-mono text-[11px] text-slate-500">
          Guide: Prof. Internal Faculty
        </div>
      </div>
    </div>
  );
}
