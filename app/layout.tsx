import type { Metadata } from "next"
import { Inter } from "next/font/google"   
import { ToastContainer } from "react-toastify"
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
      <ApolloProvider>{children } 
         <ToastContainer
                position="top-right"
                autoClose={3000}
                theme="dark"
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
        </ApolloProvider>  
      </body>
    </html>
    </ClerkProvider>
  )
}



