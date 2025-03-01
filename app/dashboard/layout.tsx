"use client"
import type React from "react"; // Import React
import { MainNav } from "@/components/main-nav";
import { Sidebar } from "@/components/sidebar";  
import { ApolloProvider } from "@/lib/ApolloPovider"; 
import { Provider } from "react-redux"
import { store } from "@/lib/store/store"
import '../globals.css';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">

      {/* Sidebar */}
      <div className="w-64 fixed h-screen overflow-y-auto thin-scrollbar bg-background z-50">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col xl:ml-64 min-w-0">
        {/* Navbar */}
        <div className="sticky top-0 z-50 w-full">
          <MainNav />
        </div>

        {/* Page Content */}
        <main className="p-6 flex-1 overflow-y-auto">   <Provider store={store}>{children}</Provider>
        </main>
      </div> 

    </div>
  );
}