"use client"

import { DataTable } from "@/components/overview/Data-Table/DataTable"
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
    label: "Client Satisfaction",
    options: ["All Feedback", "High Satisfaction", "Low Satisfaction"],
  },
  {
    label: "Sales Performance",
    options: ["All Sales", "Top Performers", "Needs Improvement"],
  },
]

const breadcrumbs = [
  { label: "Agents", href: "/agents" },
  { label: "Overview", href: "/agents/overview" },
]

const tableHeaders = ["Agent ID", "Agent Name", "Email", "Phone Number"]

const dummyAgents = [
  { id: "A001", name: "John Doe", email: "johndoe@example.com", phone: "(123) 456-7890" },
  { id: "A002", name: "Jane Smith", email: "janesmith@example.com", phone: "(987) 654-3210" },
  { id: "A003", name: "Michael Brown", email: "michaelbrown@example.com", phone: "(555) 123-4567" },
  { id: "A004", name: "Emily Davis", email: "emilydavis@example.com", phone: "(444) 987-6543" },
  { id: "A005", name: "David Wilson", email: "davidwilson@example.com", phone: "(333) 789-0123" },
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
        <DataTable headers={tableHeaders} data={dummyAgents} onAddButton={handleAdd} />
      </main>
    </div>
  )
}
