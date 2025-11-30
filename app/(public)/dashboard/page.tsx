import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  Calendar, 
  Settings,
  Bell,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserDashboardData } from "./actions";
import { DashboardStatsCards } from "./_components/dashboard-stats-cards";
import { RecentActivities } from "./_components/recent-activities";
import { AnnouncementBanner } from "./_components/announcement-banner";
import { Progress } from "@/components/ui/progress";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your CodeBreakers dashboard - View your stats, activities, and upcoming events",
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
      <div className="container mx-auto py-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>
              {dashboardResult.message}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { stats, recentActivities, bannerAnnouncements, user } = dashboardResult.data;

  // Get profile image URL - prioritize profileImageKey from S3
  const getProfileImageUrl = () => {
    if (user.profileImageKey) {
      return `https://codebreakers.t3.storage.dev/${user.profileImageKey}`;
    }
    return user.image || "";
  };

  const profileImageUrl = getProfileImageUrl();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate real-time profile completion based on filled fields
  const calculateProfileCompletion = () => {
    const fields = [
      user.name,
      user.email,
      user.emailVerified,
      user.mobileNumber,
      user.whatsappNumber,
      user.state,
      user.district,
      user.collegeName,
      user.username,
      user.firstName,
      user.lastName,
      user.registration,
      user.rollNumber,
      user.branch,
      user.admissionYear,
      user.address,
      user.pinCode,
      user.image,
    ];
    
    const filledFields = fields.filter(field => {
      if (typeof field === 'boolean') return field === true;
      return field !== null && field !== undefined && field !== '';
    }).length;
    
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  
  // Get completed profile items
  const completedItems = [
    { condition: user.emailVerified, label: 'Email Verified' },
    { condition: user.name && user.email, label: 'Basic Info Added' },
    { condition: user.mobileNumber || user.whatsappNumber, label: 'Contact Info Added' },
    { condition: user.collegeName && user.branch, label: 'Academic Info Added' },
    { condition: user.username, label: 'Username Set' },
    { condition: user.githubUsername, label: 'GitHub Connected' },
  ].filter(item => item.condition); 

  return (
    <div className="container mx-auto py-4 sm:py-6 space-y-6 sm:space-y-8 px-4 sm:px-6">
      {/* Announcement Banner */}
      {bannerAnnouncements && bannerAnnouncements.length > 0 && (
        <AnnouncementBanner announcements={bannerAnnouncements} />
      )}

      {/* Welcome Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-primary/10">
              <AvatarImage src={profileImageUrl} alt={user.name || "User"} />
              <AvatarFallback className="text-sm sm:text-lg font-semibold bg-primary/5 text-primary">
                {getInitials(user.name || "User")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {getCurrentGreeting()}, {user.name?.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Here's what's happening with your activities today.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
              <Link href="/dashboard/settings">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Settings</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Today is {format(new Date(), "EEEE, MMMM do, yyyy")}</span>
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-4" />
        </div>
      </div>

      <Separator />

      {/* Dashboard Stats */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Overview</h2>
        </div>
        <DashboardStatsCards stats={stats} />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Action Items / Pending Tasks */}
          {stats.pendingTasks > 0 && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  Action Items
                </CardTitle>
                <CardDescription>
                  You have {stats.pendingTasks} pending tasks that require your attention.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/dashboard/activities/tasks" className="flex items-center">
                    View Pending Tasks <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recent Activities */}
          <RecentActivities activities={recentActivities} />

        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* Profile Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Profile Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium">{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} className="h-2" />
              </div>
              <div className="pt-2 space-y-2">
                {completedItems.length > 0 ? (
                  completedItems.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>{item.label}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span>Complete your profile to get started</span>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full text-sm mt-2" asChild>
                <Link href="/dashboard/settings">
                  Complete Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                <Link href="/dashboard/events">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  Browse All Events
                </Link>
              </Button>
              
              <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                <Link href="/dashboard/activities/quizzes">
                  <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                  Take a Quiz
                </Link>
              </Button>

              <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                <Link href="/dashboard/support">
                  <Bell className="w-4 h-4 mr-2 text-orange-500" />
                  Contact Support
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}