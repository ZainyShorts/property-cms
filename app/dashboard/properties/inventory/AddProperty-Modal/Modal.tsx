"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { File, Plus, Minus, X, Search } from "lucide-react"
import axios from "axios"
import { useUser } from "@clerk/nextjs"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

interface AddPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  propertyToEdit?: any
}

const propertyTypes = {
  Townhouse: "Townhouse",
  Education: "Education",
  Office: "Office",
  Shop: "Shop",
  Nursery: "Nursery",
}

const propertySections = {
  locationDetails: {
    title: "Location Details",
    fields: {
      roadLocation: { label: "Road Location", type: "text", placeholder: "Required" },
      developmentName: { label: "Development Name", type: "text", placeholder: "Required" },
    },
  },
  subDevelopment: {
    title: "Sub Development",
    fields: {
      subDevelopment: { label: "Sub Development (optional)", type: "text", placeholder: "Optional" },
    },
  },
  projectDetails: {
    title: "Project Details",
    fields: {
      projectName: { label: "Project Name", type: "text", placeholder: "Required" },
      propertyType: { label: "Property Type", type: "select", options: propertyTypes, placeholder: "Required" },
      propertyHeight: { label: "Property Height", type: "text", placeholder: "Required" },
      projectLocation: { label: "Project Location", type: "text", placeholder: "Required" },
    },
  },
  unitDetails: {
    title: "Unit Details",
    fields: {
      unitNumber: { label: "Unit Number", type: "text", placeholder: "Optional" },
      bedrooms: { label: "Bedrooms", type: "number", placeholder: "Optional" },
      unitLandSize: { label: "Unit Land Size", type: "number", placeholder: "Optional" },
      unitBUA: { label: "Unit BUA", type: "number", placeholder: "Optional" },
      unitLocation: { label: "Unit Location", type: "text", placeholder: "Optional" },
      unitView: { label: "Unit View", type: "array", placeholder: "Optional" },
    },
  },
  availability: {
    title: "Availability",
    fields: {
      purpose: { label: "Purpose", type: "text", placeholder: "Required" },
      vacancyStatus: { label: "Vacancy Status", type: "text", placeholder: "Optional" },
      primaryPrice: { label: "Primary Price", type: "number", placeholder: "Optional" },
      resalePrice: { label: "Resale Price", type: "number", placeholder: "Optional" },
      premiumLoss: { label: "Premium / Loss", type: "number", placeholder: "Optional" },
      rent: { label: "Rent", type: "number", placeholder: "Optional" },
      noOfCheques: { label: "No of Cheques", type: "number", placeholder: "Optional" },
    },
  },
  propertyImages: {
    title: "Property Images",
    fields: {
      propertyImages: { label: "Property Images", type: "images", placeholder: "Select up to 6 images" },
    },
  },
}

