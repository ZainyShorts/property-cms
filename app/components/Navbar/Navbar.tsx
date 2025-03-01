"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignInButton, SignedOut, SignedIn, UserButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 py-4">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-semibold">
          AFS Real Estate
        </Link>

        <div>
          <SignedOut>
            <SignInButton mode="modal" redirectUrl="/dashboard/properties/overview">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black transition-colors">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
