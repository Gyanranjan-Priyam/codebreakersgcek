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
  Compass,
  Code2,
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
      title: "Roadmaps",
      url: "/admin/roadmaps",
      icon: Compass,
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
              size="lg"
              asChild
              tooltip="CodeBreakers"
              className="data-[slot=sidebar-menu-button]:p-1.5 hover:bg-sidebar-accent transition-colors"
            >
              <Link href="/admin" className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
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
