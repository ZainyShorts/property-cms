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

export function MainNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [darkMode, setDarkMode] = useState(false) // defaults to light mode

  // On mount, check for stored theme preference (default to light)
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme === "dark") {
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

  // Update the document class and store the theme preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [darkMode])

  return (
    <div
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <nav className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className={`${
                isScrolled
                  ? "text-foreground hover:bg-accent hover:text-accent-foreground"
                  : "text-primary hover:bg-primary/10 hover:text-primary"
              }`}
            >
              Data
            </Button>
            <Button
              variant="ghost"
              className={`${
                isScrolled
                  ? "text-foreground hover:bg-accent hover:text-accent-foreground"
                  : "text-primary hover:bg-primary/10 hover:text-primary"
              }`}
            >
              Automations
            </Button>
            <Button
              variant="ghost"
              className={`${
                isScrolled
                  ? "text-foreground hover:bg-accent hover:text-accent-foreground"
                  : "text-primary hover:bg-primary/10 hover:text-primary"
              }`}
            >
              Interfaces
            </Button>
            <Button
              variant="ghost"
              className={`${
                isScrolled
                  ? "text-foreground hover:bg-accent hover:text-accent-foreground"
                  : "text-primary hover:bg-primary/10 hover:text-primary"
              }`}
            >
              Forms
            </Button>
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {/* Dark mode toggle switch */}
          <Switch
            checked={darkMode}
            onCheckedChange={(checked) => setDarkMode(checked)}
            className="mr-4"
          />
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
                <Link href="/logout" className="w-full">
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
