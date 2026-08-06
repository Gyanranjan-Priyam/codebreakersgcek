"use client";

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { ThemeSelectorDropdown } from "@/components/ui/theme-selector-dropdown"

export function SiteHeader() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="print:hidden flex h-(--header-height) shrink-0 items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {/* Back button for desktop - left side */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="hidden md:flex items-center gap-2 hover:bg-muted/50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="px-4 flex items-center gap-2">
        <ThemeSelectorDropdown />
        {/* Back button for mobile - right side */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="md:hidden flex items-center gap-2 hover:bg-muted/50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
    </header>
  )
}
