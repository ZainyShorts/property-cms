"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useSelector } from "react-redux"
import { useQuery } from "@apollo/client"
import { DataTable } from "@/components/overview/Data-Table/DataTable"
import { FilterBar } from "@/components/overview/Filter-Bar/FilterBar"
import { AddPropertyModal } from "./AddProperty-Modal/Modal"
import { SelectionModal } from "./Select-Option/SelectionModal"
import { FileUploadModal } from "./FileUpload/FileUploadModal"
import { PropertyFilterSidebar } from "./Filteration-sidebar/filteration"
import { toast } from "react-toastify"
import axios from "axios"
import { GET_PROPERTIES } from "@/lib/query"
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
    key: "propertiesManaged",
    label: "Properties Managed",
    options: ["Townhouse", "Education", "Office", "Nursery", "Shop"],
  },
  {
    key: "sortBy",
    label: "Sort By Time",
    options: ["Newest", "Oldest"],
  },
]

const breadcrumbs = [
  { label: "Properties", href: "/dashboard/properties/overview" },
  { label: "Overview", href: "/dashboard/properties/overview" },
]

const tableHeaders = [
  "ID",
  "Road Location",
  "Development Name",
  "Sub Development Name",
  "Project Name",
  "Property Type",
  "Property Height",
  "Project Location",
  "Unit Number",
  "Bedrooms",
  "Unit Land Size",
  "Unit BUA",
  "Unit View",
  "Unit Location",
  "Purpose",
  "Vacancy Status",
  "Primary Price",
  "Resale Price",
  "Premium & Loss",
  "Rent",
  "No of Cheques",
  "Listed",
  "Created At",
]

