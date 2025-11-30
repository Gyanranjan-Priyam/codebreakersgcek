"use client"

import { useState } from "react"
import { type LucideIcon, ChevronRight } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isCollapsible?: boolean
    items?: {
      title: string
      url: string
      icon?: LucideIcon
    }[]
  }[]
}) {
  const [openItems, setOpenItems] = useState<string[]>(["Activities"])

  const toggleItem = (title: string) => {
    setOpenItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex items-center justify-center flex-col gap-5">
        <SidebarMenu>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            item.isCollapsible && item.items ? (
              <Collapsible
                key={item.title}
                asChild
                open={openItems.includes(item.title)}
                onOpenChange={() => toggleItem(item.title)}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      tooltip={item.title} 
                      className={buttonVariants({ 
                        variant: "ghost", 
                        size: "icon", 
                        className: "w-full h-auto text-sm font-semibold justify-start hover:text-amber-400" 
                      })}
                    >
                      {item.icon && <item.icon />}
                      <span className="flex-1 text-left">{item.title}</span>
                      <ChevronRight
                        className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${
                          openItems.includes(item.title) ? "rotate-90" : ""
                        }`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link href={subItem.url} className="hover:text-amber-400">
                              {subItem.icon && <subItem.icon className="h-4 w-4" />}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} className={buttonVariants({ variant: "ghost", size: "icon", className: "w-full h-auto text-sm font-semibold justify-start  hover:text-amber-400" })}>
                  {item.icon && <item.icon />}
                  <Link href={item.url} className="flex-1">
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
