import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Settings,
  CheckSquare,
  BrainCircuit,
  Compass,
  FileText,
  Receipt,
  FolderGit,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Activity,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserDashboardData } from "./actions";
import { AnalyticsGraphCard } from "./_components/analytics-graph-card";
import { OnboardingDialog } from "./_components/onboarding-dialog";
import { getUserProfileImageUrl } from "@/lib/image-utils";
import { getBranchFullName } from "@/lib/branch-constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Dashboard | CodeBreakers",
  description:
    "Your CodeBreakers learning hub - Track your points, assignments, quizzes, and learning roadmaps",
};

export default async function UserDashboard() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch dashboard data
  const dashboardResult = await getUserDashboardData();

  if (dashboardResult.status === "error") {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Card className="border-destructive/60 bg-card p-6">
          <h2 className="text-base font-bold text-destructive font-mono">
            Unable to load dashboard data
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {dashboardResult.message}
          </p>
        </Card>
      </div>
    );
  }

  const { stats, recentActivities, roadmaps = [], user } = dashboardResult.data;

  const profileImageUrl = getUserProfileImageUrl({
    profileImageKey: user.profileImageKey,
    image: user.image,
  }) || "";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate real-time profile completion based on essential fields
  const calculateProfileCompletion = () => {
    const fields = [
      user.name,
      user.email,
      user.emailVerified,
      user.mobileNumber,
      user.whatsappNumber,
      user.username,
      user.registration,
      user.branch,
      user.admissionYear,
    ];

    const filledFields = fields.filter((field) => {
      if (typeof field === "boolean") return field === true;
      return field !== null && field !== undefined && field !== "";
    }).length;

    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // 4 Core Flat Metric Cards
  const coreStats = [
    {
      title: "Total Points",
      value: stats.totalPoints.toLocaleString(),
      subtext: `${stats.attendancePoints || 0} Att • ${stats.taskPoints || 0} Task • ${stats.quizPoints || 0} Quiz`,
      actionLabel: "Leaderboard",
      actionHref: "/dashboard/leaderboard",
      icon: Trophy,
    },
    {
      title: "Active Quizzes",
      value: stats.activeQuizzes,
      subtext: stats.activeQuizzes > 0 ? "Ready to attempt" : "No active tests",
      actionLabel: "Take Quiz",
      actionHref: "/dashboard/activities/quizzes",
      icon: BrainCircuit,
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      subtext:
        stats.pendingTasks > 0 ? "Awaiting submission" : "All tasks done",
      actionLabel: "View Tasks",
      actionHref: "/dashboard/activities/tasks",
      icon: CheckSquare,
    },
    {
      title: "Active Roadmaps",
      value: roadmaps.length,
      subtext:
        roadmaps.length > 0 ? "Curriculum in progress" : "Explore tracks",
      actionLabel: "Roadmaps",
      actionHref: "/dashboard/roadmaps",
      icon: Compass,
    },
  ];

  // Quick Action Shortcut Hub
  const userShortcuts = [
    {
      title: "Learning Roadmaps",
      desc: "Interactive skill trees & concept paths",
      href: "/dashboard/roadmaps",
      icon: Compass,
    },
    {
      title: "Cohort Leaderboard",
      desc: "Check rankings & performance",
      href: "/dashboard/leaderboard",
      icon: Trophy,
    },
    {
      title: "Resume Builder",
      desc: "Create ATS-compliant developer resume",
      href: "/dashboard/resume-builder",
      icon: FileText,
    },
    {
      title: "Projects & Code",
      desc: "Manage submissions & showcase apps",
      href: "/dashboard/projects/my-projects",
      icon: FolderGit,
    },
    {
      title: "Receipts & History",
      desc: "Transactions & verified payment logs",
      href: "/dashboard/transactions",
      icon: Receipt,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto w-full space-y-6">
      {/* ── 1. Student Header HUD ── */}
      <div className="p-5 rounded-xl border border-border/80 bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Avatar className="w-14 h-14 rounded-lg border border-border/70 shrink-0">
            <AvatarImage src={profileImageUrl} alt={user.name || "Student"} />
            <AvatarFallback className="rounded-lg font-mono font-bold text-sm bg-muted">
              {getInitials(user.name || "User")}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {user.name}
              </h1>
              {user.emailVerified && (
                <span title="Verified Account">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                </span>
              )}
              {user.batch && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono uppercase bg-muted/40 border-border/70"
                >
                  <Layers className="w-3 h-3 mr-1" />
                  {user.batch.code}
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground font-mono truncate">
              {user.registration ? `Reg: ${user.registration}` : user.email}
              {user.branch ? ` • ${getBranchFullName(user.branch)}` : ""}
              {user.admissionYear ? ` • Class of ${user.admissionYear}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 text-xs font-mono gap-1.5"
          >
            <Link href="/dashboard/settings" prefetch={true}>
              <Settings className="w-3.5 h-3.5" />
              Settings
            </Link>
          </Button>
          <Button
            variant="default"
            size="sm"
            asChild
            className="h-8 text-xs font-mono gap-1.5"
          >
            <Link href="/dashboard/activities/tasks" prefetch={true}>
              <CheckSquare className="w-3.5 h-3.5" />
              My Tasks
            </Link>
          </Button>
        </div>
      </div>

      {/* ── 2. Flat Geometric 4-KPI Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {coreStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="p-4 border border-border/80 bg-card flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium truncate">
                  {stat.title}
                </span>
                <div className="p-1.5 rounded-md bg-muted/60 border border-border/40 shrink-0">
                  <Icon className="w-3.5 h-3.5 text-foreground" />
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
                  {stat.value}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate font-mono">
                  {stat.subtext}
                </p>
              </div>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <Link
                  href={stat.actionHref}
                  prefetch={true}
                  className="text-[11px] font-mono text-foreground hover:underline inline-flex items-center gap-1"
                >
                  <span>{stat.actionLabel}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── 3. Main Work Area Split (2 Columns) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Analytics Velocity Graph, Roadmaps in Progress & Recent Activity Ledger */}
        <div className="lg:col-span-8 space-y-6">
          {/* 📈 Learning Velocity & Points Sparkline Chart */}
          <AnalyticsGraphCard stats={stats} recentActivities={recentActivities} />

          {/* Active Roadmaps Track */}
          {roadmaps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-foreground" />
                  <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
                    Enrolled Roadmaps
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-6 text-[11px] font-mono text-muted-foreground hover:text-foreground"
                >
                  <Link href="/dashboard/roadmaps" prefetch={true}>
                    View All
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roadmaps.map((r) => {
                  const percent = Math.round(r.percentage || 0);
                  return (
                    <Card
                      key={r.id}
                      className="p-4 border border-border/80 bg-card space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className="text-[9px] font-mono uppercase"
                        >
                          {r.roadmap.category || "Track"}
                        </Badge>
                        <span className="text-xs font-mono font-bold">
                          {percent}%
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-foreground truncate">
                          {r.roadmap.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          {r.completedNodeIds.length} topics mastered
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Progress value={percent} className="h-1.5" />
                        <div className="flex justify-end pt-1">
                          <Link
                            href={`/dashboard/roadmaps/${r.roadmap.slug}`}
                            prefetch={true}
                            className="text-[11px] font-mono font-medium hover:underline inline-flex items-center gap-1"
                          >
                            <span>Continue Track</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Activity Ledger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-foreground" />
                <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
                  Recent Activity Ledger
                </h2>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {recentActivities.length} logs
              </span>
            </div>

            <Card className="border border-border/80 bg-card overflow-hidden">
              {recentActivities.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-[9px] font-mono uppercase h-4 px-1.5 py-0"
                          >
                            {act.type}
                          </Badge>
                          <span className="text-xs font-semibold text-foreground truncate">
                            {act.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                          {act.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0 space-y-0.5">
                        {act.points !== undefined && act.points > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-mono font-bold h-4 px-1.5 py-0"
                          >
                            +{act.points} pts
                          </Badge>
                        )}
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {format(new Date(act.date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground font-mono">
                  No activity recorded yet. Start participating in tasks,
                  quizzes, or attendance sessions!
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Right Column: Academic Standing & Quick Action Hub */}
        <div className="lg:col-span-4 space-y-6">
          {/* Student Academic Standing */}
          <Card className="border border-border/80 bg-card p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-foreground">
                Profile Standing
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono">
                {profileCompletion}% Complete
              </Badge>
            </div>

            <div className="space-y-1.5">
              <Progress value={profileCompletion} className="h-1.5" />
              <p className="text-[11px] text-muted-foreground font-mono">
                {profileCompletion >= 80
                  ? "Profile verified and active"
                  : "Complete remaining details in settings"}
              </p>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-border/30 text-muted-foreground">
                <span>Branch</span>
                <span className="text-foreground font-semibold">
                  {user.branch || "General"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 text-muted-foreground">
                <span>Batch Cohort</span>
                <span className="text-foreground font-semibold">
                  {user.batch?.code || "Unassigned"}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full h-8 text-xs font-mono"
            >
              <Link href="/dashboard/settings" prefetch={true}>
                Update Profile Info
              </Link>
            </Button>
          </Card>

          {/* Quick Access Navigation Hub */}
          <Card className="border border-border/80 bg-card p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-foreground border-b border-border/40 pb-2">
              Quick Shortcuts
            </h3>

            <div className="space-y-1.5">
              {userShortcuts.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    prefetch={true}
                    className="p-2.5 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3 group block"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-md bg-muted/60 text-foreground shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* ── First-Time User Onboarding Popup ── */}
      <OnboardingDialog user={user} />
    </div>
  );
}
