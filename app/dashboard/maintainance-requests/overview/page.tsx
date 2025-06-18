"use client"

// import { DataTable } from "@/components/overview/Data-Table/DataTable"
import { FilterBar } from "@/components/overview/Filter-Bar/FilterBar"

const filters = [
  {
    label: "Request Date",
    options: ["All Dates", "Last 24 Hours", "Last Week", "Last Month"],
  },
  {
    label: "Status",
    options: ["All Statuses", "Pending", "In Progress", "Completed"],
  },
  {
    label: "Priority",
    options: ["All Priorities", "Low", "Medium", "High"],
  },
  {
    label: "Assigned Agent",
    options: ["All Agents", "Top Performers", "Recently Assigned"],
  },
]

const breadcrumbs = [
  { label: "Management Requests", href: "/management-requests" },
  { label: "Overview", href: "/management-requests/overview" },
]

const tableHeaders = ["Request ID", "Request Date", "Client", "Property", "Description", "Status", "Priority", "Assigned Agent"]

export default function ManagementRequestsPage() {
  const handleAdd = () => {
    console.log("Add request clicked")
    // Implement your add request logic here
  }

  return (
    <div className="min-h-screen bg-background">
      <FilterBar filters={filters} breadcrumbs={breadcrumbs} onAddButton={handleAdd} />
      <main className="container mx-auto px-4 py-6">
        {/* <DataTable headers={tableHeaders} onAddButton={handleAdd} /> */}
      </main>
    </div>
  )
}
