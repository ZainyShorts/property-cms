"use client"

import { DataTable } from "@/components/overview/Data-Table/DataTable"
import { FilterBar } from "@/components/overview/Filter-Bar/FilterBar"

const filters = [
  {
    label: "Contract Date",
    options: ["All Dates", "Last 24 Hours", "Last Week", "Last Month"],
  },
  {
    label: "Parties Involved",
    options: ["All Parties", "Buyers", "Sellers", "Agents", "Investors"],
  },
  {
    label: "Contract Amount",
    options: ["All Amounts", "Below $50K", "$50K - $200K", "$200K - $500K", "Above $500K"],
  },
  {
    label: "Related Transactions",
    options: ["All Transactions", "Completed", "Pending", "Failed"],
  },
  {
    label: "Contract Terms",
    options: ["All Terms", "Short-Term", "Long-Term", "Flexible", "Fixed"],
  },
]

const breadcrumbs = [
  { label: "Contracts", href: "/contracts" },
  { label: "Overview", href: "/contracts/overview" },
]

const tableHeaders = ["ID", "Date", "Parties Involved", "Contract Amount", "Contract Terms", "Related Transactions", "Contract Documents"]

export default function ContractsPage() {
  const handleAdd = () => {
    console.log("Add contract clicked")
    // Implement your add contract logic here
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