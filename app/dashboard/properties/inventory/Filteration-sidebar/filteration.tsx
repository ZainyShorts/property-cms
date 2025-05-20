"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Search, Loader2 } from "lucide-react"
import { updateFilter, updateUnitView, resetFilters } from "@/lib/store/slices/filterSlice"
import type { RootState } from "@/lib/store/store"
import axios from "axios"

interface PropertyFilterSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface MasterDevelopment {
  _id: string
  developmentName: string
  roadLocation?: string
}

interface SubDevelopment {
  _id: string
  subDevelopment: string
}

interface Project {
  _id: string
  projectName: string
}

interface RoadLocation {
  _id: string
  name: string
}

export function PropertyFilterSidebar({ open, onOpenChange }: PropertyFilterSidebarProps) {
  const dispatch = useDispatch()
  const filter = useSelector((state: RootState) => state.filter)
  const [unitViewInput, setUnitViewInput] = useState("")

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

  // Search states for project
  const [projectSearchTerm, setProjectSearchTerm] = useState("")
  const [isSearchingProject, setIsSearchingProject] = useState(false)
  const [projectResults, setProjectResults] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const projectSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Search states for road location
  const [roadLocationSearchTerm, setRoadLocationSearchTerm] = useState("")
  const [isSearchingRoadLocation, setIsSearchingRoadLocation] = useState(false)
  const [roadLocationResults, setRoadLocationResults] = useState<RoadLocation[]>([])
  const [selectedRoadLocation, setSelectedRoadLocation] = useState<RoadLocation | null>(null)
  const roadLocationSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    dispatch(updateFilter({ [id]: value }))
  }

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    dispatch(updateFilter({ [id]: value ? Number(value) : undefined }))
  }

  type RangeField = "rentalPriceRange" | "salePriceRange" | "originalPriceRange" | "premiumAndLossRange"

  const handleRangeInputChange = (field: RangeField, minOrMax: "min" | "max", value: string) => {
    const numValue = value ? Number(value) : undefined

    const currentRange = filter[field] || { min: undefined, max: undefined }

    // Only update the filter if there's at least one valid value in the range
    const updatedRange = {
      ...currentRange,
      [minOrMax]: numValue,
    }

    // Only dispatch if at least one of min or max has a value
    if (updatedRange.min !== undefined || updatedRange.max !== undefined) {
      dispatch(
        updateFilter({
          [field]: updatedRange,
        }),
      )
    } else {
      // If both min and max are undefined, remove the range filter completely
      dispatch(
        updateFilter({
          [field]: undefined,
        }),
      )
    }
  }

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

  // Fetch master developments with debouncing
  const fetchMasterDevelopments = async (searchTerm = "") => {
    setIsSearchingMasterDev(true)
    setIsSearchingRoadLocation(true) // Also set road location as searching
    try {
      let url = `${process.env.NEXT_PUBLIC_CMS_SERVER}/masterDevelopment`

      if (searchTerm) {
        url += `?developmentName=${encodeURIComponent(searchTerm)}&fields=roadLocation,developmentName`
      }

      const response = await axios.get(url)

      if (response.data && Array.isArray(response.data.data)) {
        setMasterDevResults(response.data.data)

        // Extract unique road locations from master developments
        const roadLocations: RoadLocation[] = []
        const roadLocationSet = new Set<string>()

        response.data.data.forEach((dev: MasterDevelopment) => {
          if (dev.roadLocation && !roadLocationSet.has(dev.roadLocation)) {
            roadLocationSet.add(dev.roadLocation)
            roadLocations.push({
              _id: dev.roadLocation, // Using the roadLocation string as ID
              name: dev.roadLocation,
            })
          }
        })

        setRoadLocationResults(roadLocations)
      } else {
        setMasterDevResults([])
        setRoadLocationResults([])
        console.error("Invalid response format for master developments:", response.data)
      }
    } catch (error) {
      console.error("Error fetching master developments:", error)
      setMasterDevResults([])
      setRoadLocationResults([])
    } finally {
      setIsSearchingMasterDev(false)
      setIsSearchingRoadLocation(false)
    }
  }

  // Fetch sub developments with debouncing
  const fetchSubDevelopments = async (searchTerm = "") => {
    setIsSearchingSubDev(true)
    try {
      let url = `${process.env.NEXT_PUBLIC_CMS_SERVER}/subDevelopment`

      // Add search parameter if provided
      if (searchTerm) {
        url += `?subDevelopment=${encodeURIComponent(searchTerm)}&fields=subDevelopment`
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

  // Fetch projects with debouncing
  const fetchProjects = async (searchTerm = "") => {
    setIsSearchingProject(true)
    try {
      let url = `${process.env.NEXT_PUBLIC_CMS_SERVER}/project`

      // Add search parameter if provided
      if (searchTerm) {
        url += `?projectName=${encodeURIComponent(searchTerm)}&fields=projectName`
      }

      const response = await axios.get(url)

      if (response.data && Array.isArray(response.data.data)) {
        setProjectResults(response.data.data)
      } else {
        setProjectResults([])
        console.error("Invalid response format for projects:", response.data)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      setProjectResults([])
    } finally {
      setIsSearchingProject(false)
    }
  }

  // Handle road location search input change with debouncing
  const handleRoadLocationSearchChange = (value: string) => {
    setRoadLocationSearchTerm(value)
    dispatch(updateFilter({ roadLocation: value }))

    // Filter the existing roadLocationResults based on the search term
    if (value.trim() === "") {
      // If search term is empty, show all road locations from master developments
      fetchMasterDevelopments("")
    } else {
      // Filter the existing road locations based on the search term
      setIsSearchingRoadLocation(true)

      // Clear previous timeout
      if (roadLocationSearchTimeoutRef.current) {
        clearTimeout(roadLocationSearchTimeoutRef.current)
      }

      roadLocationSearchTimeoutRef.current = setTimeout(() => {
        const filteredResults = roadLocationResults.filter((loc) =>
          loc.name.toLowerCase().includes(value.toLowerCase()),
        )
        setRoadLocationResults(filteredResults)
        setIsSearchingRoadLocation(false)
      }, 300)
    }
  }

  // Select master development from dropdown
  const handleSelectMasterDev = (id: string) => {
    const selected = masterDevResults.find((dev) => dev._id === id)
    if (selected) {
      setSelectedMasterDev(selected)
      setMasterDevSearchTerm(selected.developmentName)
      dispatch(updateFilter({ developmentName: selected.developmentName }))
    }
  }

  // Select sub development from dropdown
  const handleSelectSubDev = (id: string) => {
    const selected = subDevResults.find((dev) => dev._id === id)
    if (selected) {
      setSelectedSubDev(selected)
      setSubDevSearchTerm(selected.subDevelopment)
      dispatch(updateFilter({ subDevelopment: selected.subDevelopment }))
    }
  }

  // Select project from dropdown
  const handleSelectProject = (id: string) => {
    const selected = projectResults.find((proj) => proj._id === id)
    if (selected) {
      setSelectedProject(selected)
      setProjectSearchTerm(selected.projectName)
      dispatch(updateFilter({ project: selected.projectName }))
    }
  }

  // Select road location from dropdown
  const handleSelectRoadLocation = (id: string) => {
    const selected = roadLocationResults.find((loc) => loc._id === id)
    if (selected) {
      setSelectedRoadLocation(selected)
      setRoadLocationSearchTerm(selected.name)
      dispatch(updateFilter({ roadLocation: selected.name }))
    }
  }

  // Handle master development search input change with debouncing
  const handleMasterDevSearchChange = (value: string) => {
    setMasterDevSearchTerm(value)

    // Clear previous timeout
    if (masterDevSearchTimeoutRef.current) {
      clearTimeout(masterDevSearchTimeoutRef.current)
    }

    masterDevSearchTimeoutRef.current = setTimeout(() => {
      fetchMasterDevelopments(value)
    }, 300)
  }

  // Handle sub development search input change with debouncing
  const handleSubDevSearchChange = (value: string) => {
    setSubDevSearchTerm(value)

    // Clear previous timeout
    if (subDevSearchTimeoutRef.current) {
      clearTimeout(subDevSearchTimeoutRef.current)
    }

    subDevSearchTimeoutRef.current = setTimeout(() => {
      fetchSubDevelopments(value)
    }, 300)
  }

  // Handle project search input change with debouncing
  const handleProjectSearchChange = (value: string) => {
    setProjectSearchTerm(value)

    // Clear previous timeout
    if (projectSearchTimeoutRef.current) {
      clearTimeout(projectSearchTimeoutRef.current)
    }

    projectSearchTimeoutRef.current = setTimeout(() => {
      fetchProjects(value)
    }, 300)
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
      if (projectSearchTimeoutRef.current) {
        clearTimeout(projectSearchTimeoutRef.current)
      }
      if (roadLocationSearchTimeoutRef.current) {
        clearTimeout(roadLocationSearchTimeoutRef.current)
      }
    }
  }, [])

  // Initialize search terms from filter state
  useEffect(() => {
    if (open) {
      setMasterDevSearchTerm(filter.developmentName || "")
      setSubDevSearchTerm(filter.subDevelopment || "")
      setProjectSearchTerm(filter.project || "")
      setRoadLocationSearchTerm(filter.roadLocation || "")
    }
  }, [open, filter.developmentName, filter.subDevelopment, filter.project, filter.roadLocation])

  // Fetch initial data when sidebar opens
  useEffect(() => {
    if (open) {
      // Fetch all master developments, sub developments, and projects when sidebar opens
      fetchMasterDevelopments()
      fetchSubDevelopments()
      fetchProjects()
      // Road locations are now fetched as part of fetchMasterDevelopments
    }
  }, [open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[70vw] lg:w-[50vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Property Filter</SheetTitle>
          <SheetDescription>Adjust the filters to find your perfect property.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="developmentName">Master Development</Label>
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
                      dispatch(updateFilter({ masterDevelopment: "" }))
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

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
                      dispatch(updateFilter({ subDevelopment: "" }))
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="projectSearch"
                  placeholder="Search project..."
                  value={projectSearchTerm}
                  onChange={(e) => handleProjectSearchChange(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>
                {isSearchingProject && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              <Select
                value={selectedProject?._id || ""}
                onValueChange={handleSelectProject}
                disabled={isSearchingProject}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projectResults.length > 0 ? (
                    projectResults.map((proj) => (
                      <SelectItem key={proj._id} value={proj._id}>
                        {proj.projectName}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-muted-foreground">
                      {isSearchingProject ? "Searching..." : "No projects found"}
                    </div>
                  )}
                </SelectContent>
              </Select>

              {selectedProject && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span>Selected: {selectedProject.projectName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProject(null)
                      setProjectSearchTerm("")
                      dispatch(updateFilter({ project: "" }))
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roadLocation">Road Location</Label>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="roadLocationSearch"
                  placeholder="Search road location..."
                  value={roadLocationSearchTerm}
                  onChange={(e) => handleRoadLocationSearchChange(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>
                {isSearchingRoadLocation && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              <Select
                value={selectedRoadLocation?._id || ""}
                onValueChange={handleSelectRoadLocation}
                disabled={isSearchingRoadLocation}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select road location" />
                </SelectTrigger>
                <SelectContent>
                  {roadLocationResults.length > 0 ? (
                    roadLocationResults.map((loc) => (
                      <SelectItem key={loc._id} value={loc._id}>
                        {loc.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-muted-foreground">
                      {isSearchingRoadLocation ? "Searching..." : "No road locations found"}
                    </div>
                  )}
                </SelectContent>
              </Select>

              {selectedRoadLocation && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span>Selected: {selectedRoadLocation.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRoadLocation(null)
                      setRoadLocationSearchTerm("")
                      dispatch(updateFilter({ roadLocation: "" }))
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
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
            <Label htmlFor="noOfBedRooms">Bed Rooms</Label>
            <Input
              id="noOfBedRooms"
              type="number"
              placeholder="Enter Bed Rooms"
              value={filter.noOfBedRooms || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitPurpose">Unit Purpose</Label>
            <Select
              value={filter.unitPurpose || ""}
              onValueChange={(value) => dispatch(updateFilter({ unitPurpose: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select unit purpose" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries({
                  Rent: "Rent",
                  Sell: "Sell",
                  Manage: "Manage",
                  Develop: "Develop",
                  Valuation: "Valuation",
                  Hold: "Hold",
                  Pending: "Pending",
                }).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
