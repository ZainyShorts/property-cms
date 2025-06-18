"use client"

// import { DataTable } from "@/components/overview/Data-Table/DataTable"
import { FilterBar } from "@/components/overview/Filter-Bar/FilterBar"

const filters = [
  {
    label: "Rating",
    options: ["All Ratings", "1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
  },
  {
    label: "Review Date",
    options: ["All Dates", "Last 24 Hours", "Last Week", "Last Month"],
  },
  {
    label: "Property Reviewed",
    options: ["All Properties", "Apartments", "Houses", "Commercial", "Land"],
  },
  {
    label: "Agent Reviewed",
    options: ["All Agents", "Top Rated Agents", "Recently Reviewed"],
  },
  {
    label: "Overall Experience",
    options: ["All Experiences", "Excellent", "Good", "Average", "Poor"],
  },
]

const breadcrumbs = [
  { label: "Reviews", href: "/reviews" },
  { label: "Overview", href: "/reviews/overview" },
]

const tableHeaders = ["Review ID", "Client Feedback", "Rating", "Review Date", "Property Reviewed", "Agent Reviewed", "Overall Experience", "Clients"]

const tableData = [
  { id: "REV001", feedback: "Great service!", rating: "5 Stars", date: "2025-02-10", property: "Apartment", agent: "John Doe", experience: "Excellent", client: "Alice Smith" },
  { id: "REV002", feedback: "Average experience.", rating: "3 Stars", date: "2025-02-11", property: "House", agent: "Jane Doe", experience: "Average", client: "Bob Johnson" },
  { id: "REV003", feedback: "Not satisfied.", rating: "2 Stars", date: "2025-02-12", property: "Commercial", agent: "Mike Brown", experience: "Poor", client: "Charlie Davis" },
]

export default function ReviewsPage() {
  const handleAdd = () => {
    console.log("Add review clicked")
    // Implement your add review logic here
  }

  return (
    <div className="min-h-screen bg-background">
      <FilterBar filters={filters} breadcrumbs={breadcrumbs} onAddButton={handleAdd} />
      <main className="container mx-auto px-4 py-6">
        {/* <DataTable headers={tableHeaders} data={tableData} onAddButton={handleAdd} /> */}
      </main>
    </div>
  )
}