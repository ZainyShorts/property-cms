"use client"

import { DataTable } from "@/components/overview/Data-Table/DataTable"
import { FilterBar } from "@/components/overview/Filter-Bar/FilterBar"

const filters = [
  {
    label: "Document Type",
    options: ["All Documents", "Contracts", "Agreements", "Invoices", "Reports"],
  },
  {
    label: "Upload Date",
    options: ["All Dates", "Last 24 Hours", "Last Week", "Last Month"],
  },
  {
    label: "Related Property",
    options: ["All Properties", "Apartments", "Houses", "Commercial", "Land"],
  },
  {
    label: "Related Transaction",
    options: ["All Transactions", "Completed", "Pending", "Failed"],
  },
  {
    label: "Listings",
    options: ["All Listings", "Active Listings", "Sold Listings", "Pending Listings"],
  },
]

const breadcrumbs = [
  { label: "Documents", href: "/documents" },
  { label: "Overview", href: "/documents/overview" },
]

const tableHeaders = ["Document ID", "Document Name", "Doc Type", "Upload Date", "Related Property", "Related Transaction", "Document File", "Listings"]

const tableData = [
  { id: "DOC001", name: "Lease Agreement", type: "Agreement", date: "2025-02-10", property: "Apartment", transaction: "Completed", file: "lease_agreement.pdf", listings: "Active Listings" },
  { id: "DOC002", name: "Sale Contract", type: "Contract", date: "2025-02-11", property: "House", transaction: "Pending", file: "sale_contract.pdf", listings: "Sold Listings" },
  { id: "DOC003", name: "Inspection Report", type: "Report", date: "2025-02-12", property: "Commercial", transaction: "Failed", file: "inspection_report.pdf", listings: "Pending Listings" },
]

export default function DocumentsPage() {
  const handleAdd = () => {
    console.log("Add document clicked")
    // Implement your add document logic here
  }

  return (
    <div className="min-h-screen bg-background">
      <FilterBar filters={filters} breadcrumbs={breadcrumbs} onAddButton={handleAdd} />
      <main className="container mx-auto px-4 py-6">
        <DataTable headers={tableHeaders} data={tableData} onAddButton={handleAdd} />
      </main>
    </div>
  )
}
