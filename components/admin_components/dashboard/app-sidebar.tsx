"use client";

import * as React from "react";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Brain,
  Users,
  Layers,
  Trophy,
  ListChecks,
  QrCode,
  Receipt,
} from "lucide-react";

import { NavMain } from "@/components/admin_components/dashboard/nav-main";
import { NavSecondary } from "@/components/admin_components/dashboard/nav-secondary";
import { NavUser } from "@/components/admin_components/dashboard/nav-user";
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
      title: "Batches",
      url: "/admin/batches",
      icon: Layers,
    },
    {
      title: "Attendance",
      url: "/admin/attendance",
      icon: QrCode,
    },
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
    {
      title: "Points Management",
      url: "/admin/points",
      icon: Trophy,
    },
    {
      title: "Forms",
      url: "/admin/forms",
      icon: FileText,
    },
    {
      title: "Transactions",
      url: "/admin/transactions",
      icon: Receipt,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
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
      }
    : {
        name: "Admin User",
        email: "admin@example.com",
        avatar: "/default-avatar.png",
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
              <Link href="/">
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
                    <span className="group-data-[collapsible=icon]:hidden">CodeBreakers</span>
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
