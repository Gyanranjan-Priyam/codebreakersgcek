"use client"

import * as React from "react"
import {
  Calendar,
  LayoutDashboard,
  FileText,
  Settings,
  Megaphone,
  Brain,
  Ticket,
  FolderGit,
  Users,
  ChartColumnIncreasing,
  Trophy,
  UserX,
  Activity,
  ListChecks
} from "lucide-react"

import { NavMain } from "@/components/admin_components/dashboard/nav-main"
import { NavSecondary } from "@/components/admin_components/dashboard/nav-secondary"
import { NavUser } from "@/components/admin_components/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string | null;
  };
}

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Members",
      url: "/admin/members",
      icon: Users,
    },
    {
      title: "Incomplete Profiles",
      url: "/admin/incomplete-profiles",
      icon: UserX,
    },
    {
      title: "Activities",
      url: "#",
      icon: Activity,
      isCollapsible: true,
      items: [
        {
          title: "Quizzes",
          url: "/admin/quizzes",
          icon: Brain,
        },
        {
          title: "Tasks",
          url: "/admin/tasks",
          icon: ListChecks,
        },
      ],
    },
    {
      title: "Leaderboard",
      url: "/admin/leaderboard",
      icon: ChartColumnIncreasing,
    },
    {
      title: "Points Management",
      url: "/admin/points",
      icon: Trophy,
    },
    {
      title: "Projects",
      url: "#",
      icon: FolderGit,
      isCollapsible: true,
      items: [
        {
          title: "All Projects",
          url: "/admin/projects/all-projects",
        },
        {
          title: "Submission Projects",
          url: "/admin/projects/submission-projects",
        },
      ],
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: FileText,
    },
    {
      title: "Support Messages",
      url: "/admin/support-messages",
      icon: Ticket,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
    {
      title: "Announcements",
      url: "/admin/announcement",
      icon: Megaphone,
    },
  ],
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  // Create user data with proper formatting
  const userData = user ? {
    name: user.name || "User",
    email: user.email,
    avatar: user.image || "/default-avatar.png",
  } : {
    name: "Admin User",
    email: "admin@example.com", 
    avatar: "/default-avatar.png",
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <div className="flex items-center">
                  <span className="text-[1.1rem] font-bold inline-flex items-center hover:text-amber-400">
                    <Image
                    src="/assets/logo.png"
                    alt="CodeBreakers Logo"
                    width={32}
                    height={32}
                    className="inline-block mr-2 mb-1"
                    priority
                  />
                    CodeBreakers
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain}/>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
