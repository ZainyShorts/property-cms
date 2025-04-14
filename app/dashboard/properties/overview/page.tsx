"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
  const [Loading , setLoading] = useState<Boolean>(false);
  const [sortOrder, setSortOrder] = useState("desc")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [totalCount, setCount] = useState<number>(0)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [propertyType, setPropertyType] = useState("")
  const [pendingSearchFilter, setPendingSearchFilter] = useState("")
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const dispatch = useDispatch()
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const sidebarFilters = useSelector((state: RootState) => state.filter)

  const { loading, error, data, refetch } = useQuery(GET_PROPERTIES, {
    variables: {
      filter: searchFilter,
      sortBy: "createdAt",
      sortOrder: sortOrder,
      limit: "10",
      page: String(currentPage),
    },
  })

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
    }
    console.log(newFilters)
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
    setSelectionModalOpen(false)
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
      console.log('id',_id)
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
   
  const handleSubmitExport = async (exportOption: string, count: number) => { 
    setLoading(true);
    console.log(`Exporting with option: ${exportOption}`);
  
    let dataToExport = null;
  
    if (exportOption === "false" || exportOption === false) {
      try {
        dataToExport = await refetch({
          filter: {},
          sortBy: "createdAt",
          sortOrder: "asc",
          limit: count.toString(), 
        });
  
        if (dataToExport?.data?.getProperties?.data) {
          exportToExcel(dataToExport.data.getProperties.data);
        } else {
          console.error("No data available for export");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      try {
        const searchFilterObj = pendingSearchFilter ? { _id: pendingSearchFilter } : {};
  
        const dateFilters = {
          ...(startDate && { startDate: startDate.toISOString() }),
          ...(endDate && { endDate: endDate.toISOString() }),
        };
  
        const propertyTypeFilter = propertyType ? { propertyType } : {};
        const cleanedSidebarFilters = cleanFilters(sidebarFilters);
  
        const newFilters = {
          ...cleanedSidebarFilters,
          ...searchFilterObj,
          ...dateFilters,
          ...propertyTypeFilter,
        };
  
        console.log("Applying filters:", newFilters);
  
        dataToExport = await refetch({
          filter: newFilters,
          sortBy: "createdAt",
          sortOrder: "asc",
          limit: count.toString(), 
        });
        if (dataToExport?.data?.getProperties?.data) {
          exportToExcel(dataToExport.data.getProperties.data);
        } else {
          console.error("No data available for export");
        }
        console.log("Mapped export data:", dataToExport);
        handleCloseExportModal();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  
    setLoading(false);
  };
  
  

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


  if (error) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Error loading properties</div>
  }

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
      propertyImages : property.propertyImages || "N/A",
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

  const handleClearFilters = () => {
    dispatch(clearAllFilters())
    setSearchFilter({})
    setSortOrder("asc")
    setStartDate(null)
    setEndDate(null)
    setPropertyType("")
    setPendingSearchFilter("")
    setSelectedOptions({})
    refetch({
      filter: {},
      sortBy: "createdAt",
      sortOrder: "asc",
    })
    setCurrentPage(1)
  }
  return (
    <div className="min-h-screen bg-background ">
     
      <FilterBar
        filters={filter}
        breadcrumbs={breadcrumbs}
        onAddButton={handleAdd}
        onFilter={handleFilter}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        showDatePickers={true}
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
            Count={totalCount}
            data={transformedData}
            onAddButton={handleAdd}
            onDelete={handleDelete}
            onEdit={handleUpdate}
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
    </div>
  )
}

