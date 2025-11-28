import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { 
   getDashboardStats
} from "@/app/data/admin/dashboard";
import { DashboardStats } from "@/components/admin_components/dashboard/DashboardStats";
import { 
   Users,
   Megaphone,
   BrainCircuit,
   LifeBuoy,
   Trophy,
   Settings,
   TrendingUp,
   LayoutDashboard
} from "lucide-react";

// Loading components
function StatsLoading() {
   return (
      <div className="space-y-6">
         <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
               <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <Skeleton className="h-4 w-24" />
                     <Skeleton className="h-10 w-10 rounded-lg" />
                  </CardHeader>
                  <CardContent>
                     <Skeleton className="h-8 w-20 mb-2" />
                     <Skeleton className="h-3 w-28" />
                  </CardContent>
               </Card>
            ))}
         </div>
         <Card>
            <CardHeader>
               <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
               <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                     <Skeleton key={i} className="h-24 w-full" />
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}

// Data fetching components
async function DashboardStatsSection() {
   const stats = await getDashboardStats();
   return <DashboardStats stats={stats} />;
}

export default function AdminPage() {
   const quickActions = [
      {
         title: "Members",
         description: "View and manage all members",
         href: "/admin/members",
         icon: Users,
         color: "bg-blue-500"
      },
      {
         title: "Announcements",
         description: "Create and manage announcements",
         href: "/admin/announcement",
         icon: Megaphone,
         color: "bg-pink-500"
      },
      {
         title: "Quizzes",
         description: "Manage quizzes and results",
         href: "/admin/quizzes",
         icon: BrainCircuit,
         color: "bg-purple-500"
      },
      {
         title: "Support Tickets",
         description: "Handle member support requests",
         href: "/admin/support-messages",
         icon: LifeBuoy,
         color: "bg-orange-500"
      },
      {
         title: "Points Management",
         description: "Track and award points",
         href: "/admin/points",
         icon: Trophy,
         color: "bg-yellow-500"
      },
      {
         title: "System Settings",
         description: "Configure platform settings",
         href: "/admin/settings",
         icon: Settings,
         color: "bg-gray-500"
      }
   ];

   return (
      <div className="space-y-8">
         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
               <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                     <LayoutDashboard className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                     <p className="text-sm text-muted-foreground">
                        Welcome back! Here's your platform overview.
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* Quick Actions */}
         <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
               <TrendingUp className="w-5 h-5" />
               Quick Actions
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
               {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                     <Card key={action.title} className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
                        <Link href={action.href} className="block h-full">
                           <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                              <div className={`${action.color} p-2.5 rounded-lg mr-3 shrink-0`}>
                                 <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                 <CardTitle className="text-base font-semibold truncate">
                                    {action.title}
                                 </CardTitle>
                              </div>
                           </CardHeader>
                           <CardContent>
                              <CardDescription className="text-xs leading-relaxed">
                                 {action.description}
                              </CardDescription>
                           </CardContent>
                        </Link>
                     </Card>
                  );
               })}
            </div>
         </div>

         {/* Dashboard Stats */}
         <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
               <TrendingUp className="w-5 h-5" />
               Platform Overview
            </h2>
            <Suspense fallback={<StatsLoading />}>
               <DashboardStatsSection />
            </Suspense>
         </div>
      </div>
   );
}
