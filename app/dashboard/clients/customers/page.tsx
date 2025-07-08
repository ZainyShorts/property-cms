"use client"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import type React from "react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
  Upload,
  Copy,
  Eye,
  Check,
  ArrowLeft,
  Settings,
  ChevronDown,
} from "lucide-react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { SimpleDatePicker } from "./simple-date-picker/date-picker"
import { AddCustomerModal } from "./add-customer-modal/add-customer-modal"
import { CustomerFilterSidebar } from "./filter-sidebar/customer-filter-sidebar"
import useSWR from "swr"
import { ImportCustomersModal } from "./import-modal/import-modal"

interface ApiResponse {
  message: string
  meta: {
    total: number
    page: number
    limit: number
    sortBy: string
    sortOrder: string
    totalPages: number
  }
  data: Customer[]
}

export enum CustomerSegment {
  Customer = "Customer",
  Supplier = "Supplier",
}

export enum CustomerCategory {
  Organisation = "Organisation",
  Individual = "Individual",
}

export enum CustomerSubCategory {
  EndUser = "End User",
  Investor = "Investor",
}

export interface Customer {
  _id: string
  customerSegment: string
  customerCategory: string
  customerSubCategory: string
  customerType: string
  customerSubType: string
  customerBusinessSector: string
  customerNationality: string
  customerName: string
  contactPerson: string
  customerDepartment: string
  customerDesignation: string
  telOffice: string
  tellDirect: string
  emailAddress: string
  mobile1: string
  mobile2: string
  webAddress: string
  officeLocation: string
  createdAt: string
  updatedAt: string
}

const tableHeaders = [
  { key: "index", label: "INDEX" },
  { key: "_id", label: "ID" },
  { key: "customerSegment", label: "CUSTOMER SEGMENT" },
  { key: "customerCategory", label: "CUSTOMER CATEGORY" },
  { key: "customerSubCategory", label: "CUSTOMER SUB CATEGORY" },
  { key: "customerType", label: "CUSTOMER TYPE" },
  { key: "customerSubType", label: "CUSTOMER SUB TYPE" },
  { key: "customerBusinessSector", label: "BUSINESS SECTOR" },
  { key: "customerNationality", label: "NATIONALITY" },
  { key: "customerName", label: "CUSTOMER NAME" },
  { key: "contactPerson", label: "CONTACT PERSON" },
  { key: "customerDepartment", label: "DEPARTMENT" },
  { key: "customerDesignation", label: "DESIGNATION" },
  { key: "telOffice", label: "TEL OFFICE" },
  { key: "tellDirect", label: "TEL DIRECT" },
  { key: "emailAddress", label: "Email Address" },
  { key: "mobile1", label: "MOBILE 1" },
  { key: "mobile2", label: "MOBILE 2" },
  { key: "webAddress", label: "WEB ADDRESS" },
  { key: "officeLocation", label: "OFFICE LOCATION" },
  { key: "edit", label: "EDIT" },
  { key: "delete", label: "DELETE" },
]

