"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Menu } from "lucide-react"
import { logoutUser } from "@/lib/auth"

interface MainNavProps {
  onOpenSidebar: () => void
}

export function MainNav({ onOpenSidebar }: MainNavProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [darkMode, setDarkMode] = useState<null | boolean>(null) // ← initially unknown

  // Read theme from localStorage only once on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme === "light") {
      setDarkMode(false)
    } else {
      setDarkMode(true)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Apply class & save preference
  useEffect(() => {
    if (darkMode === null) return // don’t run until theme is resolved
    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [darkMode])

  if (darkMode === null) return null // Avoid rendering until theme is set

  return (
    <div
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-sm border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenSidebar}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>
          <nav className="flex items-center space-x-4"></nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Switch checked={darkMode} onCheckedChange={setDarkMode} className="mr-4" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage
                  src="https://c4.wallpaperflare.com/wallpaper/900/199/830/anime-animated-wallpaper-preview.jpg"
                  alt="Profile"
                />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <p onClick={logoutUser} className="w-full cursor-pointer">
                  Logout
                </p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
