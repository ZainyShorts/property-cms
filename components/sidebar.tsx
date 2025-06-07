"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { usePathname } from "next/navigation"
import {
  Building2,
  Users,
  UserCircle,
  ClipboardList,
  Calendar,
  FileText,
  UserPlus,
  FileCheck,
  Contact,
  ChevronDown,
  X,
  Lock,
} from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const sidebarItems = [
  {
    title: "Properties",
    icon: Building2,
    items: ["Master Development", "Sub Development", "Projects", "Inventory"],
    enabled: true,
  },
  { title: "Agents", icon: Users, items: ["Overview", "Agents Gallery", "Agents Dashboard"], enabled: false },
  { title: "Clients", icon: UserCircle, items: ["Overview"], enabled: false },
  { title: "Listings", icon: ClipboardList, items: ["Overview", "Listing Gallery", "Listing Kanban"], enabled: false },
  { title: "Transactions", icon: FileCheck, items: ["Overview", "Transactions Dashboard"], enabled: false },
  { title: "Appointments", icon: Calendar, items: ["Overview", "Appointments Calender"], enabled: false },
  { title: "Documents", icon: FileText, items: ["Overview"], enabled: true },
  { title: "Leads", icon: UserPlus, items: ["Overview", "Leads Kanban"], enabled: false },
  { title: "Reviews", icon: ClipboardList, items: ["Overview"], enabled: false },
  { title: "Contracts", icon: Contact, items: ["Overview"], enabled: false },
  { title: "Invoices", icon: Contact, items: ["Overview"], enabled: false },
  { title: "Maintainance Request", icon: Contact, items: ["Overview", "Maintainance Request Gallery"], enabled: false },
]

export function Sidebar({ isOpen = true, onClose = () => {} }) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const pathname = usePathname()

  const handleDropdown = (itemTitle: string) => {
    setSelectedItem(selectedItem === itemTitle ? null : itemTitle)
  }

  const generateRoute = (itemTitle: string, subItem: string) => {
    const baseRoute = itemTitle.toLowerCase().replace(/\s+/g, "-")
    const subRoute = subItem.toLowerCase().replace(/\s+/g, "-")
    return `/dashboard/${baseRoute}/${subRoute}`
  }

  const isCurrentPage = (itemTitle: string, subItem: string) => {
    const route = generateRoute(itemTitle, subItem)
    return pathname === route
  }

  const isMainItemActive = (itemTitle: string) => {
    return (
      sidebarItems
        .find((item) => item.title === itemTitle)
        ?.items.some((subItem) => isCurrentPage(itemTitle, subItem)) || false
    )
  }

  // Close sidebar on mobile when navigating
  const handleNavigation = () => {
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  return (
    <div
      className={`pb-12 thin-scrollbar h-screen w-64 border-r bg-[#913c3c] dark:bg-black text-white fixed md:relative z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="flex justify-between items-center p-4 md:hidden">
        <h1 className="text-xl font-bold">AFS Real Estate</h1>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="h-full py-6 px-4 thin-scrollbar">
        <div className="mb-8 thin-scrollbar px-4">
          <h1 className="text-2xl thin-scrollbar font-bold">AFS Real Estate</h1>
          <p className="text-sm text-gray-300">Your Dream, Our Mission</p>
        </div>

        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <div key={item.title} className="space-y-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => handleDropdown(item.title)}
                      className={`w-[90%] flex justify-between gap-3 thin-scrollbar text-white hover:bg-white/10 dark:hover:bg-white/20 hover:text-white transition-colors duration-200 ${
                        isMainItemActive(item.title) ? " bg-white/20" : ""
                      } ${!item.enabled ? "opacity-60 cursor-not-allowed" : ""}`}
                      disabled={!item.enabled}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon && <item.icon className="h-5 w-5" />}
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <div className="flex items-center">
                        {!item.enabled && <Lock className="h-3 w-3 mr-1 text-white/70" />}
                        <ChevronDown
                          className={`h-4 w-4 mr-2 text-white transition-transform duration-300 ease-in-out ${
                            selectedItem === item.title ? "rotate-180" : "hidden"
                          }`}
                        />
                      </div>
                    </Button>
                  </TooltipTrigger>
                  {!item.enabled && (
                    <TooltipContent side="right" className="bg-slate-900 text-white border-none">
                      <p>This feature is coming soon</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <div
                className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                  selectedItem === item.title ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {item.items.map((subItem) => (
                  item.enabled ? (
                    <Link key={subItem} href={generateRoute(item.title, subItem)} onClick={handleNavigation} passHref>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start pl-12 text-sm text-gray-300 hover:bg-white/10 dark:hover:bg-white/20 hover:text-white transition-colors duration-200 ${
                          isCurrentPage(item.title, subItem) ? "bg-white/20" : ""
                        }`}
                      >
                        {subItem}
                      </Button>
                    </Link>
                  ) : (
                    <TooltipProvider key={subItem}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-start pl-12 text-sm text-gray-300/60 opacity-60 cursor-not-allowed"
                            disabled
                          >
                            {subItem}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-900 text-white border-none">
                          <p>This feature is coming soon</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}