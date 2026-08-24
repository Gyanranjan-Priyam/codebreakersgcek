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
      title: "Resume Builder",
      url: "/dashboard/resume-builder",
      icon: FileText,
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
              asChild
              tooltip="CodeBreakers"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard">
                <div className="flex items-center">
                  <span className="text-[1.1rem] font-bold inline-flex items-center hover:text-amber-400">
                    <Image
                      src="/assets/logo.png"
                      alt="CodeBreakers Logo"
                      width={32}
                      height={32}
                      className="inline-block mr-2 mb-1 shrink-0"
                      priority
                    />
                    <span className="group-data-[collapsible=icon]:hidden">
                      CodeBreakers
                    </span>
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
