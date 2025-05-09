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
import { updateFilter, updateUnitView, resetFilters } from "@/lib/store/slices/filterSlice"
import type { RootState } from "@/lib/store/store"

interface PropertyFilterSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PropertyFilterSidebar({ open, onOpenChange }: PropertyFilterSidebarProps) {
  const dispatch = useDispatch()
  const filter = useSelector((state: RootState) => state.filter)
  const [unitViewInput, setUnitViewInput] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    dispatch(updateFilter({ [id]: value }))
  }

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    dispatch(updateFilter({ [id]: value ? Number(value) : undefined }))
  }

type RangeField = 'rentalPriceRange' | 'salePriceRange' | 'originalPriceRange' | 'premiumAndLossRange';

const handleRangeInputChange = (
  field: RangeField,
  minOrMax: 'min' | 'max',
  value: string
) => {
  const numValue = value ? Number(value) : undefined;

  const currentRange = filter[field] || { min: undefined, max: undefined };
  dispatch(
    updateFilter({
      [field]: {
        ...currentRange,
        [minOrMax]: numValue,
      },
    })
  );
};



  const handleAddUnitViewTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && unitViewInput.trim() !== "") {
      const newTags = [...(filter.unitView || []), unitViewInput.trim()]
      dispatch(updateUnitView(newTags))
      setUnitViewInput("")
    }
  }

  const handleRemoveUnitViewTag = (tag: string) => {
    const newTags = (filter.unitView || []).filter((t) => t !== tag)
    dispatch(updateUnitView(newTags))
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
            <Label htmlFor="masterDevelopment">Master Development</Label>
            <Input
              id="masterDevelopment"
              placeholder="Enter master development"
              value={filter.masterDevelopment || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subDevelopment">Sub Development</Label>
            <Input
              id="subDevelopment"
              placeholder="Enter sub development"
              value={filter.subDevelopment || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Input id="project" placeholder="Enter project" value={filter.project || ""} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitNumber">Unit Number</Label>
            <Input
              id="unitNumber"
              placeholder="Enter unit number"
              value={filter.unitNumber || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitHeight">Unit Height</Label>
            <Input
              id="unitHeight"
              type="number"
              placeholder="Enter unit height"
              value={filter.unitHeight || ""}
              onChange={handleNumberInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitInternalDesign">Unit Internal Design</Label>
            <Input
              id="unitInternalDesign"
              placeholder="Enter internal design"
              value={filter.unitInternalDesign || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitExternalDesign">Unit External Design</Label>
            <Input
              id="unitExternalDesign"
              placeholder="Enter external design"
              value={filter.unitExternalDesign || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plotSizeSqFt">Plot Size (sq ft)</Label>
            <Input
              id="plotSizeSqFt"
              type="number"
              placeholder="Enter plot size"
              value={filter.plotSizeSqFt || ""}
              onChange={handleNumberInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buaSqFt">BUA (sq ft)</Label>
            <Input
              id="buaSqFt"
              type="number"
              placeholder="Enter BUA"
              value={filter.buaSqFt || ""}
              onChange={handleNumberInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitType">Unit Type</Label>
            <Input
              id="unitType"
              placeholder="Enter unit type"
              value={filter.unitType || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitPurpose">Unit Purpose</Label>
            <Input
              id="unitPurpose"
              placeholder="Enter unit purpose"
              value={filter.unitPurpose || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chequeFrequency">Cheque Frequency</Label>
            <Input
              id="chequeFrequency"
              placeholder="Enter cheque frequency"
              value={filter.chequeFrequency || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-5">
              <div>
                <Label className="text-sm font-normal">Rental Price Range</Label>
                <div className="flex items-center gap-2 mt-3">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filter.rentalPriceRange?.min || ""}
                    onChange={(e) => handleRangeInputChange("rentalPriceRange", "min", e.target.value)}
                    className="w-full"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filter.rentalPriceRange?.max || ""}
                    onChange={(e) => handleRangeInputChange("rentalPriceRange", "max", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-normal">Sale Price Range</Label>
                <div className="flex items-center gap-2 mt-3">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filter.salePriceRange?.min || ""}
                    onChange={(e) => handleRangeInputChange("salePriceRange", "min", e.target.value)}
                    className="w-full"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filter.salePriceRange?.max || ""}
                    onChange={(e) => handleRangeInputChange("salePriceRange", "max", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-normal">Original Price Range</Label>
                <div className="flex items-center gap-2 mt-3">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filter.originalPriceRange?.min || ""}
                    onChange={(e) => handleRangeInputChange("originalPriceRange", "min", e.target.value)}
                    className="w-full"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filter.originalPriceRange?.max || ""}
                    onChange={(e) => handleRangeInputChange("originalPriceRange", "max", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-normal">Premium And Loss Range</Label>
                <div className="flex items-center gap-2 mt-3">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filter.premiumAndLossRange?.min || ""}
                    onChange={(e) => handleRangeInputChange("premiumAndLossRange", "min", e.target.value)}
                    className="w-full"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filter.premiumAndLossRange?.max || ""}
                    onChange={(e) => handleRangeInputChange("premiumAndLossRange", "max", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="listingDate">Listing Date</Label>
            <Input id="listingDate" type="date" value={filter.listingDate || ""} onChange={handleInputChange} />
          </div>

        
          <div className="space-y-2">
            <Label htmlFor="rentedAt">Rented At</Label>
            <Input id="rentedAt" type="date" value={filter.rentedAt || ""} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rentedTill">Rented Till</Label>
            <Input id="rentedTill" type="date" value={filter.rentedTill || ""} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vacantOn">Vacant On</Label>
            <Input id="vacantOn" type="date" value={filter.vacantOn || ""} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidTODevelopers">Paid To Developers</Label>
            <Input
              id="paidTODevelopers"
              placeholder="Enter paid to developers"
              value={filter.paidTODevelopers || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payableTODevelopers">Payable To Developers</Label>
            <Input
              id="payableTODevelopers"
              placeholder="Enter payable to developers"
              value={filter.payableTODevelopers || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitView">Unit View</Label>
            <Input
              id="unitViewInput"
              value={unitViewInput}
              onChange={(e) => setUnitViewInput(e.target.value)}
              onKeyDown={handleAddUnitViewTag}
              placeholder="Type and press Enter to add tags"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {(filter.unitView || []).map((tag) => (
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

          <Button variant="outline" className="mt-4" onClick={() => dispatch(resetFilters())}>
            Reset All Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
