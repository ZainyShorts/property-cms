"use client"

// import { DataTable } from "@/components/overview/Data-Table/DataTable"
import { FilterBar } from "@/components/overview/Filter-Bar/FilterBar"

const filters = [
  {
    label: "Agent Status",
    options: ["All Agents", "Active Agents", "Inactive Agents"],
  },
  {
    label: "Experience Level",
    options: ["All Levels", "Junior Agents", "Senior Agents"],
  },
  {
    label: "Client Type",
    options: ["All Clients", "New Clients", "Returning Clients"],
  },
  {
    label: "Client Satisfaction",
    options: ["All Feedback", "High Satisfaction", "Low Satisfaction"],
  },
  {
    label: "Transaction History",
    options: ["All Transactions", "Recent Transactions", "High-Value Clients"],
  },
]

const breadcrumbs = [
  { label: "Agents", href: "/agents" },
  { label: "Overview", href: "/agents/overview" },
]

const tableHeaders = ["Agent ID", "Agent Name", "Email", "Phone Number"]

const dummyAgents = [
  { id: "A001", name: "John Doe", email: "johndoe@example.com", phone: "(123) 456-7890", satisfaction: "High", sales: "Top Performer" },
  { id: "A002", name: "Jane Smith", email: "janesmith@example.com", phone: "(987) 654-3210", satisfaction: "Low", sales: "Needs Improvement" },
  { id: "A003", name: "Michael Brown", email: "michaelbrown@example.com", phone: "(555) 123-4567", satisfaction: "High", sales: "Top Performer" },
  { id: "A004", name: "Emily Davis", email: "emilydavis@example.com", phone: "(444) 987-6543", satisfaction: "High", sales: "Top Performer" },
  { id: "A005", name: "David Wilson", email: "davidwilson@example.com", phone: "(333) 789-0123", satisfaction: "Low", sales: "Needs Improvement" },
]

export default function AgentsPage() {
  const handleAdd = () => {
    console.log("Add record clicked")
    // Implement your add record logic here
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
