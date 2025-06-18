import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ToastContainer } from "react-toastify"
import { ApolloProvider } from "@/lib/ApolloPovider"
import "./globals.css"
import type React from "react"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AFS Real Estate",
  description: "Real Estate Management System",
  generator: 'afs',
  icons: {
    icon: "/afs-logo.ico", // or .png
  },
  
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <html lang="en">
        <head>
          {/* Inject theme detection script before hydration */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const theme = localStorage.getItem("theme");
                    if (theme === "light") {
                      document.documentElement.classList.remove("dark");
                    } else {
                      document.documentElement.classList.add("dark");
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
        </head>
        <body className={inter.className}>
          <ApolloProvider>
            {children}
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
  )
}
