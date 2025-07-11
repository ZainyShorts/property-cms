"use client"
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
  Info,
  Eye,
  Upload,
  Copy,
  Check,
  Building2,
  Ruler,
  Layout,
  ArrowLeft,
  Settings,
  MapPin,
  ChevronDown,
  UserPlus,
  Users,
} from "lucide-react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import { useSelector, useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Switch } from "./switch"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { SimpleDatePicker } from "./date-picker/date-picker"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { DeleteConfirmationModal } from "./delete-confirmation-modal"
import { ImportRecordsModal } from "./import-records/import-records"
import DocumentModal, { type DocumentData } from "@/components/overview/Data-Table/DocumentModal"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { FilterSidebar, type FilterValues } from "./filter-sidebar/filter-sidebar"
import { resetFilters } from "@/lib/store/slices/projectSlice"
import { ShareModal } from "../inventory/share-modal/shareModal"
import { ExportModal } from "../inventory/Export-Modal/ExportModal"
import { projectDetails, projectStatus, paymentPlan, actions } from "./data/data"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MultiStepModal, type MultiStepFormData } from "./add-record/multi-step"
import { AddRecordModal } from "./add-record/addRecord"
import { CustomerManagementModal } from "./customer-management-modal"
import useSWR from "swr"

export interface MasterDevelopment {
  _id: string
  country: string
  city: string
  roadLocation: string
  developmentName: string
  locationQuality: string
  buaAreaSqFt: number
  facilitiesAreaSqFt: number
  amentiesAreaSqFt: number
  totalAreaSqFt: number
  pictures: string[]
  facilityCategories: string[]
  amenitiesCategories: string[]
  customers?: string[]
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  data: MasterDevelopment[]
  totalCount: number
  totalPages: number
  pageNumber: number
}