export function AddPropertyModal({ isOpen, onClose, propertyToEdit }: AddPropertyModalProps) {
  const { isSignedIn, user, isLoaded } = useUser()

  const [dataForm, setDataForm] = useState<Record<string, any>>({})
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [arrayInputs, setArrayInputs] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [isListed, setIsListed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [projectSearchTerm, setProjectSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showProjectResults, setShowProjectResults] = useState(false)

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (propertyToEdit) {
      console.log("Initialized data:", propertyToEdit)

      // Fetch specific project details when in edit mode
      const fetchProjectDetails = async () => {
        if (propertyToEdit.project) {
          try {
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_CMS_SERVER}/project/${propertyToEdit.project}?populate=subDevelopment,masterDevelopment`,
            )
            if (response.data && response.data.data) {
              setSelectedProject(response.data.data)
            }
          } catch (error) {
            console.error("Error fetching project details:", error)
            toast.error("Failed to load project details")
          }
        }
      }

      fetchProjectDetails()

      // Convert string numbers to actual numbers
      setDataForm({
        project: propertyToEdit.project || "",
        unitNumber: propertyToEdit.unitNumber || "",
        unitHeight: typeof propertyToEdit.unitHeight === "number" ? propertyToEdit.unitHeight : 0,
        unitInternalDesign: propertyToEdit.unitInternalDesign || "",
        unitExternalDesign: propertyToEdit.unitExternalDesign || "",
        plotSizeSqFt: typeof propertyToEdit.plotSizeSqFt === "number" ? propertyToEdit.plotSizeSqFt : 0,
        BuaSqFt: typeof propertyToEdit.BuaSqFt === "number" ? propertyToEdit.BuaSqFt : 0,
        unitType: propertyToEdit.unitType || "",
        unitView: propertyToEdit.unitView || [],
        unitPurpose: propertyToEdit.unitPurpose || "",
        listingDate: propertyToEdit.listingDate || "",
        chequeFrequency: propertyToEdit.chequeFrequency || "",
        rentalPrice: typeof propertyToEdit.rentalPrice === "number" ? propertyToEdit.rentalPrice : 0,
        salePrice: typeof propertyToEdit.salePrice === "number" ? propertyToEdit.salePrice : 0,
        rentedAt: propertyToEdit.rentedAt || "",
        rentedTill: propertyToEdit.rentedTill || "",
        vacantOn: propertyToEdit.vacantOn || "",
        originalPrice: typeof propertyToEdit.originalPrice === "number" ? propertyToEdit.originalPrice : 0,
        paidTODevelopers:
          typeof propertyToEdit.paidTODevelopers === "number"
            ? propertyToEdit.paidTODevelopers
            : propertyToEdit.paidTODevelopers
              ? Number(propertyToEdit.paidTODevelopers)
              : 0,
        payableTODevelopers:
          typeof propertyToEdit.payableTODevelopers === "number"
            ? propertyToEdit.payableTODevelopers
            : propertyToEdit.payableTODevelopers
              ? Number(propertyToEdit.payableTODevelopers)
              : 0,
        premiumAndLoss: typeof propertyToEdit.premiumAndLoss === "number" ? propertyToEdit.premiumAndLoss : 0,
      })

      if (propertyToEdit.pictures && propertyToEdit.pictures.length > 0) {
        setSelectedImages(propertyToEdit.pictures)
      }

      setIsEditing(true)
    } else if (propertyToEdit === null) {
      resetForm()
    }
  }, [propertyToEdit])

  // Update master and sub development when project changes
  useEffect(() => {
    if (selectedProject) {
      setDataForm((prev) => ({
        ...prev,
        masterDevelopment: selectedProject.masterDevelopment?._id || "",
        masterDevelopmentName: selectedProject.masterDevelopment?.developmentName || "",
        subDevelopment: selectedProject.subDevelopment?._id || "",
        subDevelopmentName: selectedProject.subDevelopment?.subDevelopment || "",
      }))
    }
  }, [selectedProject])

  const resetForm = () => {
    setDataForm({})
    setSelectedImages([])
    setArrayInputs({})
    setErrors({})
    setIsListed(false)
    setIsEditing(false)
    setImagesToDelete([])
    setSelectedProject(null)
    // Reset search state
    setProjectSearchTerm("")
    setIsSearching(false)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = null
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string, type: string) => {
    const { value } = e.target
    setDataForm((prev) => ({
      ...prev,
      [fieldKey]: type === "number" ? Number(value) : value,
    }))
  }

  const handleSelectChange = (value: string, fieldKey: string) => {
    if (fieldKey === "project") {
      const project = projects.find((p) => p._id === value)
      setSelectedProject(project)
    }

    setDataForm((prev) => ({ ...prev, [fieldKey]: value }))
  }

  const handleProjectSearch = (searchTerm: string) => {
    setProjectSearchTerm(searchTerm)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set searching state
    setIsSearching(true)

    // Set a new timeout for debouncing
    searchTimeoutRef.current = setTimeout(() => {
      fetchProjects(searchTerm)
    }, 300) // 300ms debounce time
  }

  const fetchProjects = async (searchTerm = "") => {
    setIsSearching(true)
    try {
      let url = `${process.env.NEXT_PUBLIC_CMS_SERVER}/project?populate=subDevelopment,masterDevelopment`

      // Add search parameter if provided
      if (searchTerm) {
        url += `&projectName=${encodeURIComponent(searchTerm)}`
      }

      const response = await axios.get(url)

      if (response.data && Array.isArray(response.data.data)) {
        setProjects(response.data.data)
      } else {
        setProjects([])
        console.error("Invalid response format:", response.data)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      setProjects([])
      toast.error("Failed to load projects. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const uploadImageToAWS = async (file: File, setUploadProgress: (progress: number) => void): Promise<any> => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PLUDO_SERVER}/aws/signed-url?fileName=${file.name}&contentType=${file.type}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      const signedUrl = response.data.msg.url

      const uploadResponse = await axios.put(signedUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(progress)
          }
        },
      })

      if (uploadResponse.status === 200) {
        return { awsUrl: signedUrl.split("?")[0], key: response.data.msg.key }
      } else {
        throw new Error("Failed to upload file")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      throw new Error("Failed to upload file")
    }
  }

  const deleteFromAWS = async (filename: string): Promise<void> => {
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_PLUDO_SERVER}/aws/${filename}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response) {
        return response.data
      } else {
        throw new Error("Failed to delete file")
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      throw new Error("Failed to delete file")
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {}

    if (!dataForm.project) newErrors.project = true
    if (!dataForm.unitNumber) newErrors.unitNumber = true
    if (!dataForm.unitType) newErrors.unitType = true
    if (!dataForm.unitPurpose) newErrors.unitPurpose = true

    setErrors(newErrors)

    // If there are errors, scroll to the first error
    if (Object.keys(newErrors).length > 0) {
      // Use setTimeout to ensure the DOM has updated with error messages
      setTimeout(() => {
        const firstErrorElement = document.querySelector(".border-destructive")
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 100)
    }

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Don't show toast, just scroll to the first error
      return
    }

    const finalData = {
      project: dataForm.project || "",
      unitNumber: dataForm.unitNumber || "",
      unitHeight: dataForm.unitHeight ? Number(dataForm.unitHeight) : 0,
      unitInternalDesign: dataForm.unitInternalDesign || "",
      unitExternalDesign: dataForm.unitExternalDesign || "",
      plotSizeSqFt: dataForm.plotSizeSqFt ? Number(dataForm.plotSizeSqFt) : 0,
      BuaSqFt: dataForm.BuaSqFt ? Number(dataForm.BuaSqFt) : 0,
      unitType: dataForm.unitType || "",
      unitView: dataForm.unitView || [],
      pictures: selectedImages,
      unitPurpose: dataForm.unitPurpose || "",
      listingDate: dataForm.listingDate || "",
      chequeFrequency: dataForm.chequeFrequency || "",
      rentalPrice: dataForm.rentalPrice ? Number(dataForm.rentalPrice) : 0,
      salePrice: dataForm.salePrice ? Number(dataForm.salePrice) : 0,
      rentedAt: dataForm.rentedAt || "",
      rentedTill: dataForm.rentedTill || "",
      vacantOn: dataForm.vacantOn || "",
      originalPrice: dataForm.originalPrice ? Number(dataForm.originalPrice) : 0,
      paidTODevelopers: dataForm.paidTODevelopers ? Number(dataForm.paidTODevelopers) : 0,
      payableTODevelopers: dataForm.payableTODevelopers ? Number(dataForm.payableTODevelopers) : 0,
      premiumAndLoss: dataForm.premiumAndLoss ? Number(dataForm.premiumAndLoss) : 0,
    }

    try {
      let response
      if (isEditing) {
        const updatedData = { ...finalData }

        // Process any images marked for deletion
        if (imagesToDelete.length > 0) {
          const deletePromises = imagesToDelete.map((imageKey) => deleteFromAWS(imageKey))
          await Promise.all(deletePromises)
        }

        console.log("Updating property:", updatedData)
        response = await axios.patch(
          `${process.env.NEXT_PUBLIC_CMS_SERVER}/inventory/${propertyToEdit._id}`,
          updatedData,
        )
      } else {
        console.log("Adding property:", finalData)
        response = await axios.post(`${process.env.NEXT_PUBLIC_CMS_SERVER}/inventory`, finalData)
      }
      console.log(response)
      if (response.data) {
        toast.success(isEditing ? "Property updated successfully!" : "Property added successfully!")
        onClose()
        resetForm()
      }
    } catch (error) {
      console.error(isEditing ? "Error updating property:" : "Error adding property:", error)
      toast.error(
        isEditing ? "Failed to update property. Please try again." : "Failed to add property. Please try again.",
      )
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Limit to remaining slots available (max 6 images)
    const remainingSlots = 6 - selectedImages.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    if (filesToUpload.length === 0) return

    // Show loading toast
    const loadingToastId = toast.loading("Uploading image...")

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        // Upload to AWS and get URL
        const result = await uploadImageToAWS(file, (progress) => {
          // Progress handling if needed
        })

        return {
          url: result.awsUrl,
          key: result.key,
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)

      setSelectedImages((prev) => {
        const combined = [...prev, ...uploadedImages.map((img) => img.url)]
        return combined.slice(0, 6) // Ensure max 6 images
      })

      // Store image keys in the form data
      setDataForm((prev) => ({
        ...prev,
        propertyImageKeys: [...(prev.propertyImageKeys || []), ...uploadedImages.map((img) => img.key)],
      }))

      toast.dismiss(loadingToastId)
      toast.success("Images uploaded successfully")
    } catch (error) {
      console.error("Error uploading images:", error)
      toast.dismiss(loadingToastId)
      toast.error("Failed to upload images. Please try again.")
    }
  }

  const removeImage = async (index: number) => {
    // Get the image key to delete
    const imageKeys = dataForm.propertyImageKeys || []
    const imageKey = imageKeys[index]

    if (isEditing && imageKey) {
      // In editing mode, just mark for deletion and remove from preview
      setImagesToDelete((prev) => [...prev, imageKey])

      // Remove from state
      setSelectedImages((prev) => prev.filter((_, i) => i !== index))

      // Remove from form data
      setDataForm((prev) => ({
        ...prev,
        propertyImageKeys: prev.propertyImageKeys.filter((_: string, i: number) => i !== index),
      }))

      toast.success("Image removed from preview")
    } else if (imageKey) {
      try {
        // Show loading toast
        const loadingToastId = toast.loading("Deleting image...")

        // Delete from AWS
        await deleteFromAWS(imageKey)

        // Remove from state
        setSelectedImages((prev) => prev.filter((_, i) => i !== index))

        // Remove from form data
        setDataForm((prev) => ({
          ...prev,
          propertyImageKeys: prev.propertyImageKeys.filter((_: string, i: number) => i !== index),
        }))

        toast.dismiss(loadingToastId)
        toast.success("Image deleted successfully")
      } catch (error) {
        console.error("Error deleting image:", error)
        toast.error("Failed to delete image. Please try again.")
      }
    } else {
      setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleArrayInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, fieldName: string) => {
    if (e.key === "Enter" && arrayInputs[fieldName]?.trim()) {
      e.preventDefault()
      setDataForm((prev) => ({
        ...prev,
        [fieldName]: [...(prev[fieldName] || []), arrayInputs[fieldName].trim()],
      }))
      setArrayInputs((prev) => ({ ...prev, [fieldName]: "" }))
    }
  }

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    setArrayInputs((prev) => ({ ...prev, [fieldName]: e.target.value }))
  }

  const removeArrayItem = (fieldKey: string, index: number) => {
    setDataForm((prev) => ({
      ...prev,
      [fieldKey]: (prev[fieldKey] || []).filter((_: any, i: number) => i !== index),
    }))
  }

  // Add this useEffect for cleanup
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Add click outside handler to close project results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const searchInput = document.getElementById("projectSearch")
      if (searchInput && !searchInput.contains(target)) {
        setShowProjectResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm()
          onClose()
        }
      }}
    >
      <DialogContent className="lg:max-w-5xl bg-background text-foreground">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <DialogTitle className="text-2xl font-bold">{isEditing ? "Edit Property" : "Add Property"}</DialogTitle>
            <File className="text-white" />
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] pr-4 p-2 overflow-y-auto scrollbar-hide">
          <div className="space-y-8 p-2">
            {/* Project Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Project Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectSearch">Project</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        id="projectSearch"
                        placeholder="Search projects..."
                        value={projectSearchTerm}
                        onChange={(e) => handleProjectSearch(e.target.value)}
                        className={`w-full pl-10 ${errors.project ? "border-destructive" : ""}`}
                        autoComplete="off"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Search className="h-4 w-4" />
                      </div>
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>

                    <Select
                      value={dataForm.project || ""}
                      onValueChange={(value) => handleSelectChange(value, "project")}
                      disabled={isSearching}
                    >
                      <SelectTrigger className={`w-full ${errors.project ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.length > 0 ? (
                          projects.map((project) => (
                            <SelectItem key={project._id} value={project._id}>
                              {project.projectName}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-muted-foreground">
                            {isSearching ? "Searching..." : "No projects found"}
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
                            setDataForm((prev) => ({
                              ...prev,
                              project: "",
                              masterDevelopment: "",
                              masterDevelopmentName: "",
                              subDevelopment: "",
                              subDevelopmentName: "",
                            }))
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {errors.project && <p className="text-sm text-destructive">Project is required</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="masterDevelopment">Master Development</Label>
                  <Input
                    id="masterDevelopment"
                    value={selectedProject?.masterDevelopment?.developmentName || ""}
                    disabled
                    className="bg-input border-input opacity-70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subDevelopment">Sub Development</Label>
                  <Input
                    id="subDevelopment"
                    value={selectedProject?.subDevelopment?.subDevelopment || ""}
                    disabled
                    className="bg-input border-input opacity-70"
                  />
                </div>
              </div>
            </div>

            {/* Unit Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Unit Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitNumber">Unit Number</Label>
                  <Input
                    id="unitNumber"
                    name="unitNumber"
                    value={dataForm.unitNumber || ""}
                    onChange={(e) => handleChange(e, "unitNumber", "text")}
                    className={`bg-input border-input ${errors.unitNumber ? "border-destructive" : ""}`}
                    placeholder="e.g., A-101"
                  />
                  {errors.unitNumber && <p className="text-sm text-destructive">Unit number is required</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitHeight">Unit Height (ft)</Label>
                  <Input
                    id="unitHeight"
                    name="unitHeight"
                    value={dataForm.unitHeight || ""}
                    onChange={(e) => handleChange(e, "unitHeight", "number")}
                    type="number"
                    className="bg-input border-input"
                    placeholder="e.g., 12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitInternalDesign">Internal Design</Label>
                  <Input
                    id="unitInternalDesign"
                    name="unitInternalDesign"
                    value={dataForm.unitInternalDesign || ""}
                    onChange={(e) => handleChange(e, "unitInternalDesign", "text")}
                    className="bg-input border-input"
                    placeholder="e.g., Modern"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitExternalDesign">External Design</Label>
                  <Input
                    id="unitExternalDesign"
                    name="unitExternalDesign"
                    value={dataForm.unitExternalDesign || ""}
                    onChange={(e) => handleChange(e, "unitExternalDesign", "text")}
                    className="bg-input border-input"
                    placeholder="e.g., Contemporary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plotSizeSqFt">Plot Size (sq ft)</Label>
                  <Input
                    id="plotSizeSqFt"
                    name="plotSizeSqFt"
                    value={dataForm.plotSizeSqFt || ""}
                    onChange={(e) => handleChange(e, "plotSizeSqFt", "number")}
                    type="number"
                    className="bg-input border-input"
                    placeholder="e.g., 1500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="BuaSqFt">BUA (sq ft)</Label>
                  <Input
                    id="BuaSqFt"
                    name="BuaSqFt"
                    value={dataForm.BuaSqFt || ""}
                    onChange={(e) => handleChange(e, "BuaSqFt", "number")}
                    type="number"
                    className="bg-input border-input"
                    placeholder="e.g., 1200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitType">Unit Type</Label>
                  <Select
                    value={dataForm.unitType || ""}
                    onValueChange={(value) => handleSelectChange(value, "unitType")}
                  >
                    <SelectTrigger
                      id="unitType"
                      className={`bg-input border-input ${errors.unitType ? "border-destructive" : ""}`}
                    >
                      <SelectValue placeholder="Select unit type..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {Object.entries({
                        Studio: "Studio",
                        "1 BR": "1 BR",
                        "2 BR": "2 BR",
                        "3 BR": "3 BR",
                        "4 BR": "4 BR",
                        "5 BR": "5 BR",
                        "6 BR": "6 BR",
                        "7 BR": "7 BR",
                        "8 BR": "8 BR",
                      }).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unitType && <p className="text-sm text-destructive">Unit type is required</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitView">Unit View</Label>
                  <Input
                    id="unitView"
                    name="unitView"
                    value={arrayInputs.unitView || ""}
                    onChange={(e) => handleArrayInputChange(e, "unitView")}
                    onKeyDown={(e) => handleArrayInputKeyDown(e, "unitView")}
                    className="bg-input border-input"
                    placeholder="Type and press Enter (e.g., Sea View)"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(dataForm.unitView) &&
                      dataForm.unitView?.map((view: string, index: number) => (
                        <div key={index} className="flex items-center gap-1 px-3 py-1.5 bg-muted rounded-full text-sm">
                          {view}
                          <button
                            onClick={() => removeArrayItem("unitView", index)}
                            className="ml-1 hover:text-zinc-400"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Property Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Property Images</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground overflow-hidden"
                  >
                    {selectedImages[index] ? (
                      <>
                        <img
                          src={selectedImages[index] || "/placeholder.svg"}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-accent"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </>
                    ) : index === selectedImages.length ? (
                      <label className="flex items-center justify-center w-full h-full cursor-pointer hover:bg-accent/50">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={selectedImages.length >= 6}
                        />
                        <Plus className="h-8 w-8 text-muted-foreground" />
                      </label>
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="text-sm text-zinc-500">Select up to 6 images</p>
            </div>

            {/* Pricing & Availability */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing & Availability</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitPurpose">Unit Purpose</Label>
                  <Select
                    value={dataForm.unitPurpose || ""}
                    onValueChange={(value) => handleSelectChange(value, "unitPurpose")}
                  >
                    <SelectTrigger
                      id="unitPurpose"
                      className={`bg-input border-input ${errors.unitPurpose ? "border-destructive" : ""}`}
                    >
                      <SelectValue placeholder="Select purpose..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
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
                  {errors.unitPurpose && <p className="text-sm text-destructive">Unit purpose is required</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="listingDate">Listing Date</Label>
                  <Input
                    id="listingDate"
                    name="listingDate"
                    type="date"
                    value={dataForm.listingDate || ""}
                    onChange={(e) => handleChange(e, "listingDate", "text")}
                    className="bg-input border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chequeFrequency">Cheque Frequency</Label>
                  <Input
                    id="chequeFrequency"
                    name="chequeFrequency"
                    value={dataForm.chequeFrequency || ""}
                    onChange={(e) => handleChange(e, "chequeFrequency", "text")}
                    className="bg-input border-input"
                    placeholder="e.g., Quarterly"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rentalPrice">Rental Price</Label>
                  <Input
                    id="rentalPrice"
                    name="rentalPrice"
                    type="number"
                    value={dataForm.rentalPrice || ""}
                    onChange={(e) => handleChange(e, "rentalPrice", "number")}
                    className="bg-input border-input"
                    placeholder="Enter rental price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salePrice">Sale Price</Label>
                  <Input
                    id="salePrice"
                    name="salePrice"
                    type="number"
                    value={dataForm.salePrice || ""}
                    onChange={(e) => handleChange(e, "salePrice", "number")}
                    className="bg-input border-input"
                    placeholder="Enter sale price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price</Label>
                  <Input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    value={dataForm.originalPrice || ""}
                    onChange={(e) => handleChange(e, "originalPrice", "number")}
                    className="bg-input border-input"
                    placeholder="Enter original price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="premiumAndLoss">Premium/Loss</Label>
                  <Input
                    id="premiumAndLoss"
                    name="premiumAndLoss"
                    type="number"
                    value={dataForm.premiumAndLoss || ""}
                    onChange={(e) => handleChange(e, "premiumAndLoss", "number")}
                    className="bg-input border-input"
                    placeholder="Enter premium/loss amount"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Important Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rentedAt">Rented At</Label>
                  <Input
                    id="rentedAt"
                    name="rentedAt"
                    type="date"
                    value={dataForm.rentedAt || ""}
                    onChange={(e) => handleChange(e, "rentedAt", "text")}
                    className="bg-input border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rentedTill">Rented Till</Label>
                  <Input
                    id="rentedTill"
                    name="rentedTill"
                    type="date"
                    value={dataForm.rentedTill || ""}
                    onChange={(e) => handleChange(e, "rentedTill", "text")}
                    className="bg-input border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vacantOn">Vacant On</Label>
                  <Input
                    id="vacantOn"
                    name="vacantOn"
                    type="date"
                    value={dataForm.vacantOn || ""}
                    onChange={(e) => handleChange(e, "vacantOn", "text")}
                    className="bg-input border-input"
                  />
                </div>
              </div>
            </div>

            {/* Developer Payments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Developer Payments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paidTODevelopers">Paid to Developers</Label>
                  <Input
                    id="paidTODevelopers"
                    name="paidTODevelopers"
                    value={dataForm.paidTODevelopers || ""}
                    onChange={(e) => handleChange(e, "paidTODevelopers", "number")}
                    type="number"
                    className="bg-input border-input"
                    placeholder="Amount paid to developers"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payableTODevelopers">Payable to Developers</Label>
                  <Input
                    id="payableTODevelopers"
                    name="payableTODevelopers"
                    value={dataForm.payableTODevelopers || ""}
                    onChange={(e) => handleChange(e, "payableTODevelopers", "number")}
                    type="number"
                    className="bg-input border-input"
                    placeholder="Amount payable to developers"
                  />
                </div>
              </div>
            </div>

            {/* <div className="flex items-center space-x-2 mb-4">
              <Checkbox id="listed" checked={isListed} onCheckedChange={(checked) => setIsListed(checked as boolean)} />
              <Label htmlFor="listed">Is property listed?</Label>
            </div> */}

            <Button
              onClick={handleSubmit}
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isEditing ? "Update Property" : "Add Property"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export function PropertySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

export function SelectField({
  label,
  fieldKey,
  options,
  value,
  onChange,
}: {
  label: string
  fieldKey: string
  options: Record<string, string>
  value: string
  onChange: (value: string) => void
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-")
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldKey}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={fieldKey} className="bg-input border-input">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {Object.entries(options).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
