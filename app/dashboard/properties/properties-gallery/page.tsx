"use client"

import type React from "react"

import { useQuery } from "@apollo/client"
import { useState, useEffect } from "react"
import { PropertyCard } from "@/components/gallery/Poperty-card/Card"
import { GET_PROPERTIES } from "@/lib/query"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { FilterBar } from "@/components/overview/Filter-Bar/FilterBar"
import { PropertyFilterSidebar } from "../overview/Filteration-sidebar/filteration"
import { clearAllFilters } from "@/lib/store/slices/filterSlice"
import type { RootState } from "@/lib/store/store"

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
  { label: "Gallery", href: "/dashboard/properties/properties-gallery" },
]

export default function Page() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState("asc")
  const [searchFilter, setSearchFilter] = useState({})
  const [count, setCount] = useState(0)

  const dispatch = useDispatch()
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [propertyType, setPropertyType] = useState("")
  const [pendingSearchFilter, setPendingSearchFilter] = useState("")
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const sidebarFilters = useSelector((state: RootState) => state.filter)

  const { loading, error, data, refetch } = useQuery(GET_PROPERTIES, {
    variables: {
      filter: searchFilter,
      sortBy: "createdAt",
      sortOrder: sortOrder,
      limit: "9",
      page: String(currentPage),
    },
  })

  useEffect(() => {
    if (!data) return
    const totalCount = data?.getProperties?.totalCount || 0
    setCount(totalCount)
  }, [data])

  const handleDetails = (id: any) => {
    router.push(`/dashboard/properties/${id}`)
  }

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date || null)
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date || null)
  }

  const handleFilterChange = (key: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [key]: value }))
    if (key === "sortBy") {
      setSortOrder(value === "Newest" ? "DESC" : "ASC")
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

    if (Object.keys(newFilters).length > 0) {
      setSearchFilter(newFilters)
      refetch({
        filter: newFilters,
        sortBy: "createdAt",
        sortOrder: sortOrder,
        limit: "9",
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

  const handleFilter = () => {
    setFilterSidebarOpen(true)
  }

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
      limit: "9",
      page: String(currentPage),
    })
    setCurrentPage(1)
  }

  const properties =
    data?.getProperties?.data?.map((property: any) => {
      // First create the exact transformed data structure
      const transformedData = {
        _id: property._id || "N/A",
        roadLocation: property.roadLocation || "N/A",
        developmentName: property.developmentName || "N/A",
        subDevelopmentName: property.subDevelopmentName || "N/A",
        projectName: property.projectName || "N/A",
        propertyType: property.propertyType || "N/A",
        propertyHeight: property.propertyHeight || "N/A",
        projectLocation: property.projectLocation || "N/A",
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
      }

      return {
        image: property.images?.[0] || "https://cdn.businessday.ng/2021/07/luxury-residential-real-estate.png",
        PropertyID: transformedData._id,
        "Property Details": {
          Location:
            transformedData.roadLocation === "N/A" || transformedData.projectLocation === "N/A"
              ? "N/A"
              : `${transformedData.roadLocation}, ${transformedData.projectLocation}`,
          Price:
            transformedData.Purpose === "Sale"
              ? transformedData.resalePrice !== "N/A"
                ? `AED ${transformedData.resalePrice}`
                : transformedData.primaryPrice !== "N/A"
                  ? `AED ${transformedData.primaryPrice}`
                  : "N/A"
              : transformedData.Rent !== "N/A"
                ? `AED ${transformedData.Rent}`
                : "N/A",
          Size: transformedData.unitBua !== "N/A" ? `${transformedData.unitBua} sq.ft` : "N/A",
          Bedrooms: transformedData.bedrooms,
          "Property Type": transformedData.propertyType,
          "Development Name": transformedData.developmentName,
          "Project Name": transformedData.projectName,
          "Unit Number": transformedData.unitNumber,
        },
        PropertyType: [transformedData.propertyType].filter(Boolean),
        "Agent Info": {
          Name: "Property Agent",
          ID: "AG001",
        },
        "Additional Info": {
          Listed: transformedData.listed,
          Purpose: transformedData.Purpose,
          "Vacancy Status": transformedData.vacancyStatus,
          "Primary Price": transformedData.primaryPrice !== "N/A" ? `AED ${transformedData.primaryPrice}` : "N/A",
          "Resale Price": transformedData.resalePrice !== "N/A" ? `AED ${transformedData.resalePrice}` : "N/A",
          "Premium/Loss": transformedData.premiumAndLoss !== "N/A" ? `AED ${transformedData.premiumAndLoss}` : "N/A",
          Rent: transformedData.Rent !== "N/A" ? `AED ${transformedData.Rent}` : "N/A",
          "No. of Cheques": transformedData.noOfCheques,
          "Unit Land Size": transformedData.unitLandSize !== "N/A" ? `${transformedData.unitLandSize} sq.ft` : "N/A",
          "Unit BUA": transformedData.unitBua !== "N/A" ? `${transformedData.unitBua} sq.ft` : "N/A",
          "Property Height": transformedData.propertyHeight,
          "Created At": transformedData.createdAt,
        },
      }
    }) || []

  const totalPages = Math.ceil(count / 9)

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => {
        const newPage = prev + 1
        refetch({
          filter: searchFilter,
          sortBy: "createdAt",
          sortOrder: sortOrder,
          limit: "9",
          page: String(newPage),
        })
        return newPage
      })
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => {
        const newPage = prev - 1
        refetch({
          filter: searchFilter,
          sortBy: "createdAt",
          sortOrder: sortOrder,
          limit: "9",
          page: String(newPage),
        })
        return newPage
      })
    }
  }

  const handleSortChange = (value: string) => {
    setSortOrder(value)
  }

  return (
    <div className="min-h-screen dark:bg-background">
      <FilterBar
        filters={filter}
        breadcrumbs={breadcrumbs}
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
      />
      <div className="container py-10">
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Featured Properties</h1>
          <p className="text-muted-foreground">Discover our exclusive collection of premium properties</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrevPage} disabled={currentPage === 1 || loading}>
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button variant="outline" onClick={handleNextPage} disabled={currentPage >= totalPages || loading}>
              Next
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading properties...</span>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center min-h-[400px] text-red-500">
            <p>Error loading properties: {error.message}</p>
          </div>
        )}

        {!loading && !error && properties.length === 0 && (
          <div className="flex justify-center items-center min-h-[400px] text-muted-foreground">
            <p>No properties found. Try adjusting your search criteria.</p>
          </div>
        )}

        {!loading && !error && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: any, index: any) => (
              <div key={index} className="flex flex-col h-full">
                <PropertyCard data={property} onDetails={handleDetails} />
              </div>
            ))}
          </div>
        )}
      </div>

      <PropertyFilterSidebar open={filterSidebarOpen} onOpenChange={setFilterSidebarOpen} />
    </div>
  )
}
