"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
    Users, 
    UserCheck, 
    UserX, 
    UserPlus,
    Megaphone,
    BrainCircuit,
    Calendar,
    CheckSquare,
    Trophy,
    TrendingUp,
    Activity,
    Clock,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface DashboardStatsProps {
    stats: {
        // Users
        totalUsers: number;
        verifiedUsers: number;
        bannedUsers: number;
        newUsersThisMonth: number;
        
        // Announcements
        totalAnnouncements: number;
        activeAnnouncements: number;
        
        // Quizzes
        totalQuizzes: number;
        activeQuizzes: number;
        totalQuizAttempts: number;
        
        // Events
        totalEvents: number;
        upcomingEvents: number;
        totalAttendance: number;
        
        // Tasks
        totalTasks: number;
        pendingTasks: number;
        approvedSubmissions: number;
        
        // Points
        totalPointsDistributed: number;
        
        // Recent activities
        recentUsers: Array<{
            name: string;
            email: string;
            createdAt: Date;
            emailVerified: boolean;
            role?: string | null;
        }>;
    };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const mainStats = [
        {
            title: "Total Users",
            value: stats.totalUsers,
            description: `${stats.verifiedUsers} verified`,
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950/20",
            href: "/admin/members",
        },
        {
            title: "New This Month",
            value: stats.newUsersThisMonth,
            description: "New registrations",
            icon: UserPlus,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950/20",
            href: "/admin/members",
        },
        {
            title: "Active Quizzes",
            value: stats.activeQuizzes,
            description: `${stats.totalQuizAttempts} attempts`,
            icon: BrainCircuit,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950/20",
            href: "/admin/quizzes",
        },
        {
            title: "Total Tasks",
            value: stats.totalTasks,
            description: `${stats.pendingTasks} active tasks`,
            icon: CheckSquare,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950/20",
            href: "/admin/tasks",
        },
        {
            title: "Total Points",
            value: stats.totalPointsDistributed.toLocaleString(),
            description: "Distributed to members",
            icon: Trophy,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
            href: "/admin/points",
        },
        {
            title: "Announcements",
            value: stats.totalAnnouncements,
            description: `${stats.activeAnnouncements} this month`,
            icon: Megaphone,
            color: "text-pink-600",
            bgColor: "bg-pink-50 dark:bg-pink-950/20",
            href: "/admin/announcement",
        },
    ];

    const secondaryStats = [
        {
            label: "Upcoming Events",
            value: stats.upcomingEvents,
            total: stats.totalEvents,
            icon: Calendar,
            color: "text-indigo-600",
        },
        {
            label: "Pending Tasks",
            value: stats.pendingTasks,
            total: stats.totalTasks,
            icon: CheckSquare,
            color: "text-cyan-600",
        },
        {
            label: "Total Attendance",
            value: stats.totalAttendance,
            total: stats.totalUsers,
            icon: UserCheck,
            color: "text-emerald-600",
        },
        {
            label: "Banned Users",
            value: stats.bannedUsers,
            total: stats.totalUsers,
            icon: UserX,
            color: "text-red-600",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {mainStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link key={stat.title} href={stat.href}>
                            <Card className="hover:shadow-md transition-all cursor-pointer">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                        <Icon className={`h-4 w-4 ${stat.color}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* Secondary Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Quick Stats
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {secondaryStats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                                    <Icon className={`h-8 w-8 ${stat.color}`} />
                                    <div>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {stat.label}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activities */}
            <div>
                {/* Recent Users */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <UserPlus className="h-5 w-5 text-green-600" />
                            Recent Registrations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.recentUsers.length > 0 ? (
                                stats.recentUsers.map((user, index) => (
                                    <div key={index} className="flex items-start justify-between p-3 rounded-lg border bg-muted/30">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-medium text-sm truncate">{user.name}</p>
                                                {user.emailVerified && (
                                                    <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />
                                                )}
                                                {user.role === "admin" && (
                                                    <Badge className="bg-purple-600 text-[10px] px-1.5 py-0 h-4">Admin</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {format(new Date(user.createdAt), "MMM dd, yyyy")}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No recent registrations
                                </p>
                            )}
                        </div>
                        <Separator className="my-3" />
                        <Link href="/admin/members">
                            <p className="text-sm text-primary hover:underline text-center">
                                View all members →
                            </p>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}