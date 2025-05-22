"use client"

import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

import { DropdownMenuLabel } from "@/components/ui/dropdown-menu"

import { useState, useEffect, memo, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Trash2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  MousePointerIcon as MousePointerSquare,
  X,
  ClipboardCheck,
  Upload,
  Eye,
  Info,
  ArrowLeft,
  Edit,
  Settings,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import DocumentModal from "./DocumentModal"
import { Switch } from "@/components/ui/switch"
import { DeleteConfirmationModal } from "@/app/dashboard/properties/projects/delete-confirmation-modal"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { Checkbox as UICheckbox } from "@/components/ui/checkbox"

// Define categories for column grouping
const projectDetails = ["_id", "roadLocation", "developmentName", "subDevelopmentName", "projectName"]

const unitDetails = [
  "unitNumber",
  "unitHeight",
  "unitInternalDesign",
  "unitExternalDesign",
  "plotSizeSqFt",
  "BuaSqFt",
  "noOfBedRooms",
  "unitView",
]

const availability = ["unitPurpose", "listingDate", "chequeFrequency", "rentalPrice", "salePrice"]

const unitTenancyDetails = ["rentedAt", "rentedTill", "vacantOn"]

const paymentDetails = ["originalPrice", "paidTODevelopers", "payableTODevelopers", "premiumAndLoss"]

const actions = ["edit", "attachDocument", "view"]

interface PropertyDataTableProps {
  data?: any[]
  page?: number
  setPage: (page: number) => void
  Count: number
  onDelete?: (id: string) => void
  onShare?: (data: any) => void
  onEdit?: (row: any) => void
  totalPages?: any
  onAttachDocument?: (id: string) => void
  loading?: boolean
  selectedRows?: string[]
  setSelectedRows?: (rows: string[]) => void
  selectedColumns?: string[]
  setSelectedColumns?: (columns: string[]) => void
  toggleColumns?: (column: string) => void
  toggleRow?: (id: string) => boolean
  selectedRowsMap?: Record<string, boolean>
  setSelectedRowsMap?: (map: Record<string, boolean>) => void
  isSelectionMode?: boolean
  setIsSelectionMode?: (mode: boolean) => boolean
  isRowSelected?: (id: string) => boolean
  clearAllSelections?: () => void
}

function PropertyDataTable({
  data = [],
  page = 1,
  setPage,
  Count,
  onDelete,
  totalPages,
  onShare,
  selectedRows = [],
  setSelectedColumns = () => {},
  setSelectedRows = () => {},
  toggleColumns = () => {},
  toggleRow = () => {},
  selectedColumns = [],
  setIsSelectionMode = () => {},
  selectedRowsMap = {},
  isRowSelected = () => false,
  setSelectedRowsMap = () => {},
  isSelectionMode = false,
  onEdit,
  onAttachDocument,
  loading = false,
  clearAllSelections = () => {},
}: PropertyDataTableProps) {
  const [copiedIds, setCopiedIds] = useState<Record<string, boolean>>({})
  const [checkState, setCheckState] = useState<string>("all")
  const [isAttachingDocument, setIsAttachingDocument] = useState(false)
  const router = useRouter()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [recordDelete, setRecordToDelete] = useState<any>("")
  // Add a new state to track if columns have been modified via settings wheel
  const [columnsModified, setColumnsModified] = useState(false)

  const itemsPerPage = 10

  // Table headers configuration
  const tableHeaders = [
    // Project Details
    { key: "_id", label: "ID" },
    { key: "roadLocation", label: "LOCATION NAME" },
    { key: "developmentName", label: "DEVELOPMENT NAME" },
    { key: "subDevelopmentName", label: "SUB DEVELOPMENT" },
    { key: "projectName", label: "PROJECT NAME" },

    // Unit Details
    { key: "unitNumber", label: "UNIT NUMBER" },
    { key: "unitHeight", label: "UNIT HEIGHT" },
    { key: "unitInternalDesign", label: "INTERNAL DESIGN" },
    { key: "unitExternalDesign", label: "EXTERNAL DESIGN" },
    { key: "plotSizeSqFt", label: "PLOT SIZE (SQ. FT)" },
    { key: "BuaSqFt", label: "BUA (SQ. FT)" },
    { key: "noOfBedRooms", label: "BED ROOMS" },
    { key: "unitView", label: "UNIT VIEW" },

    // Availability
    { key: "unitPurpose", label: "PURPOSE" },
    { key: "listingDate", label: "LISTING DATE" },
    { key: "chequeFrequency", label: "CHEQUE FREQUENCY" },
    { key: "rentalPrice", label: "RENTAL PRICE" },
    { key: "salePrice", label: "SALE PRICE" },

    // Unit Tenancy Details
    { key: "rentedAt", label: "RENTED AT" },
    { key: "rentedTill", label: "RENTED TILL" },
    { key: "vacantOn", label: "VACANT ON" },

    // Payment Details
    { key: "originalPrice", label: "ORIGINAL PRICE" },
    { key: "paidTODevelopers", label: "PAID TO DEVELOPERS" },
    { key: "payableTODevelopers", label: "PAYABLE TO DEVELOPERS" },
    { key: "premiumAndLoss", label: "PREMIUM / LOSS" },

    // Actions
    { key: "attachDocument", label: "DOCUMENT" },
    { key: "view", label: "VIEW" },
    { key: "edit", label: "EDIT" },
    // { key: "delete", label: "DELETE" },
  ]

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    tableHeaders.reduce((acc, header) => ({ ...acc, [header.key]: true }), {}),
  )
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const handleDocumentSave = async (documentData: any) => {
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

  const handleCopyId = useCallback(
    (id: string) => {
      navigator.clipboard.writeText(id)
      setCopiedIds({ ...copiedIds, [id]: true })
      setTimeout(() => {
        setCopiedIds((prev) => ({ ...prev, [id]: false }))
      }, 2000)
    },
    [copiedIds],
  )

  const handleAttachDocument = (recordId: string) => {
    setSelectedRowId(recordId)
    setIsDocumentModalOpen(true)
  }

  const handleEditRecord = useCallback(
    (record: any) => {
      onEdit?.(record)
    },
    [onEdit],
  )

  const confirmDelete = useCallback(() => {
    onDelete?.(recordDelete)
  }, [onDelete, recordDelete])

  const [showHeaderCategories, setShowHeaderCategories] = useState(false)

  const toggleColumnVisibility = useCallback((columnKey: string, headers?: string) => {
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
      } else if (headers === "unitDetails") {
        setCheckState("unitDetails")
        setVisibleColumns((prev) => {
          const updated = Object.keys(prev).reduce((acc: any, key) => {
            acc[key] = unitDetails.includes(key)
            return acc
          }, {})
          return updated
        })
      } else if (headers === "availability") {
        setCheckState("availability")
        setVisibleColumns((prev) => {
          const updated = Object.keys(prev).reduce((acc: any, key) => {
            acc[key] = availability.includes(key)
            return acc
          }, {})
          return updated
        })
      } else if (headers === "unitTenancyDetails") {
        setCheckState("unitTenancyDetails")
        setVisibleColumns((prev) => {
          const updated = Object.keys(prev).reduce((acc: any, key) => {
            acc[key] = unitTenancyDetails.includes(key)
            return acc
          }, {})
          return updated
        })
      } else if (headers === "paymentDetails") {
        setCheckState("paymentDetails")
        setVisibleColumns((prev) => {
          const updated = Object.keys(prev).reduce((acc: any, key) => {
            acc[key] = paymentDetails.includes(key)
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
  }, [])

  useEffect(() => {
    setSelectedRows(Object.keys(selectedRowsMap).filter((id) => selectedRowsMap[id]))
  }, [selectedRowsMap, setSelectedRows])

  const goToPage = useCallback(
    (pageNumber: number) => {
      setPage(pageNumber)
    },
    [setPage],
  )

  const toggleSelectionMode = useCallback(() => {
    if (isSelectionMode) {
      setIsSelectionMode(false)
      setSelectedRows([])
      setSelectedColumns([])
      setSelectedRowsMap({})
    } else {
      setIsSelectionMode(true)
    }
  }, [isSelectionMode, setIsSelectionMode, setSelectedRows, setSelectedColumns, setSelectedRowsMap])

  // Modify the getSelectedData function to handle both selection mode and column visibility mode
  const getSelectedData = useCallback(() => {
    if (isSelectionMode) {
      if (selectedRows.length === 0 || selectedColumns.length === 0) return []

      return data
        .filter((row) => selectedRows.includes(row._id))
        .map((row) => {
          const filteredRow: Record<string, any> = {}
          selectedColumns.forEach((key) => {
            filteredRow[key] = row[key]
          })
          return filteredRow
        })
    } else {
      // When not in selection mode but columns are modified via settings wheel
      const visibleKeys = Object.keys(visibleColumns).filter((key) => visibleColumns[key])
      if (visibleKeys.length === 0) return []

      return data.map((row) => {
        const filteredRow: Record<string, any> = {}
        visibleKeys.forEach((key) => {
          filteredRow[key] = row[key]
        })
        return filteredRow
      })
    }
  }, [data, selectedRows, selectedColumns, isSelectionMode, visibleColumns])

  const logSelectedData = useCallback(() => {
    const selectedData = getSelectedData()
    onShare?.(selectedData)
  }, [getSelectedData, onShare])

  const selectAllRows = useCallback(() => {
    const newSelectedRows = data.map((row) => row._id)
    setSelectedRows(newSelectedRows)

    const newMap = { ...selectedRowsMap }
    data.forEach((row) => {
      newMap[row._id] = true
    })
    setSelectedRowsMap(newMap)
  }, [data, selectedRowsMap, setSelectedRows, setSelectedRowsMap])

  const selectAllColumns = useCallback(() => {
    setSelectedColumns(tableHeaders.map((header) => header.key))
  }, [setSelectedColumns])

  const renderCellContent = useCallback(
    (record: any, key: string) => {
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
        case "plotSizeSqFt":
        case "BuaSqFt":
        case "originalPrice":
        case "rentalPrice":
        case "salePrice":
        case "unitNumber":
        case "paidTODevelopers":
        case "payableTODevelopers":
        case "premiumAndLoss":
          return record[key] ? record[key].toLocaleString() : "-"
        case "attachDocument":
          return (
            <div className="flex justify-center">
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
            </div>
          )
        case "view":
          return (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                onClick={() => window.open(`/inventory-details/${record._id}`, "_blank")}
                disabled={isAttachingDocument}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </div>
          )
        case "unitView":
          if (Array.isArray(record[key])) {
            return (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="flex items-center justify-center gap-2 cursor-pointer">
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                    >
                      {record[key].length}
                    </Badge>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-0">
                  <div className="p-4">
                    <h4 className="font-medium text-sm mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                      Unit Views ({record[key].length})
                    </h4>
                    {record[key].length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {record[key].map((view: string, idx: number) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                          >
                            {view}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No views</p>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            )
          }
          return record[key] || "-"
        case "edit":
          return (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                onClick={() => handleEditRecord(record)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          )
        case "delete":
          return (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  setRecordToDelete(record._id)
                  setIsDeleteModalOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )
        case "listingDate":
        case "rentedAt":
        case "rentedTill":
        case "vacantOn":
          const value = record[key]
          if (value === "") return "N/A"
          if (!value) return "-"
          const date = new Date(value)
          return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString()

        default:
          return record[key] || "-"
      }
    },
    [copiedIds, handleCopyId, handleEditRecord],
  )

  return (
    <>
      <div className="rounded-lg border shadow-sm">
        {/* Selection toolbar */}
        {isSelectionMode && (
          <div className="p-3 border-b border-border">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="px-2 py-1 text-xs font-medium bg-background">
                  Selection Mode
                </Badge>
                <div className="flex items-center flex-wrap gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllRows}
                    className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Select All Rows
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllColumns}
                    className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Select All Columns
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllSelections}
                    className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-2">
                {(selectedRows.length > 0 || selectedColumns.length > 0) && (
                  <Badge className="border-border">
                    {selectedRows.length} rows × {selectedColumns.length} columns
                  </Badge>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectionMode}
                  className="h-8 gap-1 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                  Exit Selection
                </Button>

                {selectedRows.length > 0 && selectedColumns.length > 0 && (
                  <Button variant="default" size="sm" onClick={logSelectedData} className="h-8 gap-1.5">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Export Selection
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main toolbar */}
        <div className="p-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            {!isSelectionMode ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={toggleSelectionMode} className="gap-1.5">
                      <MousePointerSquare className="h-4 w-4" />
                      Enable Selection
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Select specific rows and columns</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
            <div className="flex items-center gap-2">
              <Switch checked={showHeaderCategories} onCheckedChange={setShowHeaderCategories} id="show-headers" />
              <label htmlFor="show-headers" className="text-sm cursor-pointer">
                Show Headers
              </label>

              {showHeaderCategories && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-2 gap-1">
                      Select Header <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "all")}>All Headers</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "projectDetails")}>
                      Project Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "unitDetails")}>
                      Unit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "availability")}>
                      Availability
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "unitTenancyDetails")}>
                      Unit Tenancy Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "paymentDetails")}>
                      Payment Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleColumnVisibility("a", "actions")}>Actions</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          {/* Add an export button in the main toolbar when columns are modified but not in selection mode */}
          {!isSelectionMode && columnsModified && (
            <Button variant="default" size="sm" onClick={logSelectedData} className="h-8 gap-1.5 ml-auto">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Export Visible Columns
            </Button>
          )}
          {/* Add settings wheel dropdown here */} 
          {!isSelectionMode && 
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Toggle columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[70vh] overflow-y-auto">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tableHeaders.map((header) => (
                <DropdownMenuItem
                  key={header.key}
                  className="flex items-center gap-2"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex items-center space-x-2">
                    <UICheckbox
                      id={`column-${header.key}`}
                      checked={visibleColumns[header.key]}
                      onCheckedChange={(checked) => {
                        setVisibleColumns((prev) => {
                          const updated = {
                            ...prev,
                            [header.key]: !!checked,
                          }
                          // Set columnsModified to true when any column visibility changes
                          setColumnsModified(true)
                          return updated
                        })
                      }}
                    />
                    <label
                      htmlFor={`column-${header.key}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {header.label}
                    </label>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          }
        </div>

        <div className="overflow-x-auto thin-scrollbar sm:mx-0">
          <div className="min-w-full inline-block align-middle">
            <Table>
              <TableHeader>
                {showHeaderCategories && (
                  <TableRow>
                    {isSelectionMode && (
                      <TableHead className="w-12 px-4 py-3 text-center">
                        <span className="sr-only">Selection</span>
                      </TableHead>
                    )}

                    {(checkState === "projectDetails" || checkState === "all") && (
                      <TableHead
                        onClick={() => toggleColumnVisibility("a", "projectDetails")}
                        colSpan={projectDetails.filter((key) => visibleColumns[key]).length}
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

                    {(checkState === "unitDetails" || checkState === "all") && (
                      <TableHead
                        onClick={() => toggleColumnVisibility("a", "unitDetails")}
                        colSpan={unitDetails.filter((key) => visibleColumns[key]).length}
                        className="text-center cursor-pointer font-bold bg-gradient-to-b from-teal-300 to-teal-100 border-r border-border relative"
                      >
                        Unit Details
                        {checkState === "unitDetails" && (
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

                    {(checkState === "availability" || checkState === "all") && (
                      <TableHead
                        onClick={() => toggleColumnVisibility("a", "availability")}
                        colSpan={availability.filter((key) => visibleColumns[key]).length}
                        className="text-center cursor-pointer font-bold bg-gradient-to-b from-orange-500 to-orange-400 border-r border-border relative"
                      >
                        Availability
                        {checkState === "availability" && (
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

                    {(checkState === "unitTenancyDetails" || checkState === "all") && (
                      <TableHead
                        onClick={() => toggleColumnVisibility("a", "unitTenancyDetails")}
                        colSpan={unitTenancyDetails.filter((key) => visibleColumns[key]).length}
                        className="text-center cursor-pointer font-bold bg-gradient-to-b from-blue-500 to-blue-400 border-r border-border relative"
                      >
                        Unit Tenancy Details
                        {checkState === "unitTenancyDetails" && (
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

                    {(checkState === "paymentDetails" || checkState === "all") && (
                      <TableHead
                        onClick={() => toggleColumnVisibility("a", "paymentDetails")}
                        colSpan={paymentDetails.filter((key) => visibleColumns[key]).length}
                        className="text-center cursor-pointer font-bold bg-gradient-to-b from-blue-500 to-blue-400 border-r border-border relative"
                      >
                        Payment Details
                        {checkState === "paymentDetails" && (
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
                        colSpan={actions.filter((key) => visibleColumns[key]).length}
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

                <TableRow className="border-b border-border hover:bg-transparent">
                  {isSelectionMode && (
                    <TableHead className="w-12 px-4 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <span className="sr-only">Row selection</span>
                      </div>
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
                          header.key === "roadLocation" && "w-[120px]",
                          header.key === "developmentName" && "w-[150px]",
                          header.key === "subDevelopmentName" && "w-[150px]",
                          header.key === "projectName" && "w-[150px]",
                          header.key === "unitNumber" && "w-[120px]",
                          header.key === "unitHeight" && "w-[120px]",
                          header.key === "unitInternalDesign" && "w-[150px]",
                          header.key === "unitExternalDesign" && "w-[150px]",
                          header.key === "plotSizeSqFt" && "w-[120px]",
                          header.key === "BuaSqFt" && "w-[120px]",
                          header.key === "noOfBedRooms" && "w-[120px]",
                          header.key === "unitView" && "w-[100px]",
                          header.key === "unitPurpose" && "w-[100px]",
                          header.key === "listingDate" && "w-[120px]",
                          header.key === "chequeFrequency" && "w-[150px]",
                          header.key === "rentalPrice" && "w-[120px]",
                          header.key === "salePrice" && "w-[120px]",
                          header.key === "rentedAt" && "w-[120px]",
                          header.key === "rentedTill" && "w-[120px]",
                          header.key === "vacantOn" && "w-[120px]",
                          header.key === "originalPrice" && "w-[120px]",
                          header.key === "paidTODevelopers" && "w-[150px]",
                          header.key === "payableTODevelopers" && "w-[150px]",
                          header.key === "premiumAndLoss" && "w-[120px]",
                          header.key === "edit" && "w-[100px]",
                          header.key === "delete" && "w-[100px]",
                        )}
                      >
                        {isSelectionMode && (
                          <div className="flex flex-col items-center">
                            <input
                              type="checkbox"
                              checked={selectedColumns.includes(header.key)}
                              onChange={() => toggleColumns(header.key)}
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
                            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                          </TableCell>
                        )}
                        {tableHeaders
                          .filter((header) => visibleColumns[header.key])
                          .map((header) => (
                            <TableCell key={`${index}-${header.key}`}>
                              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                            </TableCell>
                          ))}
                      </TableRow>
                    ))
                ) : data.length > 0 ? (
                  data.map((record, index) => (
                    <TableRow key={record._id} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}>
                      {isSelectionMode && (
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={isRowSelected(record._id)}
                            onChange={() => toggleRow(record._id)}
                          />
                        </TableCell>
                      )}
                      {tableHeaders
                        .filter((header) => visibleColumns[header.key])
                        .map((header) => (
                          <TableCell key={`${record._id}-${header.key}`} className="text-center">
                            {renderCellContent(record, header.key)}
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
        </div>

        {/* Pagination */}
        <div className="p-3 sm:p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">{data.length} records</span>

          <div className="flex justify-center items-center flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="hover:bg-muted h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {totalPages <= 3 ? (
              // If 3 or fewer pages, show all page numbers
              Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={page === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNumber)}
                  className={`min-w-7 sm:min-w-8 ${page === pageNumber ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  {pageNumber}
                </Button>
              ))
            ) : (
              // If more than 3 pages, show simplified pagination
              <>
                {/* Always show page 1 */}
                <Button
                  variant={page === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(1)}
                  className={`min-w-7 sm:min-w-8 ${page === 1 ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  1
                </Button>

                {/* Show ellipsis if current page > 3 */}
                {page > 3 && <span className="px-2 text-muted-foreground">...</span>}

                {/* Show current page and surrounding pages */}
                {page > 2 && page < totalPages - 1 && (
                  <>
                    {page > 3 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(page - 1)}
                        className="min-w-7 sm:min-w-8 hover:bg-muted hidden sm:inline-flex"
                      >
                        {page - 1}
                      </Button>
                    )}

                    <Button
                      variant="default"
                      size="sm"
                      className="min-w-7 sm:min-w-8 bg-primary text-primary-foreground"
                    >
                      {page}
                    </Button>

                    {page < totalPages - 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(page + 1)}
                        className="min-w-7 sm:min-w-8 hover:bg-muted hidden sm:inline-flex"
                      >
                        {page + 1}
                      </Button>
                    )}
                  </>
                )}

                {/* Show ellipsis if current page < totalPages - 2 */}
                {page < totalPages - 2 && <span className="px-2 text-muted-foreground">...</span>}

                {/* Always show last page */}
                <Button
                  variant={page === totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  className={`min-w-7 sm:min-w-8 ${page === totalPages ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  {totalPages}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages || totalPages === 0}
              className="hover:bg-muted h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <span className="text-sm text-muted-foreground ml-2">
              Page {page} of {totalPages || 1}
            </span>
          </div>
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setRecordToDelete("")
        }}
        onConfirm={confirmDelete}
      />
      <DocumentModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        rowId={selectedRowId}
        onDocumentSave={handleDocumentSave}
      />
    </>
  )
}

export default memo(PropertyDataTable)
