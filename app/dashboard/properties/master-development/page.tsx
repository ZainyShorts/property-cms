"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useRouter, useSearchParams } from "next/navigation"
import { Download, Filter, ChevronLeft, ChevronRight, Trash2, Edit, Info } from "lucide-react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { SimpleDatePicker } from "./date-picker/date-picker"
import { AddRecordModal } from "./add-record/addRecord"
import { Skeleton } from "@/components/ui/skeleton"
import { DeleteConfirmationModal } from "./delete-confirmation-modal"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { FilterSidebar, type FilterValues } from "./filter-sidebar/filter-sidebar"

export interface MasterDevelopment {
  _id: string
  roadLocation: string
  developmentName: string
  locationQuality: string
  buaAreaSqFt: number
  facilitiesAreaSqFt: number
  amentiesAreaSqFt: number
  totalAreaSqFt: number
  pictures: string[]
  facilitiesCategories: string[]
  amentiesCategories: string[]
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  data: MasterDevelopment[]
  totalCount: number
  totalPages: number
  pageNumber: number
}

export default function MasterDevelopmentPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get("page") || 1)
  const sortOrder = searchParams.get("sort") || "newest"

  const [records, setRecords] = useState<MasterDevelopment[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    pageNumber: 1,
  })
  const [editRecord, setEditRecord] = useState<MasterDevelopment | null>(null)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)
  const [pageInputValue, setPageInputValue] = useState(currentPage.toString())
  const [activeFilters, setActiveFilters] = useState<FilterValues>({})

  // Define table headers based on the object keys (excluding some fields)
  const tableHeaders = [
    { key: "_id", label: "ID" },
    { key: "roadLocation", label: "ROAD LOCATION" },
    { key: "developmentName", label: "DEVELOPMENT NAME" },
    { key: "locationQuality", label: "LOCATION QUALITY" },
    { key: "totalAreaSqFt", label: "TOTAL AREA (SQ FT)" },
    { key: "categories", label: "FACILITIES & AMENITIES" }, // Keep combined column with hover
    { key: "edit", label: "EDIT" }, // Separate column for edit
    { key: "delete", label: "DELETE" }, // Separate column for delete
  ]

  // Fetch records from API
  useEffect(() => {
    fetchRecords()
  }, [currentPage, sortOrder])

  // Update page input value when currentPage changes
  useEffect(() => {
    setPageInputValue(currentPage.toString())
  }, [currentPage])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      // Build query parameters
      const params = new URLSearchParams()
      params.append("page", currentPage.toString())
      params.append("sort", sortOrder)

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      if (startDate) {
        params.append("startDate", startDate.toISOString())
      }

      if (endDate) {
        params.append("endDate", endDate.toISOString())
      }

      // Add filter parameters
      if (activeFilters.roadLocation) {
        params.append("roadLocation", activeFilters.roadLocation)
      }

      if (activeFilters.developmentName) {
        params.append("developmentName", activeFilters.developmentName)
      }

      if (activeFilters.locationQuality) {
        params.append("locationQuality", activeFilters.locationQuality)
      }

      if (activeFilters.buaAreaSqFtRange?.min) {
        params.append("buaAreaSqFtMin", activeFilters.buaAreaSqFtRange.min.toString())
      }

      if (activeFilters.buaAreaSqFtRange?.max) {
        params.append("buaAreaSqFtMax", activeFilters.buaAreaSqFtRange.max.toString())
      }

      if (activeFilters.totalAreaSqFtRange?.min) {
        params.append("totalAreaSqFtMin", activeFilters.totalAreaSqFtRange.min.toString())
      }

      if (activeFilters.totalAreaSqFtRange?.max) {
        params.append("totalAreaSqFtMax", activeFilters.totalAreaSqFtRange.max.toString())
      }

      if (activeFilters.facilitiesCategories?.length) {
        activeFilters.facilitiesCategories.forEach((facility) => {
          params.append("facilitiesCategories", facility)
        })
      }

      if (activeFilters.amentiesCategories?.length) {
        activeFilters.amentiesCategories.forEach((amenity) => {
          params.append("amentiesCategories", amenity)
        })
      }

      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_CMS_SERVER}/masterDevelopment?${params.toString()}`,
      )

      setRecords(response.data.data)
      setPagination({
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        pageNumber: response.data.pageNumber,
      })
    } catch (error) {
      console.error("Error fetching records:", error)
      toast.error("Failed to fetch records. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return

    const params = new URLSearchParams(searchParams)
    params.set("page", page.toString())
    router.push(`/master-development?${params.toString()}`)
  }

  // Handle page input change
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value)
  }

  // Handle page input submit
  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const page = Number.parseInt(pageInputValue)
    if (!isNaN(page) && page >= 1 && page <= pagination.totalPages) {
      handlePageChange(page)
    } else {
      setPageInputValue(currentPage.toString())
    }
  }

  // Handle sort change
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("sort", value)
    params.delete("page") // Reset to page 1 when sorting changes
    router.push(`/master-development?${params.toString()}`)
  }

  // Handle search
  const handleSearch = () => {
    fetchRecords()
  }

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams)
    params.delete("page") // Reset to page 1 when filters change
    router.push(`/master-development?${params.toString()}`)
    fetchRecords()
  }

  // Handle filter application
  const handleApplyFilters = (filters: FilterValues) => {
    setActiveFilters(filters)
    const params = new URLSearchParams(searchParams)
    params.delete("page") // Reset to page 1 when filters change
    router.push(`/master-development?${params.toString()}`)
    fetchRecords()
  }

  // Handle edit record
  const handleEditRecord = (record: MasterDevelopment) => {
    setEditRecord(record)
    setIsModalOpen(true)
  }

  // Handle delete record
  const handleDeleteClick = (recordId: string) => {
    setRecordToDelete(recordId)
    setIsDeleteModalOpen(true)
  }

  // Confirm delete record
  const confirmDelete = async () => {
    if (!recordToDelete) return

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_CMS_SERVER}/masterDevelopment/${recordToDelete}`)
      toast.success("Record deleted successfully")
      fetchRecords() // Refresh the list
    } catch (error: any) {
      console.error("Error deleting record:", error)
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || "Failed to delete record")
      } else {
        toast.error("Failed to delete record. Please try again.")
      }
    } finally {
      setRecordToDelete(null)
      setIsDeleteModalOpen(false)
    }
  }

  // Close modal and reset edit record
  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open)
    if (!open) {
      setEditRecord(null)
    }
  }

  // Render cell content based on key
  const renderCellContent = (record: MasterDevelopment, key: string) => {
    switch (key) {
      case "_id":
        return record._id.substring(0, 8) + "..."
      case "totalAreaSqFt":
        return record.totalAreaSqFt.toLocaleString()
      case "categories":
        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center justify-center gap-2 cursor-pointer">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                  F: {record.facilitiesCategories.length}
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200">
                  A: {record.amentiesCategories.length}
                </Badge>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0">
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Facilities ({record.facilitiesCategories.length})
                  </h4>
                  {record.facilitiesCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {record.facilitiesCategories.map((facility, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No facilities</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Amenities ({record.amentiesCategories.length})
                  </h4>
                  {record.amentiesCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {record.amentiesCategories.map((amenity, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200"
                        >
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No amenities</p>
                  )}
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        )
      case "edit":
        return (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => handleEditRecord(record)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )
      case "delete":
        return (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={() => handleDeleteClick(record._id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )
      default:
        return record[key as keyof MasterDevelopment]
    }
  }

  return (
    <div className="min-h-screen w-full">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Properties</h2>
            <span className="text-muted-foreground">&gt;</span>
            <h2 className="text-lg font-semibold">Overview</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="gap-2">
              <Download size={18} />
              Export
            </Button>
            <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
              <DialogTrigger asChild>
                <Button className="gap-2">Add record</Button>
              </DialogTrigger>
              <AddRecordModal setIsModalOpen={handleModalClose} editRecord={editRecord} onRecordSaved={fetchRecords} />
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select defaultValue={sortOrder} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>

          <SimpleDatePicker placeholder="Start Date" date={startDate} setDate={setStartDate} />

          <SimpleDatePicker placeholder="End Date" date={endDate} setDate={setEndDate} />

          <div className="flex-1 flex justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFilterSidebarOpen(true)}
              className={cn(
                Object.keys(activeFilters).some((key) =>
                  Array.isArray(activeFilters[key as keyof FilterValues])
                    ? (activeFilters[key as keyof FilterValues] as any[]).length > 0
                    : !!activeFilters[key as keyof FilterValues],
                ) && "bg-blue-50 text-blue-700 border-blue-200",
              )}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
              onClick={applyFilters}
            >
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {tableHeaders.map((header) => (
                      <TableHead
                        key={header.key}
                        className={cn(
                          "whitespace-nowrap text-center",
                          header.key === "_id" && "w-[80px]",
                          header.key === "locationQuality" && "w-[150px]",
                          header.key === "totalAreaSqFt" && "w-[150px]",
                          header.key === "categories" && "w-[180px]",
                          header.key === "edit" && "w-[100px]",
                          header.key === "delete" && "w-[100px]",
                        )}
                      >
                        {header.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Loading skeleton
                    Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <TableRow key={index}>
                          {tableHeaders.map((header) => (
                            <TableCell key={`${index}-${header.key}`}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                  ) : records.length > 0 ? (
                    records.map((record) => (
                      <TableRow key={record._id}>
                        {tableHeaders.map((header) => (
                          <TableCell key={`${record._id}-${header.key}`} className="text-center">
                            {renderCellContent(record, header.key)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={tableHeaders.length} className="text-center py-10">
                        Your records will be shown here
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination - Updated to match the image */}
            {pagination.totalPages > 0 && (
              <div className="flex items-center justify-center p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                    disabled={pagination.pageNumber === 1}
                    className="h-9 w-9 rounded-md"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Input
                        type="text"
                        value={pageInputValue}
                        onChange={handlePageInputChange}
                        className="h-9 w-12 text-center rounded-md"
                        aria-label="Page number"
                      />
                    </div>

                    <span className="text-sm text-muted-foreground">...</span>

                    <div className="flex items-center">
                      <div className="h-9 px-3 flex items-center justify-center border rounded-md bg-muted/50">
                        {pagination.totalPages}
                      </div>
                    </div>
                  </form>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                    disabled={pagination.pageNumber === pagination.totalPages}
                    className="h-9 w-9 rounded-md"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <div className="text-sm text-muted-foreground ml-2">
                    Page {pagination.pageNumber} of {pagination.totalPages}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />

      {/* Filter Sidebar */}
      <FilterSidebar
        open={isFilterSidebarOpen}
        onOpenChange={setIsFilterSidebarOpen}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  )
}
