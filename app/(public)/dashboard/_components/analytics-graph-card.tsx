"use client";

import { useState, useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, ArrowUpRight, Calendar } from "lucide-react";
import Link from "next/link";

interface MonthlyPointRecord {
  month: string;
  total: number;
  attendance: number;
  tasks: number;
  quizzes: number;
  events: number;
}

interface AnalyticsGraphCardProps {
  stats: {
    totalPoints: number;
    attendancePoints: number;
    taskPoints: number;
    quizPoints: number;
    eventPoints?: number;
    pendingTasks: number;
    activeQuizzes: number;
    monthlyProgress?: MonthlyPointRecord[];
  };
  recentActivities?: Array<{
    id: string;
    type: "task" | "event" | "quiz";
    title: string;
    description: string;
    date: Date | string;
    status?: string;
    points?: number;
  }>;
}

type TabType = "ALL" | "TASKS" | "QUIZZES" | "ATTENDANCE";

export function AnalyticsGraphCard({ stats }: AnalyticsGraphCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const monthsData = useMemo(() => {
    if (stats.monthlyProgress && stats.monthlyProgress.length > 0) {
      return stats.monthlyProgress;
    }
    const now = new Date();
    const fallback: MonthlyPointRecord[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      fallback.push({
        month: d.toLocaleString("default", { month: "short" }),
        total: 0,
        attendance: 0,
        tasks: 0,
        quizzes: 0,
        events: 0,
      });
    }
    return fallback;
  }, [stats.monthlyProgress]);

  // Compute category points and series
  const tabData = useMemo(() => {
    let rawPoints: number[] = [];
    let color = "#22c55e"; // Vivid Emerald
    let glowColor = "rgba(34, 197, 94, 0.4)";
    let gradientId = "allGrad";
    let categoryPoints = stats.totalPoints;
    let subtitle = "Overall monthly learning trajectory";

    switch (activeTab) {
      case "TASKS":
        rawPoints = monthsData.map((m) => m.tasks);
        color = "#10b981";
        glowColor = "rgba(16, 185, 129, 0.4)";
        gradientId = "taskGrad";
        categoryPoints = stats.taskPoints;
        subtitle = `${stats.pendingTasks} pending tasks remaining`;
        break;
      case "QUIZZES":
        rawPoints = monthsData.map((m) => m.quizzes);
        color = "#3b82f6";
        glowColor = "rgba(59, 130, 246, 0.4)";
        gradientId = "quizGrad";
        categoryPoints = stats.quizPoints;
        subtitle = `${stats.activeQuizzes} quizzes available`;
        break;
      case "ATTENDANCE":
        rawPoints = monthsData.map((m) => m.attendance);
        color = "#f59e0b";
        glowColor = "rgba(245, 158, 11, 0.4)";
        gradientId = "attGrad";
        categoryPoints = stats.attendancePoints;
        subtitle = "Verified QR presence logs";
        break;
      case "ALL":
      default:
        rawPoints = monthsData.map((m) => m.total);
        color = "#22c55e";
        glowColor = "rgba(34, 197, 94, 0.4)";
        gradientId = "allGrad";
        categoryPoints = stats.totalPoints;
        subtitle = "Combined monthly performance score";
        break;
    }

    const currentMonthVal = rawPoints[rawPoints.length - 1] || 0;
    const prevMonthVal = rawPoints[rawPoints.length - 2] || 0;
    const diff = currentMonthVal - prevMonthVal;
    const growthPercent =
      prevMonthVal > 0
        ? `${diff >= 0 ? "+" : ""}${Math.round((diff / prevMonthVal) * 100)}%`
        : currentMonthVal > 0
        ? `+100%`
        : "0%";

    return {
      points: categoryPoints,
      growth: growthPercent,
      subtitle,
      color,
      glowColor,
      gradientId,
      monthlyValues: rawPoints,
    };
  }, [activeTab, stats, monthsData]);

  // Precise Monotone Cubic Spline math for ultra-smooth graph curves
  const chartMetrics = useMemo(() => {
    const values = tabData.monthlyValues;
    const width = 440;
    const height = 130;
    const paddingLeft = 36;
    const paddingRight = 20;
    const paddingTop = 24;
    const paddingBottom = 24;

    const maxVal = Math.max(...values, 50);
    const minVal = 0;

    // Y Axis levels
    const yLevels = [
      { label: `${maxVal}`, y: paddingTop },
      { label: `${Math.round(maxVal / 2)}`, y: paddingTop + (height - paddingTop - paddingBottom) / 2 },
      { label: "0", y: height - paddingBottom },
    ];

    // Plot coordinates
    const coords = values.map((val, idx) => {
      const x =
        paddingLeft +
        (idx / (values.length - 1)) * (width - paddingLeft - paddingRight);
      const y =
        height -
        paddingBottom -
        ((val - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom);
      return {
        x,
        y,
        val,
        month: monthsData[idx]?.month || "",
      };
    });

    // Build Monotone Spline Curve (prevents excessive overshoot)
    let linePath = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const midX = (curr.x + next.x) / 2;

      linePath += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
    }

    const last = coords[coords.length - 1];
    const first = coords[0];
    const areaPath = `${linePath} L ${last.x} ${height - paddingBottom} L ${first.x} ${height - paddingBottom} Z`;

    return { coords, linePath, areaPath, lastCoord: last, yLevels, width, height, paddingBottom, paddingLeft };
  }, [tabData, monthsData]);

  // Handle continuous mouse move across SVG canvas for snapping cursor
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const svgX = relativeX * chartMetrics.width;

    // Find closest data point index
    let closestIdx = 0;
    let minDist = Infinity;
    chartMetrics.coords.forEach((c, idx) => {
      const dist = Math.abs(c.x - svgX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    setHoveredIdx(closestIdx);
  };

  const tabs: TabType[] = ["ALL", "TASKS", "QUIZZES", "ATTENDANCE"];
  const currentHover = hoveredIdx !== null ? chartMetrics.coords[hoveredIdx] : null;

  return (
    <Card className="rounded-xl border border-border/80 bg-card text-card-foreground p-5 sm:p-6 shadow-xs relative overflow-hidden">
      {/* ── Top Header & Link ── */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold tracking-tight text-foreground font-mono uppercase">
            Monthly Progress Velocity
          </span>
        </div>

        <Link
          href="/dashboard/leaderboard"
          prefetch={true}
          className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
        >
          <span>Leaderboard</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* ── Segmented Pill Tab Selector ── */}
      <div className="p-1 rounded-xl bg-muted/60 border border-border/60 flex items-center gap-1 mb-5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setHoveredIdx(null);
              }}
              className={`flex-1 py-1.5 px-2 text-[11px] font-mono font-semibold rounded-lg transition-all ${
                isActive
                  ? "bg-background text-foreground shadow-xs border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Metric Display & Growth Indicator ── */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-foreground">
            {currentHover ? currentHover.val.toLocaleString() : tabData.points.toLocaleString()}{" "}
            <span className="text-lg font-normal text-muted-foreground">PTS</span>
          </div>
          <div className="text-xs sm:text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{tabData.growth}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          {currentHover
            ? `Points earned in ${currentHover.month}`
            : tabData.subtitle}
        </p>
      </div>

      {/* ── Inset Graph Container with Refined Spline & Snap Pointer ── */}
      <div className="w-full h-48 rounded-xl bg-muted/30 border border-border/60 p-2 relative overflow-hidden flex flex-col justify-end">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${chartMetrics.width} ${chartMetrics.height}`}
          className="w-full h-full overflow-visible select-none cursor-crosshair"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            {/* Smooth 3-stop Area Gradient */}
            <linearGradient id={tabData.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tabData.color} stopOpacity="0.32" />
              <stop offset="70%" stopColor={tabData.color} stopOpacity="0.08" />
              <stop offset="100%" stopColor={tabData.color} stopOpacity="0.0" />
            </linearGradient>

            {/* Ambient Line Glow Filter */}
            <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Horizontal Grid & Y-Axis Reference Lines ── */}
          {chartMetrics.yLevels.map((lvl, idx) => (
            <g key={idx}>
              <line
                x1={chartMetrics.paddingLeft}
                y1={lvl.y}
                x2={chartMetrics.width - 20}
                y2={lvl.y}
                stroke="currentColor"
                strokeOpacity="0.12"
                strokeDasharray="3 3"
              />
              <text
                x={chartMetrics.paddingLeft - 8}
                y={lvl.y + 3}
                textAnchor="end"
                className="text-[8px] font-mono fill-muted-foreground font-medium"
              >
                {lvl.label}
              </text>
            </g>
          ))}

          {/* ── Area Fill ── */}
          <path
            d={chartMetrics.areaPath}
            fill={`url(#${tabData.gradientId})`}
            className="transition-all duration-300 ease-out"
          />

          {/* ── Soft Ambient Glow Stroke ── */}
          <path
            d={chartMetrics.linePath}
            fill="none"
            stroke={tabData.color}
            strokeWidth="5"
            strokeOpacity="0.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300 ease-out"
          />

          {/* ── Crisp Foreground Spline Path ── */}
          <path
            d={chartMetrics.linePath}
            fill="none"
            stroke={tabData.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300 ease-out"
          />

          {/* ── Data Points & X-Axis Labels ── */}
          {chartMetrics.coords.map((coord, idx) => {
            const isHovered = hoveredIdx === idx;
            const isLast = idx === chartMetrics.coords.length - 1;

            return (
              <g key={idx}>
                {/* Regular resting point */}
                {!isHovered && (
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={isLast ? 3.5 : 2.5}
                    fill={tabData.color}
                    stroke="var(--background, #ffffff)"
                    strokeWidth="1.5"
                    className="transition-all duration-150"
                  />
                )}

                {/* X-Axis Monthly Label */}
                <text
                  x={coord.x}
                  y={chartMetrics.height - 6}
                  textAnchor="middle"
                  className={`text-[9px] font-mono transition-colors ${
                    isHovered
                      ? "fill-foreground font-bold"
                      : isLast
                      ? "fill-foreground font-semibold"
                      : "fill-muted-foreground"
                  }`}
                >
                  {coord.month}
                </text>
              </g>
            );
          })}

          {/* ── High-Precision Interactive Snap Pointer & Floating HUD ── */}
          {currentHover && (
            <g className="transition-all duration-100 ease-out pointer-events-none">
              {/* Vertical Crosshair Line */}
              <line
                x1={currentHover.x}
                y1={14}
                x2={currentHover.x}
                y2={chartMetrics.height - chartMetrics.paddingBottom}
                stroke={tabData.color}
                strokeWidth="1.5"
                strokeDasharray="2 2"
                opacity="0.8"
              />

              {/* Outer Translucent Halo Ring */}
              <circle
                cx={currentHover.x}
                cy={currentHover.y}
                r="8"
                fill={tabData.color}
                fillOpacity="0.25"
              />

              {/* Inner Solid Crisp Dot */}
              <circle
                cx={currentHover.x}
                cy={currentHover.y}
                r="4"
                fill="#ffffff"
                stroke={tabData.color}
                strokeWidth="2.5"
              />

              {/* In-Graph Floating Tooltip Tag */}
              <g transform={`translate(${Math.min(Math.max(currentHover.x - 32, chartMetrics.paddingLeft), chartMetrics.width - 80)}, ${Math.max(currentHover.y - 28, 4)})`}>
                <rect
                  width="64"
                  height="20"
                  rx="4"
                  fill="var(--card, #18181b)"
                  stroke={tabData.color}
                  strokeWidth="1"
                  className="shadow-md"
                />
                <text
                  x="32"
                  y="13"
                  textAnchor="middle"
                  className="text-[9px] font-mono font-bold fill-foreground"
                >
                  +{currentHover.val} pts
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>
    </Card>
  );
}
