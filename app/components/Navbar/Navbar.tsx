"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const router = useRouter()

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 py-4">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-semibold">
          AFS Real Estate
        </Link>

        <div>
          <Button
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-black transition-colors"
            onClick={() => router.push("/sign-in")}
          >
            Sign In
          </Button>
        </div>
      </div>
    </nav>
  )
}