export default function PropertiesPage() {
  const [selectionModalOpen, setSelectionModalOpen] = useState(false)
  const [addPropertyModalOpen, setAddPropertyModalOpen] = useState(false)
  const [fileUploadModalOpen, setFileUploadModalOpen] = useState(false)
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false)
  const [propertyToEdit, setPropertyToEdit] = useState(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [searchFilter, setSearchFilter] = useState({})
  const [Loading, setLoading] = useState<boolean>(false)
  const [sortOrder, setSortOrder] = useState("desc")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [totalCount, setCount] = useState<number>(0)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [propertyType, setPropertyType] = useState("")
  const [pendingSearchFilter, setPendingSearchFilter] = useState("")
  const [selectedRecordsCache, setSelectedRecordsCache] = useState<Record<string, any>>({})
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const dispatch = useDispatch()
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  // Add a new state for the share modal
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedRowsMap, setSelectedRowsMap] = useState<Record<string, boolean>>({})
  const allDataCache = useRef<Record<string, any>>({})

  const [shareData, setShareData] = useState(null)

  const sidebarFilters = useSelector((state: RootState) => state.filter)
  const rangeFilters = useSelector((state: any) => state.range)

  const { loading, error, data, refetch } = useQuery(GET_PROPERTIES, {
    variables: {
      filter: searchFilter,
      sortBy: "createdAt",
      sortOrder: sortOrder,
      limit: "10",
      page: String(currentPage),
    },
  })

  const transformedData =
    data?.getProperties?.data?.map((property: any) => ({
      _id: property._id || "N/A",
      roadLocation: property.roadLocation || "N/A",
      developmentName: property.developmentName || "N/A",
      subDevelopmentName: property.subDevelopmentName || "N/A",
      projectName: property.projectName || "N/A",
      propertyType: property.propertyType || "N/A",
      propertyHeight: property.propertyHeight || "N/A",
      projectLocation: property.projectLocation || "N/A",
      propertyImages: property.propertyImages || "N/A",
      unitNumber: property.unitNumber || "N/A",
      bedrooms: property.bedrooms || "N/A",
      unitLandSize: property.unitLandSize || "N/A",
      unitBua: property.unitBua || "N/A",
      unitView: Array.isArray(property.unitView) && property.unitView.length > 0 ? property.unitView : "N/A",
      unitLocation: property.unitLocation || "N/A",
      Purpose: property.Purpose || "N/A",
      vacancyStatus: property.vacancyStatus || "N/A",
      primaryPrice: property.primaryPrice || "N/A",
      resalePrice: property.resalePrice || "N/A",
      premiumAndLoss:
        property.resalePrice && property.primaryPrice ? property.resalePrice - property.primaryPrice : "N/A",
      Rent: property.rent || "N/A",
      noOfCheques: property.noOfCheques || "N/A",
      listed: property.listed ? "YES" : "NO",
      createdAt: property.createdAt ? new Date(property.createdAt).toLocaleString() : "N/A",
    })) || []

  // Update the toggleRow function to properly maintain the selection state
  const toggleRow = (id: string) => {
    setSelectedRowsMap((prev) => {
      const newMap = { ...prev }
      newMap[id] = !prev[id]

      // If we're selecting a row, add it to the cache
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

  // Update selectedRows whenever selectedRowsMap changes
  useEffect(() => {
    const selected = Object.entries(selectedRowsMap)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id)

    setSelectedRows(selected)
  }, [selectedRowsMap])

  // Cache the current page data
  useEffect(() => {
    if (transformedData && transformedData.length > 0) {
      const newCache = { ...allDataCache.current }

      transformedData.forEach((record) => {
        newCache[record._id] = record
      })

      allDataCache.current = newCache
    }
  }, [transformedData])

  useEffect(() => {
    if (!data) return

    const totalCount = data?.getProperties?.totalCount || 0

    setCount(totalCount)
    console.log("data", data)
  }, [data])

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date || null)
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date || null)
  }
  // Replace the handleShareButton function with this
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

    const isDefaultRange = (range: any, defaultMin: number, defaultMax: number) => {
      return range.min === defaultMin && range.max === defaultMax
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (isEmpty(value)) return

      if (typeof value === "object" && "min" in value && "max" in value) {
        switch (key) {
          case "bedrooms":
            if (!isDefaultRange(value, 0, 10)) cleaned[key] = value
            break
          case "primaryPriceRange":
          case "resalePriceRange":
            if (!isDefaultRange(value, 0, 1000000)) cleaned[key] = value
            break
          case "rentRange":
            if (!isDefaultRange(value, 0, 50000)) cleaned[key] = value
            break
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
    const newFilters = {
      ...cleanedSidebarFilters,
      ...searchFilterObj,
      ...dateFilters,
      ...propertyTypeFilter,
      ...(rangeFilters.minBed &&
        rangeFilters.maxBed && {
          bedrooms: {
            min: Number.parseInt(rangeFilters.minBed),
            max: Number.parseInt(rangeFilters.maxBed),
          },
        }),
      ...(rangeFilters.minPrimaryPrice &&
        rangeFilters.maxPrimaryPrice && {
          primaryPriceRange: {
            min: Number.parseInt(rangeFilters.minPrimaryPrice),
            max: Number.parseInt(rangeFilters.maxPrimaryPrice),
          },
        }),
      ...(rangeFilters.minRent &&
        rangeFilters.maxRent && {
          rentRange: {
            min: Number.parseInt(rangeFilters.minRent),
            max: Number.parseInt(rangeFilters.maxRent),
          },
        }),
      ...(rangeFilters.minResalePrice &&
        rangeFilters.maxResalePrice && {
          resalePriceRange: {
            min: Number.parseInt(rangeFilters.minResalePrice),
            max: Number.parseInt(rangeFilters.maxResalePrice),
          },
        }),
    }
    console.log("new", newFilters)
    if (Object.keys(newFilters).length > 0) {
      setSearchFilter(newFilters)
      refetch({
        filter: newFilters,
        sortBy: "createdAt",
        sortOrder: sortOrder,
        limit: "10",
        page: String(currentPage),
      })
    } else {
      setSearchFilter({})
      refetch({
        filter: {},
        sortBy: "createdAt",
        sortOrder: sortOrder,
        page: String(currentPage),
      })
    }
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value
    setPendingSearchFilter(searchValue)
  }

  const handleAdd = () => setSelectionModalOpen(true)

  const handleManualSelect = () => {
    // setSelectionModalOpen(false)
    setAddPropertyModalOpen(true)
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
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_CMS_SERVER}/property/deleteProperty`, {
        params: { _id: _id },
      })
      console.log("id", _id)
      console.log("Property deleted successfully:", response)
      if (response) {
        toast.success("Property Deleted successfully!")
      }
      refetch()
      return response.data
    } catch (error) {
      console.error("Error deleting property")
      throw error
    }
  }

  const handleUpdate = (property: any) => {
    console.log("property", property)
    setPropertyToEdit(property)
    setAddPropertyModalOpen(true)
  }

  const handleExport = () => {
    setExportModalOpen(true)
  }

  const handleCloseExportModal = () => {
    setExportModalOpen(false)
    setPropertyToEdit(null)
  }

  // Improved getSelectedData function to use both cache and current data
  const getSelectedData = () => {
    if (selectedRows.length === 0 || selectedColumns.length === 0) {
      return []
    }

    return selectedRows
      .map((id) => {
        // First check the selectedRecordsCache, then allDataCache, then current page data
        const record = selectedRecordsCache[id] || allDataCache.current[id] || transformedData.find((r) => r._id === id)

        if (!record) {
          console.warn(`Record with ID ${id} not found in any cache or current data`)
          return null
        }

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

  // Improved exportSelectedData function
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

  const handleSubmitExport = async (exportOption: any, count: any) => {
    setLoading(true)
    if (isSelectionMode && selectedRows.length > 0 && selectedColumns.length > 0) {
      exportSelectedData()
      setLoading(false)
      return
    }
    console.log(`Exporting with option: ${exportOption}`)

    let dataToExport = null

    if (exportOption === "false" || exportOption === false) {
      try {
        dataToExport = await refetch({
          filter: {},
          sortBy: "createdAt",
          sortOrder: "asc",
          limit: count.toString(),
        })

        if (dataToExport?.data?.getProperties?.data) {
          exportToExcel(dataToExport.data.getProperties.data)
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

        const newFilters = {
          ...cleanedSidebarFilters,
          ...searchFilterObj,
          ...dateFilters,
          ...propertyTypeFilter,
          ...(rangeFilters.minBed &&
            rangeFilters.maxBed && {
              bedrooms: {
                min: Number.parseInt(rangeFilters.minBed),
                max: Number.parseInt(rangeFilters.maxBed),
              },
            }),
          ...(rangeFilters.minPrimaryPrice &&
            rangeFilters.maxPrimaryPrice && {
              primaryPriceRange: {
                min: Number.parseInt(rangeFilters.minPrimaryPrice),
                max: Number.parseInt(rangeFilters.maxPrimaryPrice),
              },
            }),
          ...(rangeFilters.minRent &&
            rangeFilters.maxRent && {
              rentRange: {
                min: Number.parseInt(rangeFilters.minRent),
                max: Number.parseInt(rangeFilters.maxRent),
              },
            }),
          ...(rangeFilters.minResalePrice &&
            rangeFilters.maxResalePrice && {
              resalePriceRange: {
                min: Number.parseInt(rangeFilters.minResalePrice),
                max: Number.parseInt(rangeFilters.maxResalePrice),
              },
            }),
        }

        console.log("Applying filters:", newFilters)

        dataToExport = await refetch({
          filter: newFilters,
          sortBy: "createdAt",
          sortOrder: "asc",
          limit: count.toString(),
        })
        if (dataToExport?.data?.getProperties?.data) {
          exportToExcel(dataToExport.data.getProperties.data)
        } else {
          console.error("No data available for export")
        }
        console.log("Mapped export data:", dataToExport)
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
    refetch({
      filter: {},
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
  if (Loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  // if (error) {
  //   return <div className="min-h-screen bg-background flex items-center justify-center">Error loading properties</div>
  // }

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
        fetchRecords={refetch}
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
          <DataTable
            headers={tableHeaders}
            page={currentPage}
            setPage={setCurrentPage}
            toggleRow={toggleRow}
            toggleColumns={toggleColumns}
            Count={totalCount}
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
            onAddButton={handleAdd}
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
        onClose={() => setAddPropertyModalOpen(false)}
        propertyToEdit={propertyToEdit}
      />

      <FileUploadModal isOpen={fileUploadModalOpen} onClose={() => setFileUploadModalOpen(false)} />

      <PropertyFilterSidebar open={filterSidebarOpen} onOpenChange={setFilterSidebarOpen} />
      <ExportModal isOpen={exportModalOpen} onClose={handleCloseExportModal} onSubmitExport={handleSubmitExport} />
      {/* Add the ShareModal component at the end of the return statement, just before the closing </div> */}
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
