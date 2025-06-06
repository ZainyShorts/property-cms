"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import { useSelector } from "react-redux"
import PropertyDataTable from "@/components/overview/Data-Table/DataTable"
import { FilterBar } from "@/components/overview/Filter-Bar/FilterBar"
import { AddPropertyModal } from "./AddProperty-Modal/Modal"
import { SelectionModal } from "./Select-Option/SelectionModal"
import { FileUploadModal } from "./FileUpload/FileUploadModal"
import { PropertyFilterSidebar } from "./Filteration-sidebar/filteration"
import { toast } from "react-toastify"
import axios from "axios"
import type { RootState } from "@/lib/store/store"
import { Loader2 } from "lucide-react"
import { useDispatch } from "react-redux"
import { clearAllFilters } from "@/lib/store/slices/filterSlice"
import { resetRangess } from "@/lib/store/slices/rangeSlice"
import { ShareModal } from "./share-modal/shareModal"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExportModal } from "./Export-Modal/ExportModal"
import { exportToExcel } from "@/lib/exportProperty"

const filter = [
  {
    key: "sortBy",
    label: "Sort By Time",
    options: ["Newest", "Oldest"],
  },
]

const breadcrumbs = [
  { label: "Properties", href: "/dashboard/properties/inventory" },
  { label: "inventory", href: "/dashboard/properties/inventory" },
]

const tableHeaders = [
  "_id",
  "roadLocation",
  "developmentName",
  "subDevelopmentName",
  "projectName",
  "unitHeight",
  "unitInternalDesign",
  "unitExternalDesign",
  "plotSizeSqFt",
  "BuaSqFt",
  "unitNumber",
  "noOfBedRooms",
  "unitView",
  "unitPurpose",
  "listingDate",
  "chequeFrequency",
  "rentalPrice",
  "salePrice",
  "rentedAt",
  "rentedTill",
  "vacantOn",
  "originalPrice",
  "paidTODevelopers",
  "payableTODevelopers",
  "premiumAndLoss",
]

