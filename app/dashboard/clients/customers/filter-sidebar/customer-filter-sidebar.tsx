"use client"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export enum CustomerSegment {
  Customer = "Customer",
  Supplier = "Supplier",
}

export enum CustomerCategory {
  Organisation = "Organisation",
  Individual = "Individual",
}

export enum CustomerSubCategory {
  EndUser = "End User",
  Investor = "Investor",
}

enum CustomerType {
  Seller = "Seller",
  TenantLongTerm = "Tenant-Long Term",
  TenantShortTerm = "Tenant-Short Term",
  Buyer = "Buyer",
  ProspectBuyer = "Prospect Buyer",
  PropertyOwner = "Property Owner",
  SubLease = "Sub-Lease",
  Landlord = "Landlord",
  Underwriter = "Underwriter",
  ShortTermTrader = "Short Term Trader",
}

enum CustomerSubType {
  MasterDeveloper = "Master Developer",
  SubDeveloper = "Sub-Developer",
  RealEstateInvestor = "Real Estate Investor",
  RealEstateBroker = "Real Estate Broker",
  PropertyManagement = "Property Management",
  Banks = "Banks",
  Auction = "Auction",
  Contractor = "Contractor",
  ArchitectConsultant = "Architect-Consultant",
  REIT = "REIT",
  PrivateInvestor = "Private Investor",
}

// Remove these arrays:
// const customerSegmentOptions = ["Premium", "Standard", "Basic", "VIP", "Corporate"]
// const customerCategoryOptions = ["Individual", "Corporate", "Government", "Non-Profit", "Partnership"]
// const customerSubCategoryOptions = ["Residential", "Commercial", "Industrial", "Mixed-Use", "Retail"]
// const customerBusinessSectorOptions = [...]
// const customerNationalityOptions = [...]

export interface CustomerFilters {
  customerSegment: string
  customerCategory: string
  customerSubCategory: string
  customerType: string[]
  customerSubType: string[]
  customerBusinessSector: string
  customerNationality: string
  customerName: string
  contactPerson: string
  emailAddress: string
  mobile1: string
  startDate: Date | undefined
  endDate: Date | undefined
}

interface CustomerFilterSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: CustomerFilters
  onFiltersChange: (filters: CustomerFilters) => void
}

export function CustomerFilterSidebar({ open, onOpenChange, filters, onFiltersChange }: CustomerFilterSidebarProps) {
  const handleInputChange = (field: keyof CustomerFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    })
  }

  const handleCustomerTypeChange = (value: string, checked: boolean) => {
    const currentValues = filters.customerType || []
    const updated = checked ? [...currentValues, value] : currentValues.filter((item) => item !== value)
    handleInputChange("customerType", updated)
  }

  const handleCustomerSubTypeChange = (value: string, checked: boolean) => {
    const currentValues = filters.customerSubType || []
    const updated = checked ? [...currentValues, value] : currentValues.filter((item) => item !== value)
    handleInputChange("customerSubType", updated)
  }

  const handleDateChange = (field: "startDate" | "endDate", date: Date | undefined) => {
    handleInputChange(field, date)
  }

  const clearFilters = () => {
    onFiltersChange({
      customerSegment: "",
      customerCategory: "",
      customerSubCategory: "",
      customerType: [],
      customerSubType: [],
      customerBusinessSector: "",
      customerNationality: "",
      customerName: "",
      contactPerson: "",
      emailAddress: "",
      mobile1: "",
      startDate: undefined,
      endDate: undefined,
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-xl">Customer Filter</SheetTitle>
          <SheetDescription>Adjust the filters to find your customers.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              placeholder="Search customer name..."
              value={filters.customerName}
              onChange={(e) => handleInputChange("customerName", e.target.value)}
            />
          </div>

          {/* Contact Person */}
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              placeholder="Search contact person..."
              value={filters.contactPerson}
              onChange={(e) => handleInputChange("contactPerson", e.target.value)}
            />
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="emailAddress">Email Address</Label>
            <Input
              id="emailAddress"
              placeholder="Search email address..."
              value={filters.emailAddress}
              onChange={(e) => handleInputChange("emailAddress", e.target.value)}
            />
          </div>

          {/* Mobile */}
          {/* <div className="space-y-2">
            <Label htmlFor="mobile1">Mobile Number</Label>
            <Input
              id="mobile1"
              placeholder="Search mobile number..."
              value={filters.mobile1}
              onChange={(e) => handleInputChange("mobile1", e.target.value)}
            />
          </div> */}

          {/* Customer Segment */}
          <div className="space-y-2">
            <Label>Customer Segment</Label>
            <Select
              value={filters.customerSegment}
              onValueChange={(value) => handleInputChange("customerSegment", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer segment" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CustomerSegment).map((segment) => (
                  <SelectItem key={segment} value={segment}>
                    {segment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Category */}
          <div className="space-y-2">
            <Label>Customer Category</Label>
            <Select
              value={filters.customerCategory}
              onValueChange={(value) => handleInputChange("customerCategory", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer category" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CustomerCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Sub Category */}
          <div className="space-y-2">
            <Label>Customer Sub Category</Label>
            <Select
              value={filters.customerSubCategory}
              onValueChange={(value) => handleInputChange("customerSubCategory", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer sub category" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CustomerSubCategory).map((subCategory) => (
                  <SelectItem key={subCategory} value={subCategory}>
                    {subCategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Type - Checkboxes */}
          <div className="space-y-3">
            <Label className="text-base">Customer Type</Label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {Object.values(CustomerType).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.customerType?.includes(type) || false}
                    onCheckedChange={(checked) => handleCustomerTypeChange(type, checked as boolean)}
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm font-normal">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Sub Type - Checkboxes */}
          <div className="space-y-3">
            <Label className="text-base">Customer Sub Type</Label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {Object.values(CustomerSubType).map((subType) => (
                <div key={subType} className="flex items-center space-x-2">
                  <Checkbox
                    id={`subtype-${subType}`}
                    checked={filters.customerSubType?.includes(subType) || false}
                    onCheckedChange={(checked) => handleCustomerSubTypeChange(subType, checked as boolean)}
                  />
                  <Label htmlFor={`subtype-${subType}`} className="text-sm font-normal">
                    {subType}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Business Sector */}
          <div className="space-y-2">
            <Label htmlFor="customerBusinessSector">Business Sector</Label>
            <Input
              id="customerBusinessSector"
              placeholder="Enter business sector..."
              value={filters.customerBusinessSector}
              onChange={(e) => handleInputChange("customerBusinessSector", e.target.value)}
            />
          </div>

          {/* Customer Nationality */}
          <div className="space-y-2">
            <Label htmlFor="customerNationality">Nationality</Label>
            <Input
              id="customerNationality"
              placeholder="Enter nationality..."
              value={filters.customerNationality}
              onChange={(e) => handleInputChange("customerNationality", e.target.value)}
            />
          </div>

          <Separator />

          {/* Date Filters */}
         

          <Separator />

          {/* Clear Filters Button */}
          <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
            Clear All Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
