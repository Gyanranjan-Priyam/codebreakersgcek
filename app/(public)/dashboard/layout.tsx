import { AppSidebar } from "@/components/public_components/app-sidebar"
import { SiteHeader } from "@/components/public_components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RealtimeAttendanceListener } from "@/components/realtime/realtime-attendance-listener";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Ensure user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect('/login');
  }

  // Fetch user profile with profileImageKey
  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      profileImageKey: true,
      role: true,
      cbUserId: true,
    }
  });

  const userData = userProfile || session.user;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={userData} />
      <SidebarInset>
        <SiteHeader user={userData} />
        {children}
        <RealtimeAttendanceListener
          userId={userData.id}
          cbUserId={(userData as any).cbUserId || null}
          userName={userData.name || undefined}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
