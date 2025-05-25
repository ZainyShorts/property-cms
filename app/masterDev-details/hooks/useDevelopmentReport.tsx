"use client"

import { useState, useEffect } from "react"

export interface DevelopmentReport {
  roadLocation?: string
  developmentName?: string
  developmentRanking?: string
  noOfFacilities?: number
  noOfAmenities?: number
  noOfPlots?: number
  noOfDevelopedPlots?: number
  noOfUnderConstructionPlots?: number
  noOfVacantPlots?: number
  projectHeight?: {
    projectMinHeight?: number
    projectMaxHeight?: number
  }
  projectBUA?: {
    projectMinBUA?: number
    projectMaxBUA?: number
  }
  PropertyTypes?: {
    Apartments?: number
    Hoetls?: number
    Towhouse?: number
    Villas?: number
    total?: number
  }
  InventoryType?: {
    apartmentCountType?: number
    villasCountType?: number
    hotelCountType?: number
    townhouseCountType?: number
    labourCampCountType?: number
  }
  result?: {
    Apartment?: {
      Sell?: number
      Rent?: number
    }
    Villas?: {
      Sell?: number
      Rent?: number
    }
    Townhouses?: {
      Sell?: number
      Rent?: number
    }
  }
}

export interface UseDevelopmentReportResult {
  data: DevelopmentReport | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useDevelopmentReport(id: string | null): UseDevelopmentReportResult {
  const [data, setData] = useState<DevelopmentReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    if (!id) return
    console.log("call")
    setIsLoading(true)
    setError(null)

    try {
      // Use the actual API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_SERVER}/masterDevelopment/report/${id}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json() 
      console.log('data',data);
      setData(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"))
    } finally {
      setIsLoading(false)
    }
  }

  return { data, isLoading, error, refetch: fetchData }
}
