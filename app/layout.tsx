import type { Metadata } from "next"
import { Inter } from "next/font/google" 
import { ApolloProvider } from "@/lib/ApolloPovider"
import "./globals.css" 

import type React from "react" 
const inter = Inter({ subsets: ["latin"] }) 
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

export const metadata: Metadata = {
  title: "AFS Real Estate",
  description: "Real Estate Management System",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
    <html lang="en" className="dark">
      <body className={inter.className}>
      <ApolloProvider>{children}</ApolloProvider>  
      </body>
    </html>
    </ClerkProvider>
  )
}



