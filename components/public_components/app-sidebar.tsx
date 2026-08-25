"use client";

import * as React from "react";
import {
  Calendar,
  LayoutDashboard,
  Settings,
  Users,
  Trophy,
  FolderGit,
  ListChecks,
  ReceiptText,
  FileText,
  Compass,
  Code2,
} from "lucide-react";

import { NavMain } from "@/components/public_components/nav-main";
import { NavSecondary } from "@/components/public_components/nav-secondary";
import { NavUser } from "@/components/public_components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    profileImageKey?: string | null;
    role?: string | null;
  };
}

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Quizzes",
      url: "/dashboard/activities/quizzes",
      icon: Calendar,
    },
    {
      title: "Tasks",
      url: "/dashboard/activities/tasks",
      icon: ListChecks,
    },

    {
      title: "Achievements",
      url: "/dashboard/achievements",
      icon: Trophy,
    },
    {
      title: "Leaderboards",
      url: "/dashboard/leaderboard",
      icon: Users,
    },
    {
      title: "Resume Builder (Beta)",
      url: "/dashboard/resume-builder",
      icon: FileText,
    },
    {
      title: "Roadmaps (Beta)",
      url: "/dashboard/roadmaps",
      icon: Compass,
    },
    {
      title: "Transactions",
      url: "/dashboard/transactions",
      icon: ReceiptText,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: FolderGit,
      isCollapsible: true,
      items: [
        {
          title: "My Projects",
          url: "/dashboard/projects/my-projects",
        },
        {
          title: "My Submissions",
          url: "/dashboard/projects/my-submissions",
        },
        {
          title: "Collaborative Projects",
          url: "/dashboard/projects/collaborative-projects",
        },
      ],
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  // Create user data with proper formatting
  const userData = user
    ? {
        name: user.name || "User",
        email: user.email,
        avatar: user.image || "/default-avatar.png",
        profileImageKey: user.profileImageKey || null,
      }
    : {
        name: "User",
        email: "user@example.com",
        avatar: "/default-avatar.png",
        profileImageKey: null,
      };

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="CodeBreakers"
              className="data-[slot=sidebar-menu-button]:p-1.5 hover:bg-sidebar-accent transition-colors"
            >
              <Link href="/dashboard" className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg shrink-0">
                  <Image
                    src="/assets/logo.png"
                    alt="CodeBreakers Logo"
                    width={28}
                    height={28}
                    className="size-7 object-contain shrink-0"
                    priority
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-bold text-lg leading-none tracking-tight">
                    CodeBreakers
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
