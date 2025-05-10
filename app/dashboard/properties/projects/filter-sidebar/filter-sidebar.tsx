"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Search, Loader2, X } from "lucide-react"
import { format } from "date-fns"
import {
  setmasterDevelopment,
  setsubDevelopment,
  setPropertyType,
  setProjectName,
  setProjectQuality,
  setConstructionStatus,
  setFacilitiesCategories,
  setAmentiesCategories,
  setLaunchDate,
  setCompletionDate,
  setSaleStatus,
  setpercentOfConstruction,
  setPlotPermission,
  setPlotStatus,
  setInstallmentDate,
  setPostHandOver,
  setUponCompletion,
} from "@/lib/store/slices/projectSlice"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"

interface FilterSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface MasterDevelopment {
  _id: string
  developmentName: string
}

interface SubDevelopment {
  _id: string
  subDevelopment: string
}

enum PropertyType {
  Apartment = "Apartment",
  Shops = "Shops",
  Offices = "Offices",
  Hotel = "Hotel",
  Townhouse = "Townhouse",
  Villas = "Villas",
  Mansions = "Mansions",
  Showroom = "Showroom",
  Warehouse = "Warehouse",
  LabourCamp = "Labour Camp",
  Hospital = "Hospital",
  School = "School",
  Bungalow = "Bungalow",
}

enum SaleStatus {
  PRIMARY = "Primary",
  OFF_PLANN_RESALE = "Off Plan Resale",
  RESALE = "Resale",
}

const facilitiesCategoriesOptions = [
  "Shops",
  "School",
  "Petrol Pump",
  "Hospitals",
  "Clinics",
  "Malls",
  "Public Transport",
]

const amenitiesCategoriesOptions = [
  "Gym",
  "Swimming Pool",
  "Sauna",
  "Steam Room",
  "Yoga Room",
  "Aerobics Studio",
  "Jogging / walking tracks",
  "Tennis Court",
  "Badminton Court",
  "Basketball Court",
  "Cricket Ground",
  "Table Tennis",
  "Billiards",
  "Clubhouse",
  "Dance Studio",
  "Mini Golf",
  "Padel Tennis",
  "Landscaped Garden",
  "Park",
  "Playground",
  "Picnic Area",
  "Barbecue / grill stations",
  "Pet Park",
  "Water Park",
  "Roof gardens, Sky Decks",
  "Community farming, Garden plots",
  "Children Play Area",
  "Daycare / Nursery",
  "Kids Pool",
  "Teen lounge / Game zone",
  "Education center / Library",
  "Grocery",
  "ATM / Bank Kios",
  "Café / Restaurant/ Food Court",
  "Laundry",
  "Business Center",
  "Lockers",
  "Concierge / Help Desk",
  "Covered Parking",
  "Visitor Parking",
  "EV Charging Station",
  "Bicycle racks / storage",
  "Shuttle Service / Transport access",
  "24/7 Security",
  "CCTV Surveillance",
  "Gated Access",
  "Intercom system",
  "Fire Safety Systems",
  "Rainwater Harvesting",
  "Solar Panels",
  "Smart Home Features",
  "Banquet Hall",
  "Private theater / Mini cinema",
  "Amphitheater",
  "Music Room / Jamming studio",
  "Karaoke Room",
  "Lounge / Rooftop Bar",
  "Hobby Room",
  "Community Kitchen",
  "Book café or Reading Lounge",
  "On-call medical services / Nurse station",
  "Prayer Hall",
  "Handyman on-call services",
  "Pest control & Fumigation Support",
  "Green Building Certification",
  "Community Recycling Points",
]

const projectQualityOptions = ["A", "B", "C"]

const plotPermissionOptions = [
  "Apartment",
  "Shops",
  "Offices",
  "Hotel",
  "Townhouse",
  "Villas",
  "Mansions",
  "Showroom",
  "Warehouse",
  "Labour Camp",
  "Hospital",
  "School",
  "Bungalow",
]

const plotStatusOptions = ["Available", "Sold", "Reserved", "Under Construction"]

