"use client"

import { useQuery } from "@apollo/client"
import { useState, useEffect } from "react"
import { PropertyCard } from "@/components/gallery/Poperty-card/Card"
import { GET_PROPERTIES } from "@/lib/query"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" 
import { useRouter } from "next/navigation"


export default function Page() { 
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState("asc")
  const [searchFilter, setSearchFilter] = useState({})
  const [count, setCount] = useState(0); 


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
   
  const handleDetails = (id : any) => { 
     router.push(`/dashboard/properties/${id}`) 
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
        "PropertyID": transformedData._id,
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
      <div className="container py-10">
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Featured Properties</h1>
          <p className="text-muted-foreground">Discover our exclusive collection of premium properties</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {/* <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort by:</span>
            <Select value={sortOrder} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DESC">Newest first</SelectItem>
                <SelectItem value="ASC">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
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
            {properties.map((property : any, index : any) => (
              <div key={index} className="flex flex-col h-full">
                <PropertyCard data={property} onDetails={handleDetails} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