export default function PropertiesPage() {
  const [selectionModalOpen, setSelectionModalOpen] = useState(false)
  const [addPropertyModalOpen, setAddPropertyModalOpen] = useState(false)
  const [fileUploadModalOpen, setFileUploadModalOpen] = useState(false)
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false)
  const [totalPages, setPages] = useState<any>(null)
  const [propertyToEdit, setPropertyToEdit] = useState(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [searchFilter, setSearchFilter] = useState({})
  const [loading, setLoading] = useState<boolean>(true)
  const [sortOrder, setSortOrder] = useState("desc")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [totalCount, setCount] = useState<number>(0)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [propertyType, setPropertyType] = useState("")
  const [pendingSearchFilter, setPendingSearchFilter] = useState("")  
  const [startingIndex, setStartingIndex] = useState(0)
  const [selectedRecordsCache, setSelectedRecordsCache] = useState<Record<string, any>>({})
  const [exportModalOpen, setExportModalOpen] = useState(false) 
  const limit = 10;
  const dispatch = useDispatch()
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedRowsMap, setSelectedRowsMap] = useState<Record<string, boolean>>({})
  const allDataCache = useRef<Record<string, any>>({})
  const [shareData, setShareData] = useState(null)
  const [properties, setProperties] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dataChanged, setDataChanged] = useState(false)

  const sidebarFilters = useSelector((state: RootState) => state.filter)
  const rangeFilters = useSelector((state: any) => state.range)

  const fetchProperties = useCallback(
    async (params: any = {}, page?: number) => {
      setLoading(true)
      try {
        const { filter: filterObj, ...restParams } = params
        const finalParams = {
          ...filterObj, // Spread the filter object contents
          ...restParams, // Include other params
          limit: 10,
          page: page !== undefined ? page : currentPage,
        }
         console.log('final',finalParams);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_CMS_SERVER}/inventory?populate=project,masterDevelopment,subDevelopment`,
          {
            params: finalParams,
          }, 

        ) 
        console.log('res',response);

        if (response.data) {
          setProperties(response.data.data || [])
          setCount(response.data.totalCount || 0)
          setPages(response.data.totalPages || 0)
        }
        setError(null)
      } catch (err) {
        console.error("Error fetching properties:", err)
        setError("Failed to load properties. Please try again.")
        toast.error("Failed to load properties")
      } finally {
        setLoading(false)
      }
    },
    [currentPage],
  )

  useEffect(() => {
    if (Object.keys(searchFilter).length > 0) {
      fetchProperties(
        {
          ...searchFilter,
          sortBy: "createdAt",
          sortOrder: sortOrder,
        },
        currentPage,
      )
    } else {
      fetchProperties({ sortBy: "createdAt", sortOrder: sortOrder }, currentPage)
    } 
        setStartingIndex((currentPage - 1) * limit)
  }, [sortOrder, currentPage])

  const transformedData = properties.map((property: any) => ({
    _id: property._id || "N/A",
    roadLocation: property.project?.masterDevelopment?.roadLocation || "N/A",
    developmentName: property.project?.masterDevelopment?.developmentName || "N/A",
    subDevelopmentName: property.project?.subDevelopment?.subDevelopment || "N/A",
    projectName: property.project?.projectName || "N/A",
    unitHeight: property.unitHeight || "N/A",
    unitInternalDesign: property.unitInternalDesign || "N/A",
    unitExternalDesign: property.unitExternalDesign || "N/A",
    plotSizeSqFt: property.plotSizeSqFt || "N/A",
    BuaSqFt: property.BuaSqFt || "N/A",
    unitNumber: property.unitNumber || "N/A", 
    unitType : property.unitType || "N/A",
    noOfBedRooms: property.noOfBedRooms || "N/A",
    unitView: Array.isArray(property.unitView) && property.unitView.length > 0 ? property.unitView : "N/A",
    unitPurpose: property.unitPurpose || "N/A",
    listingDate: property.listingDate || "N/A",
    chequeFrequency: property.chequeFrequency || "N/A",
    rentalPrice: property.rentalPrice || "N/A",
    salePrice: property.salePrice || "N/A",
    rentedAt: property.rentedAt || "N/A",
    rentedTill: property.rentedTill || "N/A",
    vacantOn: property.vacantOn || "N/A",
    originalPrice: property.originalPrice || "N/A",
    paidTODevelopers: property.paidTODevelopers || "N/A",
    payableTODevelopers: property.payableTODevelopers || "N/A",
    premiumAndLoss:
      property.premiumAndLoss ||
      (property.salePrice && property.originalPrice ? property.salePrice - property.originalPrice : "N/A"),
  }))

  const toggleRow = (id: string) => {
    setSelectedRowsMap((prev) => {
      const newMap = { ...prev }
      newMap[id] = !prev[id]

      if (newMap[id]) {
        const record = transformedData.find((r) => r._id === id)
        if (record) {
          setSelectedRecordsCache((cache) => ({
            ...cache,
            [id]: record,
          }))
        }
      }

      return newMap
    })
  }

  const toggleColumns = (columnKey: any) => {
    setSelectedColumns((prev) =>
      prev.includes(columnKey) ? prev.filter((key) => key != columnKey) : [...prev, columnKey],
    )
  }

  useEffect(() => {
    const selected = Object.entries(selectedRowsMap)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id)

    setSelectedRows(selected)
  }, [selectedRowsMap])

  useEffect(() => {
    if (transformedData && transformedData.length > 0) {
      const newCache = { ...allDataCache.current }

      transformedData.forEach((record) => {
        newCache[record._id] = record
      })

      allDataCache.current = newCache
    }
  }, [transformedData])

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date || null)
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date || null)
  }

  const handleShareButton = (data: any) => {
    setShareData(data)
    setShareModalOpen(true)
  }

  const handleFilterChange = (key: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [key]: value }))
    if (key === "sortBy") {
      setSortOrder(value === "Newest" ? "desc" : "asc")
    } else if (key === "propertiesManaged") {
      setPropertyType(value)
    }
  }

  const cleanFilters = (filters: any) => {
    const cleaned: any = {}

    const isEmpty = (value: any) => {
      if (value === null || value === undefined || value === "") return true
      if (Array.isArray(value) && value.length === 0) return true
      if (typeof value === "object" && Object.keys(value).length === 0) return true
      return false
    }

    const hasValidRange = (range: any) => {
      if (!range || typeof range !== "object") return false
      return range.min !== undefined || range.max !== undefined
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (isEmpty(value)) return

      if (typeof value === "object" && "min" in value && "max" in value) {
        if (hasValidRange(value)) {
          cleaned[key] = value
        }
        return
      }

      if (Array.isArray(value)) {
        if (value.length > 0) cleaned[key] = value
        return
      }

      if (typeof value === "string" && value.trim() !== "") {
        cleaned[key] = value.trim()
      }

      if (typeof value === "number" && value !== 0) {
        cleaned[key] = value
      }
    })

    return cleaned
  }

const handleApplyFilters = () => {
  const searchFilterObj = pendingSearchFilter ? { _id: pendingSearchFilter } : {}

  const dateFilters = {
    ...(startDate && { startDate: startDate.toISOString() }),
    ...(endDate && { endDate: endDate.toISOString() }),
  }

  const propertyTypeFilter = propertyType ? { propertyType } : {}
  const cleanedSidebarFilters = cleanFilters(sidebarFilters)

  const queryParams = {
    ...cleanedSidebarFilters,
    ...searchFilterObj,
    ...dateFilters,
    ...propertyTypeFilter,
    
    // Number of Bedrooms Range
    ...(rangeFilters.minBed &&
      rangeFilters.maxBed && {
        bedroomsMin: Number.parseInt(rangeFilters.minBed),
        bedroomsMax: Number.parseInt(rangeFilters.maxBed),
      }),
    
    // Plot Size Range
    ...(sidebarFilters.plotSizeSqFt?.min &&
      sidebarFilters.plotSizeSqFt?.max && {
        plotSizeSqFtMin: sidebarFilters.plotSizeSqFt.min,
        plotSizeSqFtMax: sidebarFilters.plotSizeSqFt.max,
      }),
    
    // BUA Range
    ...(sidebarFilters.BuaSqFt?.min &&
      sidebarFilters.BuaSqFt?.max && {
        BuaSqFtMin: sidebarFilters.BuaSqFt.min,
        BuaSqFtMax: sidebarFilters.BuaSqFt.max,
      }),
    
    // Number of Bedrooms Range (from sidebar filters)
    ...(sidebarFilters.noOfBedRooms?.min &&
      sidebarFilters.noOfBedRooms?.max && {
        noOfBedRoomsMin: sidebarFilters.noOfBedRooms.min,
        noOfBedRoomsMax: sidebarFilters.noOfBedRooms.max,
      }),
    
    // Purchase Price Range
    ...(sidebarFilters.purchasePriceRange?.min &&
      sidebarFilters.purchasePriceRange?.max && {
        purchasePriceMin: sidebarFilters.purchasePriceRange.min,
        purchasePriceMax: sidebarFilters.purchasePriceRange.max,
      }),
    
    ...(sidebarFilters.marketPriceRange?.min &&
      sidebarFilters.marketPriceRange?.max && {
        marketPriceMin: sidebarFilters.marketPriceRange.min,
        marketPriceMax: sidebarFilters.marketPriceRange.max,
      }),
    
    // Asking Price Range
    ...(sidebarFilters.askingPriceRange?.min &&
      sidebarFilters.askingPriceRange?.max && {
        askingPriceMin: sidebarFilters.askingPriceRange.min,
        askingPriceMax: sidebarFilters.askingPriceRange.max,
      }),
    
    // Market Rent Range
    ...(sidebarFilters.marketRentRange?.min &&
      sidebarFilters.marketRentRange?.max && {
        marketRentMin: sidebarFilters.marketRentRange.min,
        marketRentMax: sidebarFilters.marketRentRange.max,
      }),
    
    // Asking Rent Range
    ...(sidebarFilters.askingRentRange?.min &&
      sidebarFilters.askingRentRange?.max && {
        askingRentMin: sidebarFilters.askingRentRange.min,
        askingRentMax: sidebarFilters.askingRentRange.max,
      }),
    
    // Premium and Loss Range
    ...(sidebarFilters.premiumAndLossRange?.min &&
      sidebarFilters.premiumAndLossRange?.max && {
        premiumAndLossMin: sidebarFilters.premiumAndLossRange.min,
        premiumAndLossMax: sidebarFilters.premiumAndLossRange.max,
      }),
    
    // Legacy range filters (keeping for backward compatibility)
    ...(rangeFilters.minPrimaryPrice &&
      rangeFilters.maxPrimaryPrice && {
        primaryPriceMin: Number.parseInt(rangeFilters.minPrimaryPrice),
        primaryPriceMax: Number.parseInt(rangeFilters.maxPrimaryPrice),
      }),
    
    ...(rangeFilters.minRent &&
      rangeFilters.maxRent && {
        rentMin: Number.parseInt(rangeFilters.minRent),
        rentMax: Number.parseInt(rangeFilters.maxRent),
      }),
    
    ...(rangeFilters.minResalePrice &&
      rangeFilters.maxResalePrice && {
        resalePriceMin: Number.parseInt(rangeFilters.minResalePrice),
        resalePriceMax: Number.parseInt(rangeFilters.maxResalePrice),
      }),
    
    sortBy: "createdAt",
    sortOrder: sortOrder,
  }
  
  setSearchFilter(queryParams)
  setCurrentPage(1) // Reset to page 1 when applying filters
  fetchProperties(queryParams, 1) // Pass 1 as the page number
}

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value
    setPendingSearchFilter(searchValue)
  }

  const handleAdd = () => setSelectionModalOpen(true)

  const handleManualSelect = () => {
    setAddPropertyModalOpen(true)
    setDataChanged(false)
  }

  const handleFileSelect = () => {
    setSelectionModalOpen(false)
    setFileUploadModalOpen(true)
  }

  const handleFilter = () => {
    setFilterSidebarOpen(true)
  }

  const handleDelete = async (_id: string) => {
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_CMS_SERVER}/inventory/${_id}`)
      if (response) {
        toast.success("Property Deleted successfully!")
        setDataChanged(true)
      }

      fetchProperties({
        ...searchFilter,
        sortBy: "createdAt",
        sortOrder: sortOrder,
      })

      return response.data
    } catch (error) {
      console.error("Error deleting property")
      throw error
    }
  }

  const handleUpdate = (property: any) => { 
    // const originalProperty = properties.find((p) => p._id === property._id)
    // console.log('prpertyto edit',property);
    setPropertyToEdit( property)
    setAddPropertyModalOpen(true)
    setDataChanged(false)
  }

  const handleExport = () => {
    setExportModalOpen(true)
  }

  const handleCloseExportModal = () => {
    setExportModalOpen(false)
    setPropertyToEdit(null)
  }

  const handlePropertyChange = (changed: boolean) => {
    setDataChanged(changed)
  }

  const getSelectedData = () => {
    if (selectedRows.length === 0 || selectedColumns.length === 0) {
      return []
    }

    return selectedRows
      .map((id) => {
        const record = selectedRecordsCache[id] || allDataCache.current[id] || transformedData.find((r) => r._id === id)
        if (!record) return null

        const selectedData: Record<string, any> = {}
        selectedColumns.forEach((col) => {
          selectedData[col] = record[col]
        })
        return selectedData
      })
      .filter(Boolean)
  }

  const isRowSelected = (id: string): boolean => {
    return !!selectedRowsMap[id]
  }

  const exportSelectedData = () => {
    if (selectedRows.length === 0 || selectedColumns.length === 0) {
      toast.error("Please select at least one row and one column to export")
      return
    }

    const selectedData = getSelectedData()
    if (selectedData.length === 0) {
      toast.error("No data found for the selected rows")
      return
    }

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

  const handleSubmitExport = async (exportOption: any, count: any) => {
    setLoading(true)
    if (isSelectionMode && selectedRows.length > 0 && selectedColumns.length > 0) {
      exportSelectedData()
      setLoading(false)
      return
    }

    if (exportOption === "false" || exportOption === false) {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_CMS_SERVER}/inventory?populate=project,masterDevelopment,subDevelopment`,
          {
            params: {
              sortBy: "createdAt",
              sortOrder: "asc",
              limit: 10,
            },
          },
        )

        if (response.data?.data) {
          exportToExcel(response.data.data)
        } else {
          console.error("No data available for export")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    } else {
      try {
        const searchFilterObj = pendingSearchFilter ? { _id: pendingSearchFilter } : {}

        const dateFilters = {
          ...(startDate && { startDate: startDate.toISOString() }),
          ...(endDate && { endDate: endDate.toISOString() }),
        }

        const propertyTypeFilter = propertyType ? { propertyType } : {}
        const cleanedSidebarFilters = cleanFilters(sidebarFilters)

        const queryParams = {
          ...cleanedSidebarFilters,
          ...searchFilterObj,
          ...dateFilters,
          ...propertyTypeFilter,
          ...(rangeFilters.minBed &&
            rangeFilters.maxBed && {
              bedroomsMin: Number.parseInt(rangeFilters.minBed),
              bedroomsMax: Number.parseInt(rangeFilters.maxBed),
            }),
          ...(rangeFilters.minPrimaryPrice &&
            rangeFilters.maxPrimaryPrice && {
              primaryPriceMin: Number.parseInt(rangeFilters.minPrimaryPrice),
              primaryPriceMax: Number.parseInt(rangeFilters.maxPrimaryPrice),
            }),
          ...(rangeFilters.minRent &&
            rangeFilters.maxRent && {
              rentMin: Number.parseInt(rangeFilters.minRent),
              rentMax: Number.parseInt(rangeFilters.maxRent),
            }),
          ...(rangeFilters.minResalePrice &&
            rangeFilters.maxResalePrice && {
              resalePriceMin: Number.parseInt(rangeFilters.minResalePrice),
              resalePriceMax: Number.parseInt(rangeFilters.maxResalePrice),
            }),
          sortBy: "createdAt",
          sortOrder: "asc",
          limit: 10,
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_CMS_SERVER}/inventory?populate=project,masterDevelopment,subDevelopment`,
          {
            params: queryParams,
          },
        )

        if (response.data?.data) {
          exportToExcel(response.data.data)
        } else {
          console.error("No data available for export")
        }

        handleCloseExportModal()
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    setLoading(false)
  }

  const handleClearFilters = () => {
    dispatch(clearAllFilters())
    dispatch(resetRangess())
    setSearchFilter({})
    setSortOrder("desc")
    setStartDate(null)
    setEndDate(null)
    setPropertyType("")
    setPendingSearchFilter("")
    setSelectedOptions({})

    fetchProperties({
      sortBy: "createdAt",
      sortOrder: "desc",
    })

    setCurrentPage(1)
  }

  const clearAllSelections = () => {
    setSelectedRows([])
    setSelectedColumns([])
    setSelectedRowsMap({})
    setSelectedRecordsCache({})
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background ">
      <FilterBar
        filters={filter}
        breadcrumbs={breadcrumbs}
        onAddButton={handleManualSelect}
        onFilter={handleFilter}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        showDatePickers={true}
        setIsSelectionMode={setIsSelectionMode}
        fetchRecords={() =>
          fetchProperties({
            ...searchFilter,
            sortBy: "createdAt",
            sortOrder: sortOrder,
          })
        }
        isSelectionMode={isSelectionMode}
        setSelectedColumns={setSelectedColumns}
        selectedRows={selectedRows}
        selectedColumns={selectedColumns}
        setSelectedRows={setSelectedRows}
        onApplyFilters={handleApplyFilters}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        startDate={startDate || undefined}
        endDate={endDate || undefined}
        onClear={handleClearFilters}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        onExport={handleExport}
      />
      <main className="container mx-auto md:px-4 py-6">
        {transformedData.length > 0 ? (
          <PropertyDataTable
            page={currentPage}
            setPage={setCurrentPage}
            toggleRow={toggleRow}
            totalPages={totalPages}
            toggleColumns={toggleColumns}
            Count={totalCount} 
            startingIndex={startingIndex}
            setSelectedRowsMap={setSelectedRowsMap}
            setIsSelectionMode={setIsSelectionMode}
            selectedRowsMap={selectedRowsMap}
            isSelectionMode={isSelectionMode}
            setSelectedColumns={setSelectedColumns}
            selectedRows={selectedRows}
            selectedColumns={selectedColumns}
            setSelectedRows={setSelectedRows}
            data={transformedData}
            isRowSelected={isRowSelected}
            onShare={handleShareButton}
            onDelete={handleDelete}
            onEdit={handleUpdate}
            clearAllSelections={clearAllSelections}
          />
        ) : (
          <Alert>
            <AlertTitle>No properties found</AlertTitle>
            <AlertDescription>
              No properties match your current filtration criteria. Try adjusting your filters or adding new properties.
            </AlertDescription>
          </Alert>
        )}
      </main>

      <SelectionModal
        isOpen={selectionModalOpen}
        onClose={() => setSelectionModalOpen(false)}
        onManualSelect={handleManualSelect}
        onFileSelect={handleFileSelect}
      />

      <AddPropertyModal
        isOpen={addPropertyModalOpen}
        onClose={() => {
          setAddPropertyModalOpen(false)
          setPropertyToEdit(null)
          if (dataChanged) {
            fetchProperties({
              ...searchFilter,
              sortBy: "createdAt",
              sortOrder: sortOrder,
            })
          }
        }}
        propertyToEdit={propertyToEdit}
        fetchRecords={() =>
          fetchProperties({
            ...searchFilter,
            sortBy: "createdAt",
            sortOrder: sortOrder,
          })
        }
        onPropertyChange={handlePropertyChange}
      />

      <FileUploadModal
        isOpen={fileUploadModalOpen}
        onClose={() => {
          setFileUploadModalOpen(false)
          fetchProperties({
            ...searchFilter,
            sortBy: "createdAt",
            sortOrder: sortOrder,
          })
        }}
      />

      <PropertyFilterSidebar open={filterSidebarOpen} onOpenChange={setFilterSidebarOpen} />
      <ExportModal isOpen={exportModalOpen} onClose={handleCloseExportModal} onSubmitExport={handleSubmitExport} />
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onShare={(options) => {
          console.log("Share options:", options)
          console.log("Share data:", shareData)
          setShareModalOpen(false)
        }}
      />
    </div>
  )
}
