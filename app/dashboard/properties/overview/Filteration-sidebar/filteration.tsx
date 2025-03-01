"use client"

import React from "react"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { X } from "lucide-react"
import { updateFilter, updateUnitView, updateRangeFilter } from "@/lib/store/slices/filterSlice"
import type { RootState } from "@/lib/store/store"

interface PropertyFilterSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PropertyFilterSidebar({ open, onOpenChange }: PropertyFilterSidebarProps) {
  const dispatch = useDispatch()
  const filter = useSelector((state: RootState) => state.filter)
  const [unitViewInput, setUnitViewInput] = useState("")

  // Initialize ranges at min and max values
  React.useEffect(() => {
    if (filter.primaryPriceRange.min === 0 && filter.primaryPriceRange.max === 0) {
      dispatch(
        updateRangeFilter({
          field: "primaryPriceRange",
          value: { min: 0, max: 2000000 },
        }),
      )
    }
    if (filter.resalePriceRange.min === 0 && filter.resalePriceRange.max === 0) {
      dispatch(
        updateRangeFilter({
          field: "resalePriceRange",
          value: { min: 0, max: 2000000 },
        }),
      )
    }
    if (filter.rentRange.min === 0 && filter.rentRange.max === 0) {
      dispatch(
        updateRangeFilter({
          field: "rentRange",
          value: { min: 0, max: 10000 },
        }),
      )
    }
  }, [dispatch, filter.primaryPriceRange, filter.resalePriceRange, filter.rentRange])

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

  const handleRangeChange = (
    field: "bedrooms" | "primaryPriceRange" | "resalePriceRange" | "rentRange",
    value: number[],
  ) => {
    const [min, max] = value
    dispatch(
      updateRangeFilter({
        field,
        value: { min, max },
      }),
    )
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M+`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k+`
    }
    return `$${value}`
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
            <Label htmlFor="bedrooms">
              Bedrooms: {filter.bedrooms.min} - {filter.bedrooms.max}
            </Label>
            <Slider
              id="bedrooms"
              value={[filter.bedrooms.min, filter.bedrooms.max]}
              onValueChange={(value) => handleRangeChange("bedrooms", value)}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>10+</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-5">
              <div>
                <Label className="text-sm font-normal">Primary Price Range</Label>
                <div className="mt-3">
                  <Slider
                    id="primaryPrice"
                    value={[filter.primaryPriceRange.min, filter.primaryPriceRange.max]}
                    onValueChange={(value) => handleRangeChange("primaryPriceRange", value)}
                    min={0}
                    max={2000000}
                    step={10000}
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:bg-white [&_[role=slider]]:shadow-none [&_[role=slider]]:ring-2 [&_[role=slider]]:ring-white"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">$0</span>
                    <span className="text-xs text-muted-foreground">
                      ${formatLargeNumber(filter.primaryPriceRange.min)} - $
                      {formatLargeNumber(filter.primaryPriceRange.max)}
                    </span>
                    <span className="text-xs text-muted-foreground">$2M+</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-normal">Resale Price Range</Label>
                <div className="mt-3">
                  <Slider
                    id="resalePrice"
                    value={[filter.resalePriceRange.min, filter.resalePriceRange.max]}
                    onValueChange={(value) => handleRangeChange("resalePriceRange", value)}
                    min={0}
                    max={2000000}
                    step={10000}
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:bg-white [&_[role=slider]]:shadow-none [&_[role=slider]]:ring-2 [&_[role=slider]]:ring-white"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">$0</span>
                    <span className="text-xs text-muted-foreground">
                      ${formatLargeNumber(filter.resalePriceRange.min)} - $
                      {formatLargeNumber(filter.resalePriceRange.max)}
                    </span>
                    <span className="text-xs text-muted-foreground">$2M+</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-normal">Rent Range</Label>
                <div className="mt-3">
                  <Slider
                    id="rent"
                    value={[filter.rentRange.min, filter.rentRange.max]}
                    onValueChange={(value) => handleRangeChange("rentRange", value)}
                    min={0}
                    max={10000}
                    step={100}
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:bg-white [&_[role=slider]]:shadow-none [&_[role=slider]]:ring-2 [&_[role=slider]]:ring-white"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">$0</span>
                    <span className="text-xs text-muted-foreground">
                      ${formatLargeNumber(filter.rentRange.min)} - ${formatLargeNumber(filter.rentRange.max)}
                    </span>
                    <span className="text-xs text-muted-foreground">$10k+</span>
                  </div>
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

