import React, { useState, useEffect } from "react";
import { 
  LineChart, 
  BarChart2, 
  Flame, 
  Zap, 
  Hourglass, 
  CheckCircle2, 
  CalendarRange 
} from "lucide-react";
import { User } from "../types";

interface AnalyticsPanelProps {
  authToken: string;
}

interface AnalyticsDataPoint {
  date?: string;
  hour?: string;
  month?: string;
  units: number;
  defects: number;
  energyKwh: number;
  downtimeMinutes: number;
}

export default function AnalyticsPanel({ authToken }: AnalyticsPanelProps) {
  const [filter, setFilter] = useState<"today" | "weekly" | "monthly" | "yearly">("weekly");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics?filter=${filter}`, {
          headers: {
            "Authorization": `Bearer ${authToken}`
          }
        });
        if (response.ok) {
          const resJson = await response.json();
          setAnalyticsData(resJson.data);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [filter, authToken]);

  // Helper calculation for custom SVG charting paths
  const getChartCoordinates = (data: AnalyticsDataPoint[], valKey: keyof AnalyticsDataPoint, height: number, width: number, padding: number) => {
    if (data.length === 0) return { path: "", points: [], areaPath: "" };
    
    const values = data.map(d => Number(d[valKey] || 0));
    const maxVal = Math.max(...values, 1) * 1.1;
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal;

    const points = data.map((d, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const val = Number(d[valKey] || 0);
      const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
      return { x, y, value: val, label: d.date || d.hour || d.month || "" };
    });

    const path = points.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, "");

    const areaPath = `${path} L ${points[points.length - 1]?.x} ${height - padding} L ${points[0]?.x} ${height - padding} Z`;

    return { path, points, areaPath };
  };

  const svgWidth = 500;
  const svgHeight = 220;
  const padding = 30;

  const prodChart = getChartCoordinates(analyticsData, "units", svgHeight, svgWidth, padding);
  const energyChart = getChartCoordinates(analyticsData, "energyKwh", svgHeight, svgWidth, padding);
  const downtimeChart = getChartCoordinates(analyticsData, "downtimeMinutes", svgHeight, svgWidth, padding);

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <CalendarRange className="h-5 w-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-black dark:text-white uppercase tracking-wide">
              Production & Telemetry Analytics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Charts showing daily unit output, power draw, and downtime
            </p>
          </div>
        </div>

        {/* Dynamic Buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-md border border-slate-200 dark:border-slate-700">
          {(["today", "weekly", "monthly", "yearly"] as const).map((opt) => (
            <button
              key={opt}
              id={`btn-analytics-filter-${opt}`}
              onClick={() => setFilter(opt)}
              className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-all ${
                filter === opt
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg h-64 animate-pulse space-y-4">
              <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-40 bg-slate-100 dark:bg-slate-700 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Production Trend */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm flex flex-col justify-between h-76">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-black dark:text-white">Units Produced</h3>
              </div>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Daily output
              </span>
            </div>

            <div className="flex-1 relative min-h-44">
              {analyticsData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">No data available.</div>
              ) : (
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                  {[0, 1, 2, 3].map((g) => {
                    const lineY = padding + (g / 3) * (svgHeight - padding * 2);
                    return (
                      <line
                        key={g}
                        x1={padding}
                        y1={lineY}
                        x2={svgWidth - padding}
                        y2={lineY}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                      />
                    );
                  })}

                  <defs>
                    <linearGradient id="area-grad-prod" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <path d={prodChart.areaPath} fill="url(#area-grad-prod)" />
                  <path
                    d={prodChart.path}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {hoverIndex !== null && prodChart.points[hoverIndex] && (
                    <g>
                      <line
                        x1={prodChart.points[hoverIndex].x}
                        y1={padding}
                        x2={prodChart.points[hoverIndex].x}
                        y2={svgHeight - padding}
                        stroke="#2563eb"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <circle
                        cx={prodChart.points[hoverIndex].x}
                        cy={prodChart.points[hoverIndex].y}
                        r="5"
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    </g>
                  )}

                  {prodChart.points.map((p, idx) => {
                    const barWidth = (svgWidth - padding * 2) / prodChart.points.length;
                    return (
                      <rect
                        key={idx}
                        x={p.x - barWidth / 2}
                        y={padding}
                        width={barWidth}
                        height={svgHeight - padding * 2}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoverIndex(idx)}
                        onMouseLeave={() => setHoverIndex(null)}
                      />
                    );
                  })}

                  <text x={padding} y={svgHeight - 10} fill="#64748b" fontSize="10" textAnchor="start">
                    {prodChart.points[0]?.label}
                  </text>
                  <text x={svgWidth - padding} y={svgHeight - 10} fill="#64748b" fontSize="10" textAnchor="end">
                    {prodChart.points[prodChart.points.length - 1]?.label}
                  </text>
                </svg>
              )}

              {hoverIndex !== null && analyticsData[hoverIndex] && (
                <div className="absolute top-1 right-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs shadow-md">
                  <div>Date: <span className="font-semibold">{analyticsData[hoverIndex].date || analyticsData[hoverIndex].hour || analyticsData[hoverIndex].month}</span></div>
                  <div>Units: <span className="text-emerald-600 font-bold">{analyticsData[hoverIndex].units}</span></div>
                  <div>Defects: <span className="text-red-600 font-medium">{analyticsData[hoverIndex].defects}</span></div>
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Energy Consumption */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm flex flex-col justify-between h-76">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-black dark:text-white">Energy Draw (kWh)</h3>
              </div>
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Electricity usage
              </span>
            </div>

            <div className="flex-1 relative min-h-44">
              {analyticsData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">No data available.</div>
              ) : (
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                  {[0, 1, 2, 3].map((g) => {
                    const lineY = padding + (g / 3) * (svgHeight - padding * 2);
                    return (
                      <line
                        key={g}
                        x1={padding}
                        y1={lineY}
                        x2={svgWidth - padding}
                        y2={lineY}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                      />
                    );
                  })}

                  <defs>
                    <linearGradient id="area-grad-energy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <path d={energyChart.areaPath} fill="url(#area-grad-energy)" />
                  <path
                    d={energyChart.path}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {hoverIndex !== null && energyChart.points[hoverIndex] && (
                    <g>
                      <line
                        x1={energyChart.points[hoverIndex].x}
                        y1={padding}
                        x2={energyChart.points[hoverIndex].x}
                        y2={svgHeight - padding}
                        stroke="#2563eb"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <circle
                        cx={energyChart.points[hoverIndex].x}
                        cy={energyChart.points[hoverIndex].y}
                        r="5"
                        fill="#f59e0b"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    </g>
                  )}

                  {energyChart.points.map((p, idx) => {
                    const barWidth = (svgWidth - padding * 2) / energyChart.points.length;
                    return (
                      <rect
                        key={idx}
                        x={p.x - barWidth / 2}
                        y={padding}
                        width={barWidth}
                        height={svgHeight - padding * 2}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoverIndex(idx)}
                        onMouseLeave={() => setHoverIndex(null)}
                      />
                    );
                  })}

                  <text x={padding} y={svgHeight - 10} fill="#64748b" fontSize="10" textAnchor="start">
                    {energyChart.points[0]?.label}
                  </text>
                  <text x={svgWidth - padding} y={svgHeight - 10} fill="#64748b" fontSize="10" textAnchor="end">
                    {energyChart.points[energyChart.points.length - 1]?.label}
                  </text>
                </svg>
              )}

              {hoverIndex !== null && analyticsData[hoverIndex] && (
                <div className="absolute top-1 right-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs shadow-md">
                  <div>Date: <span className="font-semibold">{analyticsData[hoverIndex].date || analyticsData[hoverIndex].hour || analyticsData[hoverIndex].month}</span></div>
                  <div>Power: <span className="text-amber-600 font-bold">{analyticsData[hoverIndex].energyKwh.toFixed(1)} kWh</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