const customerCategory = [
  "index",
  "_id",
  "customerSegment",
  "customerCategory",
  "customerSubCategory",
  "customerType",
  "customerSubType",
  "customerBusinessSector",
  "customerNationality",
]
const customerContactDetails = [
  "contactPerson",
  "customerDepartment",
  "customerDesignation",
  "telOffice",
  "tellDirect",
  "emailAddress",
  "mobile1",
  "mobile2",
  "webAddress",
  "officeLocation",
]
const actions = ["edit", "delete"]

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`)
  }
  return res.json() as Promise<T>
}

export interface CustomerFilters {
  customerSegment: string
  customerCategory: string
  customerSubCategory: string
  customerType: string[]
  customerSubType: string[]
  customerBusinessSector: string
  customerNationality: string
  customerName: string
  contactPerson: string
  emailAddress: string
  mobile1: string
  startDate: Date | undefined
  endDate: Date | undefined
}

export default function CustomerPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [sortOrder, setSortOrder] = useState("desc")
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [records, setRecords] = useState<Customer[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    pageNumber: 1,
  })
  const [editRecord, setEditRecord] = useState<Customer | null>(null)
  const [pageInputValue, setPageInputValue] = useState(String(currentPage))
  const [copiedIds, setCopiedIds] = useState<Record<string, boolean>>({})
  const [selectedRecordsCache, setSelectedRecordsCache] = useState<any>({})
  const [currentIndex, setCurrentIndex] = useState(1)
  const [startingIndex, setStartingIndex] = useState(0)
  const [selectedColumns, setSelectedColumns] = useState<any[]>([])
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    tableHeaders.reduce((acc, header) => ({ ...acc, [header.key]: true }), {}),
  )
  const [limit, setLimit] = useState<number>(10)
  const [selectedRowsMap, setSelectedRowsMap] = useState<Record<string, boolean>>({})
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Filter sidebar state
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [filters, setFilters] = useState<CustomerFilters>({
    customerSegment: "",
    customerCategory: "",
    customerSubCategory: "",
    customerType: [],
    customerSubType: [],
    customerBusinessSector: "",
    customerNationality: "",
    customerName: "",
    contactPerson: "",
    emailAddress: "",
    mobile1: "",
    startDate: undefined,
    endDate: undefined,
  })

  const { data, error } = useSWR<any>("/api/me", fetcher)

  useEffect(() => {
    if (data) console.log("data →", data)
    if (error) console.error("error →", error)
  }, [data, error])

  useEffect(() => {
    if (data) {
      fetchRecords()
    }
  }, [sortOrder, limit, data])

  useEffect(() => {
    setPageInputValue(String(currentPage))
    setStartingIndex((currentPage - 1) * limit)
  }, [currentPage, limit])

  useEffect(() => {
    const newCache = { ...selectedRecordsCache }
    records.forEach((record) => {
      if (selectedRowsMap[record._id]) {
        newCache[record._id] = record
      } else {
        delete newCache[record._id]
      }
    })
    setSelectedRecordsCache(newCache)
  }, [selectedRowsMap, records])

  useEffect(() => {
    setSelectedRows(Object.keys(selectedRowsMap).filter((id) => selectedRowsMap[id]))
  }, [selectedRowsMap])

  const buildFilterParams = (params: URLSearchParams, filtersToApply: CustomerFilters) => {
    // Text filters
    if (filtersToApply.customerName) {
      params.append("customerName", filtersToApply.customerName)
    }
    if (filtersToApply.contactPerson) {
      params.append("contactPerson", filtersToApply.contactPerson)
    }
    if (filtersToApply.emailAddress) {
      params.append("emailAddress", filtersToApply.emailAddress)
    }
    if (filtersToApply.mobile1) {
      params.append("mobile1", filtersToApply.mobile1)
    }

    // Select filters
    if (filtersToApply.customerSegment) {
      params.append("customerSegment", filtersToApply.customerSegment)
    }
    if (filtersToApply.customerCategory) {
      params.append("customerCategory", filtersToApply.customerCategory)
    }
    if (filtersToApply.customerSubCategory) {
      params.append("customerSubCategory", filtersToApply.customerSubCategory)
    }
    if (filtersToApply.customerBusinessSector) {
      params.append("customerBusinessSector", filtersToApply.customerBusinessSector)
    }
    if (filtersToApply.customerNationality) {
      params.append("customerNationality", filtersToApply.customerNationality)
    }

    // Array filters
    if (filtersToApply.customerType && filtersToApply.customerType.length > 0) {
      filtersToApply.customerType.forEach((type) => {
        params.append("customerType", type)
      })
    }
    if (filtersToApply.customerSubType && filtersToApply.customerSubType.length > 0) {
      filtersToApply.customerSubType.forEach((subType) => {
        params.append("customerSubType", subType)
      })
    }

    // Date filters
    if (filtersToApply.startDate) {
      params.append("startDate", filtersToApply.startDate.toISOString())
    }
    if (filtersToApply.endDate) {
      params.append("endDate", filtersToApply.endDate.toISOString())
    }
  }

  const fetchRecords = async (reset?: boolean, page?: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const targetPage = page || currentPage

      params.append("page", String(targetPage))
      params.append("sortOrder", String(sortOrder))
      params.append("limit", String(limit))

      if (!reset) {
        // Apply sidebar filters
        buildFilterParams(params, filters)

        // Apply legacy date filters if no sidebar date filters
        if (!filters.startDate && startDate) {
          params.append("startDate", startDate.toISOString())
        }
        if (!filters.endDate && endDate) {
          params.append("endDate", endDate.toISOString())
        }
      }

      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_CMS_SERVER}/customer?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${data?.token}`,
          },
        },
      )

      console.log("response", response)
      setRecords(response.data.data)
      setPagination({
        totalCount: response.data.meta.total,
        totalPages: response.data.meta.totalPages,
        pageNumber: response.data.meta.page,
      })

      // Update current page to match the response
      setCurrentPage(response.data.meta.page)
    } catch (error) {
      console.error("Error fetching records:", error)
      toast.error("Failed to fetch records. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return
    setCurrentPage(page)
    fetchRecords(false, page)
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
    setSortOrder(value)

    const params = new URLSearchParams()
    params.append("page", "1") // Reset to page 1 when sorting
    params.append("sortOrder", String(value))
    params.append("limit", String(limit))
    buildFilterParams(params, filters)

    try {
      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_CMS_SERVER}/customer?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${data?.token}`,
          },
        },
      )

      setRecords(response.data.data)
      setPagination({
        totalCount: response.data.meta.total,
        totalPages: response.data.meta.totalPages,
        pageNumber: response.data.meta.page,
      })
      setCurrentPage(1) // Reset to page 1 when sorting
    } catch (error) {
      console.error("Error fetching records:", error)
      toast.error("Failed to fetch records. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLimitChange = (value: string) => {
    setLimit(Number(value))
    setCurrentPage(1) // Reset to page 1 when changing limit
  }

  const handleResetFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setFilters({
      customerSegment: "",
      customerCategory: "",
      customerSubCategory: "",
      customerType: [],
      customerSubType: [],
      customerBusinessSector: "",
      customerNationality: "",
      customerName: "",
      contactPerson: "",
      emailAddress: "",
      mobile1: "",
      startDate: undefined,
      endDate: undefined,
    })
    setCurrentPage(1) // Reset to page 1 when clearing filters
    fetchRecords(true, 1)
  }

  const applyFilters = () => {
    setCurrentPage(1) // Reset to page 1 when applying filters
    fetchRecords(false, 1)
  }

  const handleCopyId = (id: string) => {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        setCopiedIds({ ...copiedIds, [id]: true })
        toast.success("ID copied to clipboard")
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

  const handleEditRecord = (record: Customer) => {
    setEditRecord(record)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (recordId: string) => {
    toast.info("Delete functionality to be implemented")
  }

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open)
    if (!open) {
      setEditRecord(null)
    }
  }

  const [checkState, setCheckState] = useState<any>("all")
  const [showHeaderCategories, setShowHeaderCategories] = useState(false)

  const toggleColumnVisibility = (columnKey: string, headers?: any) => {
    if (headers) {
      if (headers === "customerCategory") {
        setCheckState("customerCategory")
        setVisibleColumns((prev) => {
          const updated = Object.keys(prev).reduce((acc: any, key) => {
            acc[key] = customerCategory.includes(key)
            return acc
          }, {})
          return updated
        })
      } else if (headers === "customerContactDetails") {
        setCheckState("customerContactDetails")
        setVisibleColumns((prev) => {
          const updated = Object.keys(prev).reduce((acc: any, key) => {
            acc[key] = customerContactDetails.includes(key)
            return acc
          }, {})
          return updated
        })
      } else if (headers === "actions") {
        setCheckState("actions")
        setVisibleColumns((prev) => {
          const updated = Object.keys(prev).reduce((acc: any, key) => {
            acc[key] = actions.includes(key)
            return acc
          }, {})
          return updated
        })
      } else if (headers === "all") {
        setCheckState("all")
        setVisibleColumns((prev) => {
          const updated = Object.keys(prev).reduce(
            (acc, key) => {
              acc[key] = true
              return acc
            },
            {} as Record<string, boolean>,
          )
          return updated
        })
      }
    } else {
      setVisibleColumns((prev) => ({
        ...prev,
        [columnKey]: !prev[columnKey],
      }))
    }
  }

  const renderCellContent = (record: Customer, key: string, index: number) => {
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
      case "index":
        return <div className="flex justify-center">{startingIndex + index + 1}</div>
      case "view":
        return (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 bg-transparent"
              onClick={() => window.open(`/customer-details/${record._id}`, "_blank")}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        )
      case "webAddress":
        return record.webAddress ? (
          <a
            href={record.webAddress.startsWith("http") ? record.webAddress : `https://${record.webAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {record.webAddress}
          </a>
        ) : (
          "-"
        )
      case "edit":
        return (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 bg-transparent"
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
            className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 bg-transparent"
            onClick={() => handleDeleteClick(record._id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )
      default:
        return record[key as keyof Customer] || "-"
    }
  }

  const [mounted, setMounted] = useState<any>(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const toggleRow = (id: any) => {
    setSelectedRowsMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const toggleColumns = (columnKey: any) => {
    setSelectedColumns((prev) =>
      prev.includes(columnKey) ? prev.filter((key) => key != columnKey) : [...prev, columnKey],
    )
  }

  const selectAllRows = () => {
    const newSelectedRowsMap = { ...selectedRowsMap }
    records.forEach((record) => {
      newSelectedRowsMap[record._id] = true
    })
    setSelectedRowsMap(newSelectedRowsMap)
  }

  const selectAllColumns = () => {
    setSelectedColumns(tableHeaders.filter((header) => visibleColumns[header.key]).map((header) => header.key))
  }

  const clearSelection = () => {
    setSelectedRowsMap({})
    setSelectedColumns([])
  }

  const exitSelectionMode = () => {
    setIsSelectionMode(false)
    clearSelection()
  }

  const isRowSelected = (id: any): boolean => {
    return !!selectedRowsMap[id]
  }

  return (
    <div className="min-h-screen w-full">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === "dark" ? "dark" : "light"}
      />

      {/* Filter Sidebar */}
      <CustomerFilterSidebar
        open={isFilterSidebarOpen}
        onOpenChange={setIsFilterSidebarOpen}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <div className="border-b">
        <div className="flex h-16 items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Customers</h2>
            <span className="text-muted-foreground">&gt;</span>
            <h2 className="text-lg font-semibold">Customer Management</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={String(limit)} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="30">30 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setIsImportModalOpen(true)}>
              <Upload size={18} />
              Import Records
            </Button>
            <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
              <DialogTrigger asChild>
                <Button className="gap-2">Add record</Button>
              </DialogTrigger>
              <AddCustomerModal
                setIsModalOpen={handleModalClose}
                editRecord={editRecord}
                onRecordSaved={fetchRecords}
              />
            </Dialog>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={String(sortOrder)} onValueChange={handleSortChange}>
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
            <Button variant="outline" size="icon" onClick={() => setIsFilterSidebarOpen(true)}>
              <Filter className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={checkState !== "all"} size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <p className="text-sm font-medium mb-2">Toggle Columns</p>
                  <div className="space-y-2">
                    {tableHeaders.map((header) => (
                      <div key={header.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`column-${header.key}`}
                          checked={visibleColumns[header.key]}
                          onChange={() => toggleColumnVisibility(header.key)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor={`column-${header.key}`} className="text-sm">
                          {header.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "all")}>All Headers</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "customerCategory")}>
                  Customer Category
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "customerContactDetails")}>
                  Customer Contact Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "actions")}>Actions</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

        <Card>
          <CardContent className="p-0">
            <div className="flex w-full items-center mb-2 mt-2">
              <div className="flex items-center mr-4 ml-4 mt-2">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showHeaderCategories}
                      onChange={() => setShowHeaderCategories(!showHeaderCategories)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Show Headers</span>
                  </label>
                  {showHeaderCategories && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-2 gap-1 bg-transparent">
                          Select Header <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "all")}>
                          All Headers
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "customerCategory")}>
                          Customer Category
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "customerContactDetails")}>
                          Customer Contact Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "actions")}>
                          Actions
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {showHeaderCategories && (
                    <TableRow>
                      {(checkState === "customerCategory" || checkState === "all") && (
                        <TableHead
                          onClick={() => toggleColumnVisibility("a", "customerCategory")}
                          colSpan={isSelectionMode ? 9 : 9}
                          className="text-center cursor-pointer font-bold bg-gradient-to-b from-amber-300 to-amber-100 border-r border-border relative"
                        >
                          Customer Category
                          {checkState === "customerCategory" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleColumnVisibility("a", "all")
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-1 text-xs font-medium bg-white border rounded-full shadow hover:bg-gray-100 transition"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              Back
                            </button>
                          )}
                        </TableHead>
                      )}
                      {(checkState === "customerContactDetails" || checkState === "all") && (
                        <TableHead
                          onClick={() => toggleColumnVisibility("a", "customerContactDetails")}
                          colSpan={isSelectionMode ? 11 : 11}
                          className="text-center cursor-pointer font-bold bg-gradient-to-b from-teal-300 to-teal-100 border-r border-border relative"
                        >
                          Customer Contact Details
                          {checkState === "customerContactDetails" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleColumnVisibility("a", "all")
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-1 text-xs font-medium bg-white border rounded-full shadow hover:bg-gray-100 transition"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              Back
                            </button>
                          )}
                        </TableHead>
                      )}
                      {(checkState === "actions" || checkState === "all") && (
                        <TableHead
                          onClick={() => toggleColumnVisibility("a", "actions")}
                          colSpan={isSelectionMode ? 4 : 3}
                          className="text-center cursor-pointer font-bold bg-gradient-to-b from-red-400 to-red-300 border-r border-border relative"
                        >
                          Actions
                          {checkState === "actions" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleColumnVisibility("a", "all")
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-1 text-xs font-medium bg-white border rounded-full shadow hover:bg-gray-100 transition"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              Back
                            </button>
                          )}
                        </TableHead>
                      )}
                    </TableRow>
                  )}
                  <TableRow>
                    {isSelectionMode && (
                      <TableHead className="w-[50px] text-center border-b">
                        <Checkbox
                          checked={selectedRows.length === records.length && records.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              selectAllRows()
                            } else {
                              setSelectedRowsMap({})
                            }
                          }}
                        />
                      </TableHead>
                    )}
                    {tableHeaders
                      .filter((header) => visibleColumns[header.key])
                      .map((header) => (
                        <TableHead
                          key={header.key}
                          className={cn(
                            "whitespace-nowrap text-center border-b",
                            header.key === "_id" && "w-[120px]",
                            header.key === "customerSegment" && "w-[150px]",
                            header.key === "customerCategory" && "w-[150px]",
                            header.key === "customerSubCategory" && "w-[180px]",
                            header.key === "customerType" && "w-[150px]",
                            header.key === "customerSubType" && "w-[150px]",
                            header.key === "customerBusinessSector" && "w-[180px]",
                            header.key === "customerNationality" && "w-[150px]",
                            header.key === "customerName" && "w-[200px]",
                            header.key === "contactPerson" && "w-[150px]",
                            header.key === "customerDepartment" && "w-[150px]",
                            header.key === "customerDesignation" && "w-[150px]",
                            header.key === "telOffice" && "w-[120px]",
                            header.key === "mobile1" && "w-[120px]",
                            header.key === "mobile2" && "w-[120px]",
                            header.key === "webAddress" && "w-[200px]",
                            header.key === "officeLocation" && "w-[200px]",
                            header.key === "edit" && "w-[100px]",
                            header.key === "delete" && "w-[100px]",
                          )}
                        >
                          {isSelectionMode && (
                            <div className="flex flex-col items-center">
                              <Checkbox
                                checked={selectedColumns.includes(header.key)}
                                onCheckedChange={() => toggleColumns(header.key)}
                                className="mb-2"
                              />
                            </div>
                          )}
                          <div className={isSelectionMode ? "uppercase text-xs font-bold" : ""}>{header.label}</div>
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <TableRow key={index}>
                          {isSelectionMode && (
                            <TableCell className="text-center">
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          )}
                          {tableHeaders
                            .filter((header) => visibleColumns[header.key])
                            .map((header) => (
                              <TableCell key={`${index}-${header.key}`}>
                                <Skeleton className="h-4 w-full" />
                              </TableCell>
                            ))}
                        </TableRow>
                      ))
                  ) : records.length > 0 ? (
                    records.map((record, index) => (
                      <TableRow key={record._id} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}>
                        {isSelectionMode && (
                          <TableCell className="text-center">
                            <Checkbox
                              checked={isRowSelected(record._id)}
                              onCheckedChange={() => toggleRow(record._id)}
                            />
                          </TableCell>
                        )}
                        {tableHeaders
                          .filter((header) => visibleColumns[header.key])
                          .map((header) => (
                            <TableCell key={`${record._id}-${header.key}`} className="text-center">
                              {renderCellContent(record, header.key, index)}
                            </TableCell>
                          ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={
                          isSelectionMode
                            ? tableHeaders.filter((header) => visibleColumns[header.key]).length + 1
                            : tableHeaders.filter((header) => visibleColumns[header.key]).length
                        }
                        className="text-center py-10"
                      >
                        Your records will be shown here
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination - Right below the table */}
            {(pagination.totalPages > 0 || loading) && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                    disabled={pagination.pageNumber === 1 || loading}
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
                        className="h-9 w-16 text-center rounded-md"
                        aria-label="Page number"
                        disabled={loading}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">...</span>
                    <div className="flex items-center">
                      <div className="h-9 px-3 flex items-center justify-center border rounded-md bg-muted/50">
                        {loading ? "-" : pagination.totalPages}
                      </div>
                    </div>
                  </form>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                    disabled={pagination.pageNumber === pagination.totalPages || loading}
                    className="h-9 w-9 rounded-md"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="text-sm text-muted-foreground ml-2">
                    {loading ? "Loading..." : `Page ${pagination.pageNumber} of ${pagination.totalPages}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">Total Records: {loading ? "-" : pagination.totalCount}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Import Modal */}
      <ImportCustomersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        fetchRecords={fetchRecords}
      />
    </div>
  )
}
