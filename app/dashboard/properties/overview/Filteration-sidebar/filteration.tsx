"use client"

import type React from "react"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { updateFilter, updateUnitView } from "@/lib/store/slices/filterSlice"
import type { RootState } from "@/lib/store/store"
import {
  setMinBed,
  setMaxBed,
  setMinPrimaryPrice,
  setMaxPrimaryPrice,
  setMinResalePrice,
  setMaxResalePrice,
  setMinRent,
  setMaxRent,
} from "@/lib/store/slices/rangeSlice"

interface PropertyFilterSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PropertyFilterSidebar({ open, onOpenChange }: PropertyFilterSidebarProps) {
  const dispatch = useDispatch()
  const filter = useSelector((state: RootState) => state.filter)
  const range = useSelector((state: any) => state.range)
  const [unitViewInput, setUnitViewInput] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    dispatch(updateFilter({ [id]: value }))
  }

  const handleAddUnitViewTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && unitViewInput.trim() !== "") {
      const newTags = [...filter.unitView, unitViewInput.trim()]
      dispatch(updateUnitView(newTags))
      setUnitViewInput("")
    }
  }

  const handleRemoveUnitViewTag = (tag: string) => {
    const newTags = filter.unitView.filter((t) => t !== tag)
    dispatch(updateUnitView(newTags))
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M+`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k+`
    }
    return `${value}`
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`
    }
    return num.toString()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[70vw] lg:w-[50vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Property Filter</SheetTitle>
          <SheetDescription>Adjust the filters to find your perfect property.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="roadLocation">Road Location</Label>
            <Input
              id="roadLocation"
              placeholder="Enter road location"
              value={filter.roadLocation}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="developmentName">Development Name</Label>
            <Input
              id="developmentName"
              placeholder="Enter development name"
              value={filter.developmentName}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subDevelopmentName">Sub Development</Label>
            <Input
              id="subDevelopmentName"
              placeholder="Enter sub development name"
              value={filter.subDevelopmentName}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              placeholder="Enter project name"
              value={filter.projectName}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectLocation">Project Location</Label>
            <Input
              id="projectLocation"
              placeholder="Enter project location"
              value={filter.projectLocation}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitNumber">Unit Number</Label>
            <Input
              id="unitNumber"
              type="number"
              placeholder="Enter unit number"
              value={filter.unitNumber}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitLocation">Unit Location</Label>
            <Input
              id="unitLocation"
              placeholder="Enter unit location"
              value={filter.unitLocation}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vacancyStatus">Vacancy Status</Label>
            <Input
              id="vacancyStatus"
              placeholder="Enter vacancy status"
              value={filter.vacancyStatus}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <div className="flex items-center gap-2">
              <Input
                id="bedroomsMin"
                type="number"
                value={range.minBed}
                placeholder="Min"
                onChange={(e) => {
                  const value = e.target.value
                  dispatch(setMinBed(value))
                }}
                className="w-full"
              />
              <span>to</span>
              <Input
                id="bedroomsMax"
                type="number"
                placeholder="Max"
                value={range.maxBed}
                onChange={(e) => {
                  const value = e.target.value
                  dispatch(setMaxBed(value))
                }}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-5">
              <div>
                <Label className="text-sm font-normal">Primary Price Range</Label>
                <div className="flex items-center gap-2 mt-3">
                  <Input
                    id="primaryPriceMin"
                    type="number"
                    placeholder="Min"
                    value={range.minPrimaryPrice}
                    onChange={(e) => {
                      const value = e.target.value
                      dispatch(setMinPrimaryPrice(value))
                    }}
                    className="w-full"
                  />
                  <span>to</span>
                  <Input
                    id="primaryPriceMax"
                    type="number"
                    placeholder="Max"
                    value={range.maxPrimaryPrice}
                    onChange={(e) => {
                      const value = e.target.value
                      dispatch(setMaxPrimaryPrice(value))
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-normal">Resale Price Range</Label>
                <div className="flex items-center gap-2 mt-3">
                  <Input
                    id="resalePriceMin"
                    type="number"
                    placeholder="Min"
                    value={range.minResalePrice}
                    onChange={(e) => {
                      const value = e.target.value
                      dispatch(setMinResalePrice(value))
                    }}
                    className="w-full"
                  />
                  <span>to</span>
                  <Input
                    id="resalePriceMax"
                    type="number"
                    placeholder="Max"
                    value={range.maxResalePrice}
                    onChange={(e) => {
                      const value = e.target.value
                      dispatch(setMaxResalePrice(value))
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-normal">Rent Range</Label>
                <div className="flex items-center gap-2 mt-3">
                  <Input
                    id="rentMin"
                    type="number"
                    placeholder="Min"
                    value={range.minRent}
                    onChange={(e) => {
                      const value = e.target.value
                      dispatch(setMinRent(value))
                    }}
                    className="w-full"
                  />
                  <span>to</span>
                  <Input
                    id="rentMax"
                    type="number"
                    placeholder="Max"
                    value={range.maxRent}
                    onChange={(e) => {
                      const value = e.target.value
                      dispatch(setMaxRent(value))
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitView">Unit View</Label>
            <Input
              id="unitView"
              value={unitViewInput}
              onChange={(e) => setUnitViewInput(e.target.value)}
              onKeyDown={handleAddUnitViewTag}
              placeholder="Type and press Enter to add tags"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {filter.unitView.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-auto p-0"
                    onClick={() => handleRemoveUnitViewTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