export function FilterSidebar({ open, onOpenChange }: FilterSidebarProps) {
  const dispatch = useDispatch()
  const filters = useSelector((state: RootState) => state.projectFilter)

  // Search states for master development
  const [masterDevSearchTerm, setMasterDevSearchTerm] = useState("")
  const [isSearchingMasterDev, setIsSearchingMasterDev] = useState(false)
  const [masterDevResults, setMasterDevResults] = useState<MasterDevelopment[]>([])
  const [selectedMasterDev, setSelectedMasterDev] = useState<MasterDevelopment | null>(null)
  const masterDevSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Search states for sub development
  const [subDevSearchTerm, setSubDevSearchTerm] = useState("")
  const [isSearchingSubDev, setIsSearchingSubDev] = useState(false)
  const [subDevResults, setSubDevResults] = useState<SubDevelopment[]>([])
  const [selectedSubDev, setSelectedSubDev] = useState<SubDevelopment | null>(null)
  const subDevSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    switch (name) {
      case "projectName":
        dispatch(setProjectName(value))
        break
      case "constructionStatus":
        const numValue = Number.parseInt(value)
        if (!isNaN(numValue) && numValue >= 0) {
          dispatch(setConstructionStatus(numValue))
        }
        break
      case "percentOfConstruction":
        const percent = Number.parseInt(value)
        if (!isNaN(percent) && percent >= 0 && percent <= 100) {
          dispatch(setpercentOfConstruction(percent))
        }
        break
    }
  }

  // Fetch master developments with debouncing
  const fetchMasterDevelopments = async (searchTerm = "") => {
    setIsSearchingMasterDev(true)
    try {
      let url = `${process.env.NEXT_PUBLIC_CMS_SERVER}/masterDevelopment`

      // Add search parameter if provided
      if (searchTerm) {
        url += `?developmentName=${encodeURIComponent(searchTerm)}`
      }

      const response = await axios.get(url)

      if (response.data && Array.isArray(response.data.data)) {
        setMasterDevResults(response.data.data)
      } else {
        setMasterDevResults([])
        console.error("Invalid response format for master developments:", response.data)
      }
    } catch (error) {
      console.error("Error fetching master developments:", error)
      setMasterDevResults([])
    } finally {
      setIsSearchingMasterDev(false)
    }
  }

  // Fetch sub developments with debouncing
  const fetchSubDevelopments = async (searchTerm = "") => {
    setIsSearchingSubDev(true)
    try {
      let url = `${process.env.NEXT_PUBLIC_CMS_SERVER}/subDevelopment`

      // Add search parameter if provided
      if (searchTerm) {
        url += `?subDevelopment=${encodeURIComponent(searchTerm)}`
      }

      const response = await axios.get(url)

      if (response.data && Array.isArray(response.data.data)) {
        setSubDevResults(response.data.data)
      } else {
        setSubDevResults([])
        console.error("Invalid response format for sub developments:", response.data)
      }
    } catch (error) {
      console.error("Error fetching sub developments:", error)
      setSubDevResults([])
    } finally {
      setIsSearchingSubDev(false)
    }
  }

  // Handle master development search input change with debouncing
  const handleMasterDevSearchChange = (value: string) => {
    setMasterDevSearchTerm(value)
    dispatch(setmasterDevelopment(value))

    // Clear previous timeout
    if (masterDevSearchTimeoutRef.current) {
      clearTimeout(masterDevSearchTimeoutRef.current)
    }

    // Set searching state
    setIsSearchingMasterDev(true)

    // Set a new timeout for debouncing
    masterDevSearchTimeoutRef.current = setTimeout(() => {
      fetchMasterDevelopments(value)
    }, 300) // 300ms debounce time
  }

  // Handle sub development search input change with debouncing
  const handleSubDevSearchChange = (value: string) => {
    setSubDevSearchTerm(value)
    dispatch(setsubDevelopment(value))

    // Clear previous timeout
    if (subDevSearchTimeoutRef.current) {
      clearTimeout(subDevSearchTimeoutRef.current)
    }

    // Set searching state
    setIsSearchingSubDev(true)

    // Set a new timeout for debouncing
    subDevSearchTimeoutRef.current = setTimeout(() => {
      fetchSubDevelopments(value)
    }, 300) // 300ms debounce time
  }

  // Select master development from dropdown
  const handleSelectMasterDev = (id: string) => {
    const selected = masterDevResults.find((dev) => dev._id === id)
    if (selected) {
      setSelectedMasterDev(selected)
      setMasterDevSearchTerm(selected.developmentName)
      dispatch(setmasterDevelopment(selected.developmentName))
    }
  }

  // Select sub development from dropdown
  const handleSelectSubDev = (id: string) => {
    const selected = subDevResults.find((dev) => dev._id === id)
    if (selected) {
      setSelectedSubDev(selected)
      setSubDevSearchTerm(selected.subDevelopment)
      dispatch(setsubDevelopment(selected.subDevelopment))
    }
  }

  const handlePropertyTypeChange = (value: PropertyType) => {
    dispatch(setPropertyType(value))
  }

  const handleSaleStatusChange = (value: SaleStatus) => {
    dispatch(setSaleStatus(value))
  }

  const handleProjectQualityChange = (value: string) => {
    dispatch(setProjectQuality(value))
  }

  const handleLaunchDateChange = (date: Date | undefined) => {
    dispatch(setLaunchDate(date ? format(date, "yyyy-MM-dd") : ""))
  }

  const handleCompletionDateChange = (date: Date | undefined) => {
    dispatch(setCompletionDate(date ? format(date, "yyyy-MM-dd") : ""))
  }

  const handleInstallmentDateChange = (date: Date | undefined) => {
    dispatch(setInstallmentDate(date ? format(date, "yyyy-MM-dd") : ""))
  }

  const handlePostHandOverChange = (date: Date | undefined) => {
    dispatch(setPostHandOver(date ? format(date, "yyyy-MM-dd") : ""))
  }

  const handleUponCompletionChange = (date: Date | undefined) => {
    dispatch(setUponCompletion(date ? format(date, "yyyy-MM-dd") : ""))
  }

  const handlePlotPermissionChange = (value: string, checked: boolean) => {
    const currentValues = filters.plotPermission || []
    const updated = checked ? [...currentValues, value] : currentValues.filter((item) => item !== value)
    dispatch(setPlotPermission(updated))
  }

  const handlePlotStatusChange = (value: string) => {
    dispatch(setPlotStatus(value))
  }

  const handleCheckboxChange = (
    category: "facilitiesCategories" | "amentiesCategories",
    value: string,
    checked: boolean,
  ) => {
    const currentValues = filters[category] || []
    const updated = checked ? [...currentValues, value] : currentValues.filter((item) => item !== value)

    if (category === "facilitiesCategories") {
      dispatch(setFacilitiesCategories(updated))
    } else {
      dispatch(setAmentiesCategories(updated))
    }
  }

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (masterDevSearchTimeoutRef.current) {
        clearTimeout(masterDevSearchTimeoutRef.current)
      }
      if (subDevSearchTimeoutRef.current) {
        clearTimeout(subDevSearchTimeoutRef.current)
      }
    }
  }, [])

  // Initialize search terms from filter state
  useEffect(() => {
    if (open) {
      setMasterDevSearchTerm(filters.masterDevelopment || "")
      setSubDevSearchTerm(filters.subDevelopment || "")
    }
  }, [open, filters.masterDevelopment, filters.subDevelopment])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-xl">Project Filter</SheetTitle>
          <SheetDescription>Adjust the filters to find your perfect project.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Master Development */}
          <div className="space-y-2">
            <Label htmlFor="masterDevelopment">Master Development</Label>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="masterDevelopmentSearch"
                  placeholder="Search master development..."
                  value={masterDevSearchTerm}
                  onChange={(e) => handleMasterDevSearchChange(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>
                {isSearchingMasterDev && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              <Select
                value={selectedMasterDev?._id || ""}
                onValueChange={handleSelectMasterDev}
                disabled={isSearchingMasterDev}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select master development" />
                </SelectTrigger>
                <SelectContent>
                  {masterDevResults.length > 0 ? (
                    masterDevResults.map((dev) => (
                      <SelectItem key={dev._id} value={dev._id}>
                        {dev.developmentName}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-muted-foreground">
                      {isSearchingMasterDev ? "Searching..." : "No master developments found"}
                    </div>
                  )}
                </SelectContent>
              </Select>

              {selectedMasterDev && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span>Selected: {selectedMasterDev.developmentName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedMasterDev(null)
                      setMasterDevSearchTerm("")
                      dispatch(setmasterDevelopment(""))
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sub Development */}
          <div className="space-y-2">
            <Label htmlFor="subDevelopment">Sub Development</Label>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="subDevelopmentSearch"
                  placeholder="Search sub development..."
                  value={subDevSearchTerm}
                  onChange={(e) => handleSubDevSearchChange(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>
                {isSearchingSubDev && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              <Select value={selectedSubDev?._id || ""} onValueChange={handleSelectSubDev} disabled={isSearchingSubDev}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select sub development" />
                </SelectTrigger>
                <SelectContent>
                  {subDevResults.length > 0 ? (
                    subDevResults.map((dev) => (
                      <SelectItem key={dev._id} value={dev._id}>
                        {dev.subDevelopment}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-muted-foreground">
                      {isSearchingSubDev ? "Searching..." : "No sub developments found"}
                    </div>
                  )}
                </SelectContent>
              </Select>

              {selectedSubDev && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span>Selected: {selectedSubDev.subDevelopment}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSubDev(null)
                      setSubDevSearchTerm("")
                      dispatch(setsubDevelopment(""))
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <Label>Property Type</Label>
            <Select value={filters.propertyType || ""} onValueChange={handlePropertyTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PropertyType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sale Status */}
          <div className="space-y-2">
            <Label>Sale Status</Label>
            <Select value={filters.saleStatus || ""} onValueChange={handleSaleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select sale status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SaleStatus).map(([value, label]) => (
                  <SelectItem key={value} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              name="projectName"
              placeholder="Enter project name"
              value={filters.projectName}
              onChange={handleInputChange}
            />
          </div>

          {/* Project Quality */}
          <div className="space-y-2">
            <Label>Project Quality</Label>
            <Select value={filters.projectQuality || ""} onValueChange={handleProjectQualityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select project quality" />
              </SelectTrigger>
              <SelectContent>
                {projectQualityOptions.map((quality) => (
                  <SelectItem key={quality} value={quality}>
                    {quality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Construction Status */}
          <div className="space-y-2">
            <Label htmlFor="constructionStatus">Construction Status</Label>
            <Input
              id="constructionStatus"
              name="constructionStatus"
              type="number"
              min="0"
              placeholder="Enter construction status"
              value={filters.constructionStatus}
              onChange={handleInputChange}
            />
          </div>

          {/* Percent of Construction */}
          <div className="space-y-2">
            <Label htmlFor="percentOfConstruction">Percent of Construction</Label>
            <Input
              id="percentOfConstruction"
              name="percentOfConstruction"
              type="number"
              min="0"
              max="100"
              placeholder="Enter percent of construction"
              value={filters.percentOfConstruction}
              onChange={handleInputChange}
            />
          </div>

          {/* Launch Date */}
          <div className="space-y-2">
            <Label>Launch Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.launchDate ? format(new Date(filters.launchDate), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.launchDate ? new Date(filters.launchDate) : undefined}
                  onSelect={handleLaunchDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Completion Date */}
          <div className="space-y-2">
            <Label>Completion Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.completionDate ? format(new Date(filters.completionDate), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.completionDate ? new Date(filters.completionDate) : undefined}
                  onSelect={handleCompletionDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Installment Date */}
          <div className="space-y-2">
            <Label>Installment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.installmentDate ? (
                    format(new Date(filters.installmentDate), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.installmentDate ? new Date(filters.installmentDate) : undefined}
                  onSelect={handleInstallmentDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Post Hand Over */}
          <div className="space-y-2">
            <Label>Post Hand Over</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.postHandOver ? format(new Date(filters.postHandOver), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.postHandOver ? new Date(filters.postHandOver) : undefined}
                  onSelect={handlePostHandOverChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Upon Completion */}
          <div className="space-y-2">
            <Label>Upon Completion</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.uponCompletion ? format(new Date(filters.uponCompletion), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.uponCompletion ? new Date(filters.uponCompletion) : undefined}
                  onSelect={handleUponCompletionChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <Label className="text-base">Plot Permission</Label>
            <div className="grid grid-cols-2 gap-2">
              {plotPermissionOptions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={`permission-${permission}`}
                    checked={filters.plotPermission?.includes(permission) || false}
                    onCheckedChange={(checked) => handlePlotPermissionChange(permission, checked as boolean)}
                  />
                  <Label htmlFor={`permission-${permission}`} className="text-sm font-normal">
                    {permission}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Plot Status */}
          <div className="space-y-2">
            <Label>Plot Status</Label>
            <Select value={filters.plotStatus || ""} onValueChange={handlePlotStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select plot status" />
              </SelectTrigger>
              <SelectContent>
                {plotStatusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Facilities Categories */}
          <div className="space-y-3">
            <Label className="text-base">Facilities Categories</Label>
            <div className="grid grid-cols-2 gap-2">
              {facilitiesCategoriesOptions.map((facility) => (
                <div key={facility} className="flex items-center space-x-2">
                  <Checkbox
                    id={`facility-${facility}`}
                    checked={filters.facilitiesCategories?.includes(facility) || false}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("facilitiesCategories", facility, checked as boolean)
                    }
                  />
                  <Label htmlFor={`facility-${facility}`} className="text-sm font-normal">
                    {facility}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities Categories */}
          <div className="space-y-3">
            <Label className="text-base">Amenities Categories</Label>
            <div className="grid grid-cols-2 gap-2">
              {amenitiesCategoriesOptions.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={filters.amentiesCategories?.includes(amenity) || false}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("amentiesCategories", amenity, checked as boolean)
                    }
                  />
                  <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
