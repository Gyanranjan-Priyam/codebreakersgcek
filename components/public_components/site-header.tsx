"use client";

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { BackButton } from "@/components/ui/back-button"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "./notification-context";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  const pathname = usePathname();
  const { toggleNotification, unreadCount } = useNotification();

  // Generate page title based on current path
  const pageTitle = useMemo(() => {
    if (!pathname) return "Dashboard";

    const segments = pathname.split("/").filter(Boolean);
    
    // Handle different routes
    if (segments.includes("admin")) {
      if (segments.includes("payments")) {
        if (segments.includes("accommodation-payments")) {
          return "Accommodation Payment Details";
        } else if (segments.includes("team-payments")) {
          return "Team Payment Details";
        }
        return "Payments Management";
      } else if (segments.includes("accommodations")) {
        return "Accommodation Management";
      } else if (segments.includes("events")) {
        return "Events Management";
      } else if (segments.includes("participants")) {
        return "Participants Management";
      } else if (segments.includes("team")) {
        return "Team Management";
      } else if (segments.includes("reports")) {
        return "Reports";
      } else if (segments.includes("settings")) {
        return "Settings";
      } else if (segments.includes("system")) {
        return "System Management";
      }
      return "Admin Dashboard";
    } else if (segments.includes("dashboard")) {
      if (segments.includes("events")) {
        return "Events";
      } else if (segments.includes("teams")) {
        return "Team Management";
      } else if (segments.includes("settings")) {
        return "Profile Settings";
      }
      return "Dashboard";
    } else if (segments.includes("events")) {
      return "Events";
    } else if (segments.includes("login")) {
      return "Login";
    } else if (segments.includes("verify-request")) {
      return "Verify Email";
    }

    // Fallback: capitalize the last segment
    const lastSegment = segments[segments.length - 1];
    return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) : "Dashboard";
  }, [pathname]);

  // Determine if back button should be shown (not on main dashboard pages)
  const showBackButton = useMemo(() => {
    if (!pathname) return false;
    
    const mainPages = [
      "/dashboard",
      "/dashboard/events",
      "/dashboard/teams",
      "/dashboard/settings",
    ];
    
    return !mainPages.includes(pathname);
  }, [pathname]);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {showBackButton && (
          <>
            <BackButton />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
          </>
        )}
        <h1 className="text-base font-medium">{pageTitle}</h1>
      </div>
      <div className="mr-6">
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Notifications"
            className="cursor-pointer relative"
            onClick={toggleNotification}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
