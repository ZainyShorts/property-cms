"use client"

// import { DataTable } from "@/components/overview/Data-Table/DataTable"
import { FilterBar } from "@/components/overview/Filter-Bar/FilterBar"

const filters = [
  {
    label: "Transaction Status",
    options: ["All Transactions", "Completed", "Pending", "Failed"],
  },
  {
    label: "Transaction Type",
    options: ["All Types", "Purchase", "Sale", "Rental", "Deposit"],
  },
  {
    label: "Date Range",
    options: ["All Dates", "Last 24 Hours", "Last Week", "Last Month"],
  },
  {
    label: "Amount Range",
    options: ["All Amounts", "Under $50K", "$50K - $200K", "$200K - $1M", "Over $1M"],
  },
  {
    label: "Agent",
    options: ["All Agents", "Top Performers", "Recently Added"],
  },
  {
    label: "Client",
    options: ["All Clients", "Returning Clients", "New Clients"],
  },
]

const breadcrumbs = [
  { label: "Transactions", href: "/transactions" },
  { label: "Overview", href: "/transactions/overview" },
]

const tableHeaders = ["Transaction ID", "Transaction Date", "Amount", "Property", "Agent", "Client", "Transaction Type", "Contact"]

export default function TransactionsPage() {
  const handleAdd = () => {
    console.log("Add transaction clicked")
    // Implement your add transaction logic here
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
