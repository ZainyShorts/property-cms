"use client"

import type React from "react"
import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"
import { Provider } from "react-redux"
import { store } from "@/lib/store/store"
import "../globals.css"
import { useState, useEffect } from "react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar")
      if (sidebarOpen && sidebar && !sidebar.contains(event.target as Node) && window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [sidebarOpen])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

    
      <div
        id="sidebar"
        className="md:w-64 md:fixed md:h-screen md:overflow-y-auto md:thin-scrollbar md:bg-background md:z-50"
      >
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col w-full md:ml-64 min-w-0">
        <div className="sticky top-0 z-50 w-full">
          <MainNav onOpenSidebar={() => setSidebarOpen(true)} />
        </div>

        <main className="p-6 flex-1 overflow-y-auto">
          <Provider store={store}>{children}</Provider>
        </main>
      </div>
    </div>
  )
}

