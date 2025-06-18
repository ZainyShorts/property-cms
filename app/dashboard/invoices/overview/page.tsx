"use client"

// import { DataTable } from "@/components/overview/Data-Table/DataTable"
import { FilterBar } from "@/components/overview/Filter-Bar/FilterBar"

const filters = [
  {
    label: "Invoice Date",
    options: ["All Dates", "Last 24 Hours", "Last Week", "Last Month"],
  },
  {
    label: "Payment Status",
    options: ["All Statuses", "Paid", "Unpaid", "Overdue"],
  },
  {
    label: "Client",
    options: ["All Clients", "New Clients", "Returning Clients"],
  },
  {
    label: "Property",
    options: ["All Properties", "Apartments", "Houses", "Commercial", "Land"],
  },
]

const breadcrumbs = [
  { label: "Invoices", href: "/invoices" },
  { label: "Overview", href: "/invoices/overview" },
]

const tableHeaders = ["Invoice Number", "Invoice Date", "Amount Due", "Amount Paid", "Due Date", "Payment Status", "Transactions", "Client", "Properties"]

export default function InvoicesPage() {
  const handleAdd = () => {
    console.log("Add invoice clicked")
    // Implement your add invoice logic here
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