"use client"

import { DataTable } from "@/components/overview/Data-Table/DataTable"
import { FilterBar } from "@/components/overview/Filter-Bar/FilterBar"

const filters = [
  {
    label: "Lead Status",
    options: ["All Leads", "New", "Contacted", "Qualified", "Converted", "Lost"],
  },
  {
    label: "Interest Type",
    options: ["All Types", "Buying", "Selling", "Renting", "Investing"],
  },
  {
    label: "Lead Source",
    options: ["All Sources", "Website", "Referral", "Advertisement", "Social Media"],
  },
  {
    label: "Assigned Agent",
    options: ["All Agents", "Top Performers", "Recently Assigned"],
  },
  {
    label: "Interested Properties",
    options: ["All Properties", "Apartments", "Houses", "Commercial", "Land"],
  },
]

const breadcrumbs = [
  { label: "Leads", href: "/leads" },
  { label: "Overview", href: " /leads/overview" },
]

const tableHeaders = ["Lead Name", "Contact Info", "Interest Type", "Interested Properties", "Assigned Agent", "Lead Source"]

export default function LeadsPage() {
  const handleAdd = () => {
    console.log("Add lead clicked")
    // Implement your add lead logic here
  }

  return (
    <div className="min-h-screen bg-background">
      <FilterBar filters={filters} breadcrumbs={breadcrumbs} onAddButton={handleAdd} />
      <main className="container mx-auto px-4 py-6">
        <DataTable headers={tableHeaders} onAddButton={handleAdd} />
      </main>
    </div>
  )
}