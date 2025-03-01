"use client"

import { DataTable } from "@/components/overview/Data-Table/DataTable"
import { FilterBar } from "@/components/overview/Filter-Bar/FilterBar"

const filters = [
  {
    label: "Appointment Status",
    options: ["All Appointments", "Scheduled", "Completed", "Canceled"],
  },
  {
    label: "Date Range",
    options: ["All Dates", "Today", "This Week", "This Month"],
  },
  {
    label: "Time Slot",
    options: ["All Times", "Morning", "Afternoon", "Evening"],
  },
  {
    label: "Agent",
    options: ["All Agents", "Top Performers", "Recently Added"],
  },
  {
    label: "Client",
    options: ["All Clients", "Returning Clients", "New Clients"],
  },
  {
    label: "Property Type",
    options: ["All Properties", "Apartments", "Houses", "Commercial", "Land"],
  },
]

const breadcrumbs = [
  { label: "Appointments", href: "/appointments" },
  { label: "Overview", href: "/appointments/overview" },
]

const tableHeaders = ["Appointment ID", "Date", "Time", "Agent", "Client", "Property", "Status", "Notes"]

const tableData = [
  { id: "APT001", date: "2025-02-12", time: "10:00 AM", agent: "John Doe", client: "Alice Smith", property: "Apartment", status: "Scheduled", notes: "Client prefers morning." },
  { id: "APT002", date: "2025-02-13", time: "2:00 PM", agent: "Sarah Lee", client: "Bob Johnson", property: "House", status: "Completed", notes: "Inspection completed." },
  { id: "APT003", date: "2025-02-14", time: "4:30 PM", agent: "Michael Brown", client: "Charlie Davis", property: "Commercial", status: "Canceled", notes: "Client rescheduled." },
  { id: "APT004", date: "2025-02-15", time: "11:00 AM", agent: "Emma Wilson", client: "David Miller", property: "Land", status: "Scheduled", notes: "Client requested more details." },
  { id: "APT005", date: "2025-02-16", time: "3:15 PM", agent: "James Anderson", client: "Eve Carter", property: "Apartment", status: "Completed", notes: "Deal finalized." },
  { id: "APT006", date: "2025-02-17", time: "9:00 AM", agent: "Sophia Martinez", client: "Frank White", property: "House", status: "Scheduled", notes: "Needs further negotiation." },
  { id: "APT007", date: "2025-02-18", time: "12:45 PM", agent: "William Johnson", client: "Grace Evans", property: "Commercial", status: "Completed", notes: "Paperwork submitted." },
  { id: "APT008", date: "2025-02-19", time: "5:00 PM", agent: "Olivia Thomas", client: "Henry Scott", property: "Land", status: "Canceled", notes: "Client not interested anymore." },
  { id: "APT009", date: "2025-02-20", time: "10:30 AM", agent: "Liam Harris", client: "Ivy Green", property: "House", status: "Scheduled", notes: "Waiting for bank approval." },
  { id: "APT010", date: "2025-02-21", time: "2:30 PM", agent: "Emily Clark", client: "Jack Nelson", property: "Apartment", status: "Completed", notes: "Signed contract." },
]

export default function AppointmentsPage() {
  const handleAdd = () => {
    console.log("Add appointment clicked")
    // Implement your add appointment logic here
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