const tableHeaders = [
  { key: "index", label: "INDEX" },
  { key: "_id", label: "ID" },
  { key: "masterDevelopment", label: "MASTER DEVELOPMENT" },
  { key: "subDevelopment", label: "SUB DEVELOPMENT" },
  { key: "roadLocation", label: "ROAD LOCATION" },
  { key: "propertyType", label: "PROPERTY TYPE" },
  { key: "projectName", label: "PROJECT NAME" },
  { key: "projectQuality", label: "PROJECT QUALITY" },
  { key: "facilityCategories", label: "FACILITIES" },
  { key: "amenitiesCategories", label: "AMENITIES" },
  { key: "constructionStatus", label: "CONSTRUCTION STATUS" },
  { key: "launchDate", label: "LAUNCH DATE" },
  { key: "completionDate", label: "COMPLETION DATE" },
  { key: "salesStatus", label: "SALES STATUS" },
  { key: "downPayment", label: "DOWNPAYMENT" },
  { key: "percentOfConstruction", label: "PERCENT OF CONSTRUCTION" },
  { key: "uponCompletion", label: "UPON COMPLETION" },
  { key: "postHandOver", label: "POST HANDOVER" },
  { key: "height", label: "HEIGHT" },
  { key: "commission", label: "COMMISSION" },
  { key: "duringConstruction", label: "DURING CONSTRUCTION" },
  { key: "plot", label: "PLOT DETAILS" },
  { key: "customers", label: "CUSTOMERS" },
  { key: "attachDocument", label: "DOCUMENT" },
  { key: "view", label: "VIEW" },
  { key: "edit", label: "EDIT" },
  { key: "delete", label: "DELETE" },
]

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`)
  }
  return res.json() as Promise<T>
}

export default function MasterDevelopmentPage() {
  const { theme } = useTheme()
  const filters = useSelector((state: any) => state.projectFilter)
  const dispatch = useDispatch()
  const router = useRouter()
  // const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState<any>(1)
  const [multiStepFormData, setMultiStepFormData] = useState<MultiStepFormData | null>(null)
  const [isMultiStepModalOpen, setIsMultiStepModalOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState("desc")
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [records, setRecords] = useState<MasterDevelopment[]>([])
  const [startingIndex, setStartingIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editMainRecord, setEditMainRecord] = useState<any>(null)
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
  const [selectedRecordsCache, setSelectedRecordsCache] = useState<any>({})
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareData, setShareData] = useState(null)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<any[]>([])
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [isAttachingDocument, setIsAttachingDocument] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    tableHeaders.reduce((acc, header) => ({ ...acc, [header.key]: true }), {}),
  )
  const [limit, setLimit] = useState<number>(10)
  const [selectedRowsMap, setSelectedRowsMap] = useState<Record<string, boolean>>({})

  // Customer management modal states
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [selectedRecordCustomers, setSelectedRecordCustomers] = useState<string[]>([])

  const { data: authData } = useSWR<any>("/api/me", fetcher)

  const handleShareButton = (data: any) => {
    setShareData(data)
    setShareModalOpen(true)
  }

  const handleManageCustomers = (recordId: string, customers: string[] = []) => {
    setSelectedRecordId(recordId)
    setSelectedRecordCustomers(customers)
    setIsCustomerModalOpen(true)
  }

  const handleCustomersUpdated = () => {
    fetchRecords()
  }

  useEffect(() => {
    fetchRecords()
  }, [sortOrder, limit])

  useEffect(() => {
    setPageInputValue(currentPage.toString())
    setStartingIndex((currentPage - 1) * limit)
  }, [currentPage])

  useEffect(() => {
    const newCache = { ...selectedRecordsCache }
    records.forEach((record) => {
      if (selectedRowsMap[record._id]) {
        newCache[record._id] = record
      } else {
        // If a record was deselected, remove it from cache
        delete newCache[record._id]
      }
    })
    setSelectedRecordsCache(newCache)
  }, [selectedRowsMap, records])

  // Update selectedRows when selectedRowsMap changes
  useEffect(() => {
    setSelectedRows(Object.keys(selectedRowsMap).filter((id) => selectedRowsMap[id]))
  }, [selectedRowsMap])

  const fetchRecords = async (reset?: any, page?: any, value?: any) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      // if (page) {
      //   params.append("page", page.toString())
      // } else {
      // params.append("page", currentPage.toString())
      // }
      if (value) {
        params.append("sortOrder", value)
      } else {
        params.append("sortOrder", sortOrder)
      }
      // params.append("limit", limit.toString())
      // if (!reset) {
      //   if (searchTerm) {
      //     params.append("search", searchTerm)
      //   }
      // if (startDate) {
      //   params.append("startDate", startDate.toISOString())
      // }
      // if (endDate) {
      //   params.append("endDate", endDate.toISOString())
      // }
      //   if (activeFilters.roadLocation) {
      //     params.append("roadLocation", activeFilters.roadLocation)
      //   }
      //   if (activeFilters.developmentName) {
      //     params.append("developmentName", activeFilters.developmentName)
      //   }
      //   if (activeFilters.locationQuality) {
      //     params.append("locationQuality", activeFilters.locationQuality)
      //   }
      //   if (activeFilters.buaAreaSqFtRange?.min) {
      //     params.append("buaAreaSqFtMin", activeFilters.buaAreaSqFtRange.min.toString())
      //   }
      //   if (activeFilters.buaAreaSqFtRange?.max) {
      //     params.append("buaAreaSqFtMax", activeFilters.buaAreaSqFtRange.max.toString())
      //   }
      //   if (activeFilters.totalAreaSqFtRange?.min) {
      //     params.append("totalAreaSqFtMin", activeFilters.totalAreaSqFtRange.min.toString())
      //   }
      //   if (activeFilters.totalAreaSqFtRange?.max) {
      //     params.append("totalAreaSqFtMax", activeFilters.totalAreaSqFtRange.max.toString())
      //   }
      //   if (activeFilters.facilityCategories?.length) {
      //     activeFilters.facilityCategories.forEach((facility) => {
      //       params.append("facilityCategories", facility)
      //     })
      //   }
      //   if (activeFilters.amenitiesCategories?.length) {
      //     activeFilters.amenitiesCategories.forEach((amenity) => {
      //       params.append("amenitiesCategories", amenity)
      //     })
      //   }
      // }
      console.log("Params", params.toString())
      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_CMS_SERVER}/project?populate=subDevelopment,masterDevelopment&${params.toString()}`,
      )
      console.log("response", response)
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

  const pageChange = (page: any) => {
    setLoading(true)
    try {
      const allFilters: Record<string, any> = {
        masterDevelopment: filters.masterDevelopment,
        subDevelopment: filters.subDevelopment,
        propertyType: filters.propertyType,
        projectName: filters.projectName,
        projectQuality: filters.projectQuality,
        launchDate: filters.launchDate,
        completionDate: filters.completionDate,
        uponCompletion: filters.uponCompletion,
        plotNumber: filters.plotNumber,
        plotPermission: filters.plotPermission,
        commission: filters.commission,
        height: filters.height,
        duringConstruction: filters.duringConstruction,
        postHandOver: filters.postHandOver,
        salesStatus: filters.saleStatus,
        percentOfConstruction: filters.percentOfConstruction,
        constructionStatus: filters.constructionStatus,
        facilitiesCategories: filters.facilitiesCategories,
        amentiesCategories: filters.amentiesCategories,
      }
      const cleanedFilters = cleanObject(allFilters)
      console.log("Applying filters:", cleanedFilters)
      const requestData: Record<string, any> = {
        page: page,
        sortOrder: sortOrder,
        limit: limit,
        ...cleanedFilters,
      }
      console.log("API request data:", requestData)
      const params = new URLSearchParams()
      if (startDate) {
        params.append("startDate", startDate.toISOString())
      }
      if (endDate) {
        const adjustedEndDate = new Date(endDate)
        adjustedEndDate.setHours(23, 59, 59, 999)
        params.append("endDate", adjustedEndDate.toISOString())
      }
      params.append("page", requestData.page)
      params.append("limit", requestData.limit)
      if (requestData.masterDevelopment) params.append("masterDevelopment", requestData.masterDevelopment)
      if (requestData.subDevelopment) params.append("subDevelopment", requestData.subDevelopment)
      if (requestData.propertyType) params.append("propertyType", requestData.propertyType)
      if (requestData.projectName) params.append("projectName", requestData.projectName)
      if (requestData.salesStatus) params.append("salesStatus", requestData.salesStatus)
      if (requestData.percentOfConstruction) params.append("percentOfConstruction", requestData.percentOfConstruction)
      if (requestData.launchDate) params.append("launchDate", requestData.launchDate)
      if (requestData.completionDate) params.append("completionDate", requestData.completionDate)
      if (requestData.height) params.append("height", requestData.height)
      if (requestData.commission) params.append("commission", requestData.commission)
      if (requestData.duringConstruction) params.append("duringConstruction", requestData.duringConstruction)
      if (requestData.projectQuality) params.append("projectQuality", requestData.projectQuality)
      if (requestData.postHandOver) params.append("postHandOver", requestData.postHandOver)
      if (filters.plotPermission?.length) {
        filters.plotPermission.forEach((permission: string) => {
          params.append("plotPermission", permission)
        })
      }
      if (requestData.plotStatus) params.append("plotStatus", requestData.plotStatus)
      if (requestData.uponCompletion) params.append("uponCompletion", requestData.uponCompletion)
      if (requestData.constructionStatus !== undefined)
        params.append("constructionStatus", requestData.constructionStatus)
      if (requestData.facilitiesCategories && requestData.facilitiesCategories.length > 0) {
        requestData.facilitiesCategories.forEach((facility: string) => {
          params.append("facilityCategories", facility)
        })
      }
      if (requestData.amentiesCategories && requestData.amentiesCategories.length > 0) {
        requestData.amentiesCategories.forEach((amenity: string) => {
          params.append("amenitiesCategories", amenity)
        })
      }
      console.log("API params:", params.toString())
      axios
        .get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_CMS_SERVER}/project?populate=subDevelopment,masterDevelopment&${params}`,
        )
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

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return
    setCurrentPage(page)
    pageChange(page)
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
    // setLoading(true)
    // const response = await axios.get<ApiResponse>(
    //   `${process.env.NEXT_PUBLIC_CMS_SERVER}/project?populate=subDevelopment,masterDevelopment&sortBy=${value})}`,
    // )
    // setLoading(false)
    // setRecords(response.data.data)
    // setPagination({
    //   totalCount: response.data.totalCount,
    //   totalPages: response.data.totalPages,
    //   pageNumber: response.data.pageNumber,
    // })
    fetchRecords("a", "a", value)
  }

  const handleLimitChange = (value: string) => {
    setLimit(Number(value))
  }

  const handleResetFilters = () => {
    dispatch(resetFilters())
    setStartDate(null)
    setEndDate(null)
    setCurrentPage(1)
    setSortOrder("desc")
    fetchRecords("reset")
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
    setCurrentPage(1)
    setLoading(true)
    try {
      const allFilters: Record<string, any> = {
        masterDevelopment: filters.masterDevelopment,
        subDevelopment: filters.subDevelopment,
        propertyType: filters.propertyType,
        projectName: filters.projectName,
        projectQuality: filters.projectQuality,
        launchDate: filters.launchDate,
        completionDate: filters.completionDate,
        uponCompletion: filters.uponCompletion,
        plotStatus: filters.plotStatus,
        commission: filters.commission,
        height: filters.height,
        duringConstruction: filters.duringConstruction,
        plotNumber: filters.plotNumber,
        plotPermission: filters.plotPermission,
        postHandOver: filters.postHandOver,
        salesStatus: filters.saleStatus,
        percentOfConstruction: filters.percentOfConstruction,
        constructionStatus: filters.constructionStatus,
        facilitiesCategories: filters.facilitiesCategories,
        amentiesCategories: filters.amentiesCategories,
      }
      const cleanedFilters = cleanObject(allFilters)
      console.log("Applying filters:", cleanedFilters)
      const requestData: Record<string, any> = {
        page: 1,
        sortOrder: sortOrder,
        limit: limit,
        ...cleanedFilters,
      }
      console.log("API request data:", requestData)
      const params = new URLSearchParams()
      if (startDate) {
        params.append("startDate", startDate.toISOString())
      }
      if (endDate) {
        const adjustedEndDate = new Date(endDate)
        adjustedEndDate.setHours(23, 59, 59, 999)
        params.append("endDate", adjustedEndDate.toISOString())
      }
      params.append("page", requestData.page)
      params.append("limit", requestData.limit)
      if (requestData.masterDevelopment) params.append("masterDevelopment", requestData.masterDevelopment)
      if (requestData.subDevelopment) params.append("subDevelopment", requestData.subDevelopment)
      if (requestData.propertyType) params.append("propertyType", requestData.propertyType)
      if (requestData.projectName) params.append("projectName", requestData.projectName)
      if (requestData.salesStatus) params.append("salesStatus", requestData.salesStatus)
      if (requestData.percentOfConstruction) params.append("percentOfConstruction", requestData.percentOfConstruction)
      if (requestData.launchDate) params.append("launchDate", requestData.launchDate)
      if (requestData.completionDate) params.append("completionDate", requestData.completionDate)
      if (requestData.height) params.append("height", requestData.height)
      if (requestData.commission) params.append("commission", requestData.commission)
      if (requestData.duringConstruction) params.append("duringConstruction", requestData.duringConstruction)
      if (requestData.projectQuality) params.append("projectQuality", requestData.projectQuality)
      if (requestData.postHandOver) params.append("postHandOver", requestData.postHandOver)
      if (filters.plotPermission?.length) {
        filters.plotPermission.forEach((permission: string) => {
          params.append("plotPermission", permission)
        })
      }
      if (requestData.plotStatus) params.append("plotStatus", requestData.plotStatus)
      if (requestData.uponCompletion) params.append("uponCompletion", requestData.uponCompletion)
      if (requestData.constructionStatus !== undefined)
        params.append("constructionStatus", requestData.constructionStatus)
      if (requestData.facilitiesCategories && requestData.facilitiesCategories.length > 0) {
        requestData.facilitiesCategories.forEach((facility: string) => {
          params.append("facilityCategories", facility)
        })
      }
      if (requestData.amentiesCategories && requestData.amentiesCategories.length > 0) {
        requestData.amentiesCategories.forEach((amenity: string) => {
          params.append("amenitiesCategories", amenity)
        })
      }
      console.log("API params:", params.toString())
      axios
        .get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_CMS_SERVER}/project?populate=subDevelopment,masterDevelopment&${params}`,
        )
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

  const handleEditMulti = (data?: any) => {
    setEditMainRecord(data)
    setIsModalOpen(true)
  }

  // Handle copy ID
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

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
    } else {
      setIsSelectionMode(true)
    }
  }

  const handleEditRecord = (record: MasterDevelopment) => {
    setEditMainRecord(record)
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
      console.log(response)
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

  const confirmDelete = async () => {
    if (!recordToDelete) return
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_CMS_SERVER}/project/${recordToDelete}`, {
        headers: {
          Authorization: `Bearer ${authData?.token}`,
        },
      })
      toast.success("Record deleted successfully")
      fetchRecords()
    } catch (error: any) {
      console.error("Error deleting record:", error)
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data?.message === "You do not have permission (roles) to access this resource"
      ) {
        toast.error("You do not have permission to access this resource.")
      } else if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || "Failed to delete record")
      } else {
        toast.error("Failed to delete record. Please try again.")
      }
    } finally {
      setRecordToDelete(null)
      setIsDeleteModalOpen(false)
    }
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
      if (headers === "projectDetails") {
        setCheckState("projectDetails")
        setVisibleColumns((prev) => {
          const updated = Object.keys(prev).reduce((acc: any, key) => {
            acc[key] = projectDetails.includes(key)
            return acc
          }, {})
          return updated
        })
      } else if (headers === "projectStatus") {
        setCheckState("projectStatus")
        setVisibleColumns((prev) => {
          const updated = Object.keys(prev).reduce((acc: any, key) => {
            acc[key] = projectStatus.includes(key)
            return acc
          }, {})
          return updated
        })
      } else if (headers === "paymentPlan") {
        setCheckState("paymentPlan")
        setVisibleColumns((prev) => {
          const updated = Object.keys(prev).reduce((acc: any, key) => {
            acc[key] = paymentPlan.includes(key)
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

  const renderCellContent = (record: any, key: string, index: any) => {
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
      case "masterDevelopment":
        return record.masterDevelopment?.developmentName ?? "N/A"
      case "subDevelopment":
        return record.subDevelopment?.subDevelopment ?? "N/A"
      case "roadLocation":
        return record.masterDevelopment?.roadLocation ?? "N/A"
      case "percentOfConstruction":
        return record[key].toLocaleString() + "%"
      case "constructionStatus":
      case "downPayment":
        return record[key].toLocaleString() + "%"
      case "projectName":
      case "propertyType":
      case "projectQuality":
      case "launchDate":
      case "completionDate":
      case "salesStatus":
      case "height":
      case "commission":
      case "duringConstruction":
      case "postHandOver":
        return record[key] ? record[key].toLocaleString() : "N/A"
      case "customers":
        const customerCount = record.customers?.length || 0
        return (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className={`h-8 px-2 gap-1 bg-transparent ${
                customerCount === 0
                  ? "text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  : "text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
              }`}
              onClick={() => handleManageCustomers(record._id, record.customers || [])}
            >
              {customerCount === 0 ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  Add Customer
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    {customerCount}
                  </Badge>
                </>
              )}
            </Button>
          </div>
        )
      case "plot":
        // First check if plot object exists in record
        if (record.plot) {
          return (
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center justify-center gap-2 cursor-pointer">
                  <Badge
                    variant="outline"
                    className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200"
                  >
                    Plot Details
                  </Badge>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-[400px] p-0 shadow-lg">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-4 rounded-t-lg">
                  <div className="flex items-center gap-2 text-white">
                    <MapPin className="h-5 w-5" />
                    <h3 className="font-semibold">Plot #{record.plot.plotNumber}</h3>
                  </div>
                  <div className="mt-2">
                    <Badge className="bg-white/20 text-white border-none">{record.plot.plotStatus}</Badge>
                  </div>
                </div>
                <div className="p-4 space-y-6">
                  {/* Plot Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 text-indigo-500 mt-1" />
                        <div>
                          <p className="text-xs text-muted-foreground">Height</p>
                          <p className="font-medium">{record.plot.plotHeight}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Ruler className="h-4 w-4 text-indigo-500 mt-1" />
                        <div>
                          <p className="text-xs text-muted-foreground">Plot Size</p>
                          <p className="font-medium">{record.plot.plotSizeSqFt} sq.ft</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Layout className="h-4 w-4 text-indigo-500 mt-1" />
                        <div>
                          <p className="text-xs text-muted-foreground">BUA</p>
                          <p className="font-medium">{record.plot.plotBUASqFt} sq.ft</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 text-indigo-500 mt-1" />
                        <div>
                          <p className="text-xs text-muted-foreground">Built Area</p>
                          <p className="font-medium">{record.plot.buaAreaSqFt} sq.ft</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Plot Permissions */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                      Permitted Usage
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {record.plot.plotPermission.map((permission, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-indigo-50/50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-200 dark:border-indigo-800"
                        >
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          )
        }
        // If plot object doesn't exist, check if subDevelopment exists and has plot details
        // if (
        //   record.subDevelopment &&
        //   (record.subDevelopment.plotBUASqFt ||
        //     record.subDevelopment.plotNumber ||
        //     record.subDevelopment.plotSizeSqFt ||
        //     record.subDevelopment.plotStatus ||
        //     record.subDevelopment.plotPermission)
        // ) {
        //   // Use subDevelopment plot details
        //   return (
        //     <HoverCard>
        //       <HoverCardTrigger asChild>
        //         <div className="flex items-center justify-center gap-2 cursor-pointer">
        //           <Badge
        //             variant="outline"
        //             className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200"
        //           >
        //             Plot Details
        //           </Badge>
        //           <Info className="h-4 w-4 text-muted-foreground" />
        //         </div>
        //       </HoverCardTrigger>
        //       <HoverCardContent className="w-[400px] p-0 shadow-lg">
        //         {/* Header */}
        //         <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-4 rounded-t-lg">
        //           <div className="flex items-center gap-2 text-white">
        //             <MapPin className="h-5 w-5" />
        //             <h3 className="font-semibold">Plot #{record.subDevelopment.plotNumber}</h3>
        //           </div>
        //           <div className="mt-2">
        //             <Badge className="bg-white/20 text-white border-none">{record.subDevelopment.plotStatus}</Badge>
        //           </div>
        //         </div>
        //         <div className="p-4 space-y-6">
        //           {/* Plot Metrics */}
        //           <div className="grid grid-cols-2 gap-4">
        //             <div className="space-y-4">
        //               <div className="flex items-start gap-3">
        //                 <Building2 className="h-4 w-4 text-indigo-500 mt-1" />
        //                 <div>
        //                   <p className="text-xs text-muted-foreground">Height</p>
        //                   <p className="font-medium">{record.subDevelopment.plotHeight}</p>
        //                 </div>
        //               </div>
        //               <div className="flex items-start gap-3">
        //                 <Ruler className="h-4 w-4 text-indigo-500 mt-1" />
        //                 <div>
        //                   <p className="text-xs text-muted-foreground">Plot Size</p>
        //                   <p className="font-medium">{record.subDevelopment.plotSizeSqFt} sq.ft</p>
        //                 </div>
        //               </div>
        //             </div>
        //             <div className="space-y-4">
        //               <div className="flex items-start gap-3">
        //                 <Layout className="h-4 w-4 text-indigo-500 mt-1" />
        //                 <div>
        //                   <p className="text-xs text-muted-foreground">BUA</p>
        //                   <p className="font-medium">{record.subDevelopment.plotBUASqFt} sq.ft</p>
        //                 </div>
        //               </div>
        //               <div className="flex items-start gap-3">
        //                 <Building2 className="h-4 w-4 text-indigo-500 mt-1" />
        //                 <div>
        //                   <p className="text-xs text-muted-foreground">Built Area</p>
        //                   <p className="font-medium">{record.subDevelopment.buaAreaSqFt} sq.ft</p>
        //                 </div>
        //               </div>
        //             </div>
        //           </div>
        //           {/* Plot Permissions */}
        //           {record.subDevelopment.plotPermission && (
        //             <div>
        //               <h4 className="font-medium text-sm mb-3 text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
        //                 <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
        //                 Permitted Usage
        //               </h4>
        //               <div className="flex flex-wrap gap-2">
        //                 {record.subDevelopment.plotPermission.map((permission, idx) => (
        //                   <Badge
        //                     key={idx}
        //                     variant="outline"
        //                     className="bg-indigo-50/50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-200 dark:border-indigo-800"
        //                   >
        //                     {permission}
        //                   </Badge>
        //                 ))}
        //               </div>
        //             </div>
        //           )}
        //         </div>
        //       </HoverCardContent>
        //     </HoverCard>
        //   )
        // }
        // If neither record.plot nor record.subDevelopment has plot details, show N/A
        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center justify-center gap-2 cursor-pointer">
                <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  N/A
                </Badge>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-64 p-4">
              <p className="text-sm text-center text-muted-foreground">No plot details available</p>
            </HoverCardContent>
          </HoverCard>
        )
      case "facilityCategories":
        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center justify-center gap-2 cursor-pointer">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                  {record.facilityCategories.length}
                </Badge>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0">
              <div className="p-4">
                <h4 className="font-medium text-sm mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  Facilities ({record.facilityCategories.length})
                </h4>
                {record.facilityCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {record.facilityCategories.map((facility, idx) => (
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
      case "amenitiesCategories":
        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center justify-center gap-2 cursor-pointer">
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200">
                  {record.amenitiesCategories.length}
                </Badge>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0">
              <div className="p-4">
                <h4 className="font-medium text-sm mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  Amenities ({record.amenitiesCategories.length})
                </h4>
                {record.amenitiesCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {record.amenitiesCategories.map((amenity, idx) => (
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
            className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 bg-transparent"
            onClick={() => handleAttachDocument(record._id)}
            disabled={isAttachingDocument}
          >
            <Upload className="h-4 w-4 mr-1" />
            Attach
          </Button>
        )
      case "view":
        return (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 bg-transparent"
            onClick={() => window.open(`/project-details/${record._id}`, "_blank")}
            disabled={isAttachingDocument}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
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
        return record[key as keyof MasterDevelopment]
    }
  }

  useEffect(() => {
    if (selectedRows) {
      console.log(selectedRows)
    }
  }, [selectedRows])

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

  // First, add this state to store selected records data across pages
  // Update this useEffect to maintain the cache when rows are selected/deselected
  // Updated getSelectedData function
  const getSelectedData = () => {
    if (selectedRows.length === 0 || selectedColumns.length === 0) {
      return []
    }
    return selectedRows
      .map((id) => {
        const record = selectedRecordsCache[id] || records.find((r) => r._id === id)
        if (!record) return null
        const selectedData: Record<string, any> = {}
        selectedColumns.forEach((col) => {
          selectedData[col] = record[col]
        })
        return selectedData
      })
      .filter(Boolean)
  }

  const isRowSelected = (id: any): boolean => {
    return !!selectedRowsMap[id]
  }

  const shareSelectedData = () => {
    const data = getSelectedData()
    handleShareButton(data)
  }

  const exportSelectedData = () => {
    if (selectedRows.length === 0 || selectedColumns.length === 0) {
      toast.error("Please select at least one row and one column to export")
      return
    }
    const selectedData = getSelectedData()
    let csvContent = selectedColumns.join(",") + "\n"
    selectedData.forEach((item) => {
      const row = selectedColumns.map((col) => {
        const value = item[col]
        if (value === null || value === undefined) return ""
        if (Array.isArray(value)) return `"${value.join(", ")}"`
        if (typeof value === "string" && value.includes(",")) return `"${value}"`
        return value
      })
      csvContent += row.join(",") + "\n"
    })
    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `selected-data-export-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${selectedData.length} records successfully`)
  }

  const handleSubmitExport = async (withFilters: boolean, count: number) => {
    setIsExportModalOpen(false)
    if (isSelectionMode && selectedRows.length > 0 && selectedColumns.length > 0) {
      exportSelectedData()
      return
    }
    try {
      const toastId = toast.loading("Preparing export...")
      const params = new URLSearchParams()
      params.append("limit", count.toString())
      params.append("sortOrder", sortOrder)
      if (withFilters) {
        const allFilters: Record<string, any> = {
          projectName: filters.projectName,
          propertyType: filters.propertyType,
          projectQuality: filters.projectQuality,
          constructionStatus: filters.constructionStatus,
          salesStatus: filters.salesStatus,
          facilityCategories: filters.facilityCategories,
          amenitiesCategories: filters.amenitiesCategories,
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
        if (requestData.projectName) params.append("projectName", requestData.projectName)
        if (requestData.propertyType) params.append("propertyType", requestData.propertyType)
        if (requestData.projectQuality) params.append("projectQuality", requestData.projectQuality)
        if (requestData.constructionStatus)
          params.append("constructionStatus", requestData.constructionStatus.toString())
        if (requestData.salesStatus) params.append("salesStatus", requestData.salesStatus)
        // Add array filters
        if (requestData.facilityCategories && requestData.facilityCategories.length > 0) {
          requestData.facilityCategories.forEach((facility: string) => {
            params.append("facilityCategories", facility)
          })
        }
        if (requestData.amenitiesCategories && requestData.amenitiesCategories.length > 0) {
          requestData.amenitiesCategories.forEach((amenity: string) => {
            params.append("amenitiesCategories", amenity)
          })
        }
        if (requestData.startDate) params.append("startDate", requestData.startDate)
        if (requestData.endDate) params.append("endDate", requestData.endDate)
      }
      const response = await axios.get<any>(
        `${process.env.NEXT_PUBLIC_CMS_SERVER}/project?populate=subDevelopment,masterDevelopment&${params.toString()}`,
      )
      const exportData = response.data.data
      let csvContent =
        "Master Development,Sub Development,Project Name,Property Type,Project Quality,Construction Status,Facilities Count,Amenities Count,Launch Date,Completion Date,Sales Status\n"
      exportData.forEach((record) => {
        const row = [
          record.masterDevelopment?.developmentName,
          record.subDevelopment?.subDevelopment,
          record.projectName,
          record.propertyType,
          record.projectQuality,
          record.constructionStatus,
          record.facilityCategories.length,
          record.amenitiesCategories.length,
          record.launchDate,
          record.completionDate,
          record.salesStatus,
        ]
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
      link.setAttribute("download", `projects-export-${new Date().toISOString().split("T")[0]}.csv`)
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

  const handleMultiStepFormComplete = (data: MultiStepFormData) => {
    setMultiStepFormData(data)
    console.log("multi", data)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen w-full">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Properties</h2>
            <span className="text-muted-foreground">&gt;</span>
            <h2 className="text-lg font-semibold">Projects</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue={limit.toString()} onValueChange={handleLimitChange}>
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
            {/* <Button variant="outline" onClick={handleExport} className="gap-2 bg-transparent">
              <Download size={18} />
              {isSelectionMode && selectedRows.length > 0 && selectedColumns.length > 0 ? "Export Selected" : "Export"}
            </Button> */}
            <>
              <Button className="gap-2" onClick={() => setIsMultiStepModalOpen(true)}>
                Add record
              </Button>
              <MultiStepModal
                open={isMultiStepModalOpen}
                onEdit={editRecord}
                onOpenChange={setIsMultiStepModalOpen}
                onComplete={handleMultiStepFormComplete}
                onCompleteEdit={handleEditMulti}
              />
              <AddRecordModal
                setIsModalOpen={handleModalClose}
                editRecord={editMainRecord}
                onRecordSaved={fetchRecords}
                setEditRecord={setEditMainRecord}
                // onEdit = {editMainRecord}
                open={isModalOpen}
                multiStepFormData={multiStepFormData}
              />
            </>
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
                  <Switch
                    enabled={showHeaderCategories}
                    onChange={() => setShowHeaderCategories(!showHeaderCategories)}
                    label="Show Headers"
                  />
                  {showHeaderCategories && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-2 gap-1 bg-transparent">
                          Select Header <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "all")}>
                          All Headers
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "projectDetails")}>
                          Project Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "projectStatus")}>
                          Project Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "paymentPlan")}>
                          Payment Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "actions")}>
                          Other Actions
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                {/* {!isSelectionMode ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectionMode}
                    className="gap-1.5 ml-4 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <MousePointerSquare className="h-4 w-4" />
                    Enable Selection
                  </Button>
                ) : (
                  <div className="flex ml-4 items-center">
                    <div className="flex items-center border rounded-md overflow-hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAllRows}
                        className="rounded-none border-x border-gray-200 dark:border-gray-700 h-9 px-4"
                      >
                        Select All Rows
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAllColumns}
                        className="rounded-none border-r border-gray-200 dark:border-gray-700 h-9 px-4"
                      >
                        Select All Columns
                      </Button>
                      <Button variant="ghost" size="sm" onClick={clearSelection} className="rounded-none h-9 px-4">
                        Clear Selection
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={exitSelectionMode}
                        className="rounded-none border-l border-gray-200 dark:border-gray-700 h-9 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <span className="mr-1">×</span> Exit Selection
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareSelectedData}
                      className="gap-1.5 ml-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                      disabled={selectedRows.length === 0 || selectedColumns.length === 0}
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                )} */}
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {showHeaderCategories && (
                    <TableRow>
                      {(checkState === "projectDetails" || checkState === "all") && (
                        <TableHead
                          onClick={() => toggleColumnVisibility("a", "projectDetails")}
                          colSpan={isSelectionMode ? 10 : 10}
                          className="text-center cursor-pointer font-bold bg-gradient-to-b from-amber-300 to-amber-100 border-r border-border relative"
                        >
                          Project Details
                          {checkState === "projectDetails" && (
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
                      {(checkState === "projectStatus" || checkState === "all") && (
                        <TableHead
                          onClick={() => toggleColumnVisibility("a", "projectStatus")}
                          colSpan={isSelectionMode ? 5 : 4}
                          className="text-center cursor-pointer font-bold bg-gradient-to-b from-teal-300 to-teal-100 border-r border-border relative"
                        >
                          Project Status
                          {checkState === "projectStatus" && (
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
                      {(checkState === "paymentPlan" || checkState === "all") && (
                        <TableHead
                          onClick={() => toggleColumnVisibility("a", "paymentPlan")}
                          colSpan={isSelectionMode ? 6 : 6}
                          className="text-center cursor-pointer font-bold bg-gradient-to-b from-orange-500 to-orange-400 border-r border-border relative"
                        >
                          Project Payment Plan
                          {checkState === "paymentPlan" && (
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
                          colSpan={isSelectionMode ? 6 : 6}
                          className="text-center cursor-pointer font-bold bg-gradient-to-b from-red-400 to-red-300 border-r border-border relative"
                        >
                          Other Actions
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
                    {/* {isSelectionMode && (
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
                    )} */}
                    {tableHeaders
                      .filter((header) => visibleColumns[header.key])
                      .map((header) => (
                        <TableHead
                          key={header.key}
                          className={cn(
                            "whitespace-nowrap text-center border-b",
                            header.key === "_id" && "w-[120px]",
                            header.key === "masterDevelopment" && "w-[120px]",
                            header.key === "locationQuality" && "w-[150px]",
                            header.key === "buaAreaSqFt" && "w-[150px]",
                            header.key === "facilitiesAreaSqFt" && "w-[180px]",
                            header.key === "amentiesAreaSqFt" && "w-[180px]",
                            header.key === "totalAreaSqFt" && "w-[150px]",
                            header.key === "facilityCategories" && "w-[120px]",
                            header.key === "amenitiesCategories" && "w-[120px]",
                            header.key === "customers" && "w-[120px]",
                            header.key === "attachDocument" && "w-[120px]",
                            header.key === "view" && "w-[100px]",
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
            {/* Pagination - Updated to match the image */}
            {pagination.totalPages > 0 && (
              <div className="flex items-center justify-between p-4 border-t">
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
                        className="h-9 w-16 text-center rounded-md"
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
                <div className="flex items-center gap-2">Total Records: {pagination.totalCount}</div>
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
      <ImportRecordsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        fetchRecords={fetchRecords}
      />
      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onSubmitExport={handleSubmitExport}
      />
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onShare={(options) => {
          console.log("Share options:", options)
          console.log("Share data:", shareData)
          setShareModalOpen(false)
        }}
      />
      {/* Document Modal */}
      <DocumentModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        rowId={selectedRowId}
        onDocumentSave={handleDocumentSave}
      />
      {/* Customer Management Modal */}
      <CustomerManagementModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        rowId={selectedRecordId}
        token={authData?.token || ""}
        existingCustomerIds={selectedRecordCustomers}
        onCustomersUpdated={handleCustomersUpdated}
      />
    </div>
  )
}
