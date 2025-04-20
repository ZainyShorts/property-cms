"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useRouter, useSearchParams } from "next/navigation"
import { Download, Filter, ChevronLeft, ChevronRight, Trash2, Edit, Info, Upload, Copy, Check } from "lucide-react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import { useSelector, useDispatch } from "react-redux"
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
import { ImportRecordsModal } from "./import-records/import-records"
import DocumentModal, { type DocumentData } from "@/components/overview/Data-Table/DocumentModal"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { FilterSidebar, type FilterValues } from "./filter-sidebar/filter-sidebar"
import { resetFilters } from "@/lib/store/slices/masterFilterSlice"
import { ExportModal } from "../units/Export-Modal/ExportModal"
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
  const filters = useSelector((state: any) => state.masterFilter)
  const dispatch = useDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get("page") || 1)
  const sortOrder = "desc"

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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [pageInputValue, setPageInputValue] = useState(currentPage.toString())
  const [activeFilters, setActiveFilters] = useState<FilterValues>({})
  const [copiedIds, setCopiedIds] = useState<Record<string, boolean>>({})
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [isAttachingDocument, setIsAttachingDocument] = useState(false)

  const tableHeaders = [
    { key: "_id", label: "ID" },
    { key: "roadLocation", label: "ROAD LOCATION" },
    { key: "developmentName", label: "DEVELOPMENT NAME" },
    { key: "locationQuality", label: "LOCATION QUALITY" },
    { key: "buaAreaSqFt", label: "BUA AREA (SQ FT)" },
    { key: "facilitiesAreaSqFt", label: "FACILITIES AREA (SQ FT)" },
    { key: "amentiesAreaSqFt", label: "AMENITIES AREA (SQ FT)" },
    { key: "totalAreaSqFt", label: "TOTAL AREA (SQ FT)" },
    { key: "facilitiesCategories", label: "FACILITIES" },
    { key: "amentiesCategories", label: "AMENITIES" },
    { key: "attachDocument", label: "DOCUMENT" },
    { key: "edit", label: "EDIT" },
    { key: "delete", label: "DELETE" },
  ]

  useEffect(() => {
    fetchRecords()
  }, [currentPage, sortOrder])

  useEffect(() => {
    setPageInputValue(currentPage.toString())
  }, [currentPage])

  const fetchRecords = async () => {
    setLoading(true)
    try {
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

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return

    const params = new URLSearchParams(searchParams)
    params.set("page", page.toString())
    router.push(`/master-development?${params.toString()}`)
  }

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value)
  }

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const page = Number.parseInt(pageInputValue)
    if (!isNaN(page) && page >= 1 && page <= pagination.totalPages) {
      handlePageChange(page)
    } else {
      setPageInputValue(currentPage.toString())
    }
  }

  const handleSortChange = async (value: string) => {
    setLoading(true)
    const response = await axios.get<ApiResponse>(
      `${process.env.NEXT_PUBLIC_CMS_SERVER}/masterDevelopment?sortBy=${value})}`,
    )
    setLoading(false)

    setRecords(response.data.data)
    setPagination({
      totalCount: response.data.totalCount,
      totalPages: response.data.totalPages,
      pageNumber: response.data.pageNumber,
    })
  }

  const handleResetFilters = () => {
    dispatch(resetFilters())
    setStartDate(null)
    setEndDate(null)
    fetchRecords()
    toast.success("Filters have been reset")
  }

  const isEmpty = (value: any): boolean => {
    if (value === undefined || value === null) return true
    if (typeof value === "string") return value.trim() === ""
    if (typeof value === "object") {
      if (Array.isArray(value)) return value.length === 0
      return Object.keys(value).length === 0 || Object.values(value).every(isEmpty)
    }
    return false
  }

  const cleanObject = (obj: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {}

    Object.entries(obj).forEach(([key, value]) => {
      if (!isEmpty(value)) {
        if (typeof value === "object" && value !== null && !(value instanceof Date) && !Array.isArray(value)) {
          const cleanedValue = cleanObject(value)
          if (Object.keys(cleanedValue).length > 0) {
            result[key] = cleanedValue
          }
        } else {
          result[key] = value
        }
      }
    })

    return result
  }

  const applyFilters = () => {
    setLoading(true)
    try {
      // Create a filter object with all possible filters
      const allFilters: Record<string, any> = {
        developmentName: filters.developmentName,
        roadLocation: filters.roadLocation,
        locationQuality: filters.locationQuality,
        buaAreaSqFtRange: filters.buaAreaSqFtRange,
        totalAreaSqFtRange: filters.totalAreaSqFtRange,
        facilitiesCategories: filters.facilitiesCategories,
        amentiesCategories: filters.amentiesCategories,
      }

      // Clean the filter object to remove empty values
      const cleanedFilters = cleanObject(allFilters)

      // Log the cleaned filters
      console.log("Applying filters:", cleanedFilters)

      // Create the request data object with only non-empty values
      const requestData: Record<string, any> = {
        page: currentPage,
        sort: sortOrder,
        ...cleanedFilters,
      }

      // Add date filters from the page component
      if (startDate) {
        // Format start date to beginning of the day
        const formattedStartDate = new Date(startDate)
        formattedStartDate.setHours(0, 0, 0, 0)
        requestData.startDate = formattedStartDate.toISOString()
        console.log("Start date:", requestData.startDate)
      }

      if (endDate) {
        // Format end date to end of the day (23:59:59.999)
        const formattedEndDate = new Date(endDate)
        formattedEndDate.setHours(23, 59, 59, 999)
        requestData.endDate = formattedEndDate.toISOString()
        console.log("End date:", requestData.endDate)
      }

      // Log the final request data
      console.log("API request data:", requestData)

      // Convert the request data to URL parameters
      const params = new URLSearchParams()

      // Add basic params
      params.append("page", requestData.page.toString())
      params.append("sort", requestData.sort)

      // Add string filters
      if (requestData.developmentName) params.append("developmentName", requestData.developmentName)
      if (requestData.roadLocation) params.append("roadLocation", requestData.roadLocation)
      if (requestData.locationQuality) params.append("locationQuality", requestData.locationQuality)

      // Add range objects as JSON strings
      if (requestData.buaAreaSqFtRange) {
        params.append("buaAreaSqFtRange", JSON.stringify(requestData.buaAreaSqFtRange))
      }

      if (requestData.totalAreaSqFtRange) {
        params.append("totalAreaSqFtRange", JSON.stringify(requestData.totalAreaSqFtRange))
      }

      // Add array filters
      if (requestData.facilitiesCategories && requestData.facilitiesCategories.length > 0) {
        requestData.facilitiesCategories.forEach((facility: string) => {
          params.append("facilitiesCategories", facility)
        })
      }

      if (requestData.amentiesCategories && requestData.amentiesCategories.length > 0) {
        requestData.amentiesCategories.forEach((amenity: string) => {
          params.append("amentiesCategories", amenity)
        })
      }

      // Add date filters
      if (requestData.startDate) params.append("startDate", requestData.startDate)
      if (requestData.endDate) params.append("endDate", requestData.endDate)

      console.log("API params:", params.toString())

      // Directly call the API with the filter parameters
      axios
        .get<ApiResponse>(`${process.env.NEXT_PUBLIC_CMS_SERVER}/masterDevelopment?${params.toString()}`)
        .then((response) => {
          setRecords(response.data.data)
          setPagination({
            totalCount: response.data.totalCount,
            totalPages: response.data.totalPages,
            pageNumber: response.data.pageNumber,
          })
          console.log("API response:", response.data)
        })
        .catch((error) => {
          console.error("Error fetching records:", error)
          toast.error("Failed to fetch records. Please try again.")
        })
        .finally(() => {
          setLoading(false)
        })
    } catch (error) {
      console.error("Error applying filters:", error)
      toast.error("Failed to apply filters. Please try again.")
      setLoading(false)
    }
  }

  // Handle copy ID
  const handleCopyId = (id: string) => {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        setCopiedIds({ ...copiedIds, [id]: true })
        toast.success("ID copied to clipboard")

        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopiedIds((prev) => {
            const newState = { ...prev }
            delete newState[id]
            return newState
          })
        }, 2000)
      })
      .catch((error) => {
        console.error("Error copying ID:", error)
        toast.error("Failed to copy ID")
      })
  }

  const handleEditRecord = (record: MasterDevelopment) => {
    setEditRecord(record)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (recordId: string) => {
    setRecordToDelete(recordId)
    setIsDeleteModalOpen(true)
  }

  const handleAttachDocument = (recordId: string) => {
    setSelectedRowId(recordId)
    setIsDocumentModalOpen(true)
  }

  const handleDocumentSave = async (documentData: DocumentData) => {
    setIsAttachingDocument(true)

    try {
      console.log("Document data to save:", documentData)

      const response = await axios.post(`${process.env.NEXT_PUBLIC_CMS_SERVER}/document/attachDocument`, documentData)
       console.log(response);
      toast.success("Document attached successfully")

      setIsDocumentModalOpen(false)
      setSelectedRowId(null)

    } catch (error) {
      console.error("Error attaching document:", error)
      toast.error("Failed to attach document. Please try again.")
    } finally {
      setIsAttachingDocument(false)
    }
  }

  const handleExport = () => {
    setIsExportModalOpen(true)
  }

  const handleSubmitExport = async (withFilters: boolean, count: number) => {
    setIsExportModalOpen(false)

    try {
      const toastId = toast.loading("Preparing export...")

      const params = new URLSearchParams()
      params.append("limit", count.toString())
      params.append("sortBy", sortOrder)

      if (withFilters) {
        const allFilters: Record<string, any> = {
          developmentName: filters.developmentName,
          roadLocation: filters.roadLocation,
          locationQuality: filters.locationQuality,
          buaAreaSqFtRange: filters.buaAreaSqFtRange,
          totalAreaSqFtRange: filters.totalAreaSqFtRange,
          facilitiesCategories: filters.facilitiesCategories,
          amentiesCategories: filters.amentiesCategories,
        }

        const cleanedFilters = cleanObject(allFilters)

        const requestData: Record<string, any> = {
          ...cleanedFilters,
        }

        if (startDate) {
          const formattedStartDate = new Date(startDate)
          formattedStartDate.setHours(0, 0, 0, 0)
          requestData.startDate = formattedStartDate.toISOString()
        }

        if (endDate) {
          const formattedEndDate = new Date(endDate)
          formattedEndDate.setHours(23, 59, 59, 999)
          requestData.endDate = formattedEndDate.toISOString()
        }

        if (requestData.developmentName) params.append("developmentName", requestData.developmentName)
        if (requestData.roadLocation) params.append("roadLocation", requestData.roadLocation)
        if (requestData.locationQuality) params.append("locationQuality", requestData.locationQuality)

        if (requestData.buaAreaSqFtRange) {
          if (requestData.buaAreaSqFtRange.min) {
            params.append("buaAreaSqFtMin", requestData.buaAreaSqFtRange.min.toString())
          }
          if (requestData.buaAreaSqFtRange.max) {
            params.append("buaAreaSqFtMax", requestData.buaAreaSqFtRange.max.toString())
          }
        }

        if (requestData.totalAreaSqFtRange) {
          if (requestData.totalAreaSqFtRange.min) {
            params.append("totalAreaSqFtMin", requestData.totalAreaSqFtRange.min.toString())
          }
          if (requestData.totalAreaSqFtRange.max) {
            params.append("totalAreaSqFtMax", requestData.totalAreaSqFtRange.max.toString())
          }
        }

        // Add array filters
        if (requestData.facilitiesCategories && requestData.facilitiesCategories.length > 0) {
          requestData.facilitiesCategories.forEach((facility: string) => {
            params.append("facilitiesCategories", facility)
          })
        }

        if (requestData.amentiesCategories && requestData.amentiesCategories.length > 0) {
          requestData.amentiesCategories.forEach((amenity: string) => {
            params.append("amentiesCategories", amenity)
          })
        }

        // Add date filters
        if (requestData.startDate) params.append("startDate", requestData.startDate)
        if (requestData.endDate) params.append("endDate", requestData.endDate)
      }

      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_CMS_SERVER}/masterDevelopment?${params.toString()}`,
      )

      const exportData = response.data.data

      let csvContent =
        "Road Location,Development Name,Location Quality,BUA Area (Sq Ft),Facilities Area (Sq Ft),Amenities Area (Sq Ft),Total Area (Sq Ft),Facilities Count,Amenities Count\n"

      exportData.forEach((record) => {
        const row = [
          record.roadLocation,
          record.developmentName,
          record.locationQuality,
          record.buaAreaSqFt,
          record.facilitiesAreaSqFt,
          record.amentiesAreaSqFt,
          record.totalAreaSqFt,
          record.facilitiesCategories.length,
          record.amentiesCategories.length,
        ]

        // Escape any commas in the text fields
        const escapedRow = row.map((field) => {
          if (typeof field === "string" && field.includes(",")) {
            return `"${field}"`
          }
          return field
        })

        csvContent += escapedRow.join(",") + "\n"
      })

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)

      link.setAttribute("href", url)
      link.setAttribute("download", `master-development-export-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.update(toastId, {
        render: `Export completed successfully (${exportData.length} records)`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast.error("Failed to export data. Please try again.")
    }
  }

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

  const renderCellContent = (record: MasterDevelopment, key: string) => {
    switch (key) {
      case "_id":
        return (
          <div className="flex items-center justify-center gap-2">
            <span>{record._id.substring(0, 8) + "..."}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                handleCopyId(record._id)
              }}
            >
              {copiedIds[record._id] ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        )
      case "buaAreaSqFt":
      case "facilitiesAreaSqFt":
      case "amentiesAreaSqFt":
      case "totalAreaSqFt":
        return record[key].toLocaleString()
      case "facilitiesCategories":
        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center justify-center gap-2 cursor-pointer">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                  {record.facilitiesCategories.length}
                </Badge>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0">
              <div className="p-4">
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
            </HoverCardContent>
          </HoverCard>
        )
      case "amentiesCategories":
        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center justify-center gap-2 cursor-pointer">
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200">
                  {record.amentiesCategories.length}
                </Badge>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0">
              <div className="p-4">
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
            </HoverCardContent>
          </HoverCard>
        )
      case "attachDocument":
        return (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
            onClick={() => handleAttachDocument(record._id)}
            disabled={isAttachingDocument}
          >
            <Upload className="h-4 w-4 mr-1" />
            Attach
          </Button>
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
            <Button variant="outline" className="gap-2" onClick={() => setIsImportModalOpen(true)}>
              <Upload size={18} />
              Import Records
            </Button>
            <Button variant="outline" onClick={handleExport} className="gap-2">
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
              <SelectItem value="desc">Newest</SelectItem>
              <SelectItem value="asc">Oldest</SelectItem>
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
            <Button variant="outline" size="icon" onClick={handleResetFilters}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
              onClick={applyFilters}
              disabled={loading}
            >
              {loading ? "Applying..." : "Apply Filters"}
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
                          header.key === "_id" && "w-[120px]",
                          header.key === "locationQuality" && "w-[150px]",
                          header.key === "buaAreaSqFt" && "w-[150px]",
                          header.key === "facilitiesAreaSqFt" && "w-[180px]",
                          header.key === "amentiesAreaSqFt" && "w-[180px]",
                          header.key === "totalAreaSqFt" && "w-[150px]",
                          header.key === "facilitiesCategories" && "w-[120px]",
                          header.key === "amentiesCategories" && "w-[120px]",
                          header.key === "attachDocument" && "w-[120px]",
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
      <FilterSidebar open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen} />
      <ImportRecordsModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onSubmitExport={handleSubmitExport}
      />

      {/* Document Modal */}
      <DocumentModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        rowId={selectedRowId}
        onDocumentSave={handleDocumentSave}
      />
    </div>
  )
}
