"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { File, Plus, Minus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
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

  useEffect(() => {
    if (propertyToEdit) {
      console.log("Initialized data:", propertyToEdit) // Debugging

      const initialData: Record<string, any> = {}
      Object.entries(propertySections).forEach(([_, section]) => {
        Object.keys(section.fields).forEach((fieldKey) => {
          let value = propertyToEdit[fieldKey]

          if (fieldKey === "unitBUA" && propertyToEdit.hasOwnProperty("unitBua")) {
            value = propertyToEdit.unitBua
          } else if (fieldKey === "premiumLoss" && propertyToEdit.hasOwnProperty("premiumAndLoss")) {
            value = propertyToEdit.premiumAndLoss
          } else if (fieldKey === "rent" && propertyToEdit.hasOwnProperty("Rent")) {
            value = propertyToEdit.Rent
          } else if (fieldKey === "purpose" && propertyToEdit.hasOwnProperty("Purpose")) {
            value = propertyToEdit.Purpose
          }

          if (value !== undefined && value !== "N/A") {
            initialData[fieldKey] = value
          }
        })
      })

      setDataForm(initialData)
      setIsListed(propertyToEdit.listed || false)
      setIsEditing(true)

      if (propertyToEdit.propertyImages && propertyToEdit.propertyImages.length > 0) {
        setSelectedImages(propertyToEdit.propertyImages)

        // Store image keys if available
        if (propertyToEdit.propertyImageKeys && propertyToEdit.propertyImageKeys.length > 0) {
          initialData.propertyImageKeys = propertyToEdit.propertyImageKeys
        } else {
          // If no keys available, create placeholder keys (this is for backward compatibility)
          initialData.propertyImageKeys = propertyToEdit.propertyImages.map(
            (_: string, i: number) => `legacy-image-${propertyToEdit._id}-${i}`,
          )
        }
      }

      console.log("Initialized DDDData:", initialData) // Debugging
    } else if (propertyToEdit === null) {
      resetForm()
      console.log("empty")
    }
  }, [propertyToEdit])

  const resetForm = () => {
    setDataForm({})
    setSelectedImages([])
    setArrayInputs({})
    setErrors({})
    setIsListed(false)
    setIsEditing(false)
    setImagesToDelete([])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string, type: string) => {
    const { value } = e.target
    setDataForm((prev) => ({
      ...prev,
      [fieldKey]: type === "number" ? Number(value) : value,
    }))
  }

  const handleSelectChange = (value: string, fieldKey: string) => {
    setDataForm((prev) => ({ ...prev, [fieldKey]: value }))
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

    if (!dataForm.roadLocation?.trim()) newErrors.roadLocation = true
    if (!dataForm.developmentName?.trim()) newErrors.developmentName = true
    if (!dataForm.projectName?.trim()) newErrors.projectName = true
    if (!dataForm.propertyType) newErrors.propertyType = true
    if (!dataForm.propertyHeight) newErrors.propertyHeight = true
    if (!dataForm.projectLocation?.trim()) newErrors.projectLocation = true
    if (!dataForm.purpose?.trim()) newErrors.purpose = true

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields")
      return
    }

    const finalData = Object.entries({
      clerkId: user?.id,
      roadLocation: dataForm.roadLocation,
      developmentName: dataForm.developmentName,
      ...(dataForm.subDevelopment && { subDevelopmentName: dataForm.subDevelopment }),
      projectName: dataForm.projectName,
      propertyType: dataForm.propertyType,
      propertyHeight: dataForm.propertyHeight,
      projectLocation: dataForm.projectLocation,
      ...(dataForm.unitNumber && { unitNumber: dataForm.unitNumber }),
      ...(dataForm.bedrooms && { bedrooms: dataForm.bedrooms }),
      ...(dataForm.unitLandSize && { unitLandSize: dataForm.unitLandSize }),
      ...(dataForm.unitBUA && { unitBua: dataForm.unitBUA }),
      ...(dataForm.unitLocation && { unitLocation: dataForm.unitLocation }),
      ...(dataForm.unitView?.length > 0 && { unitView: dataForm.unitView }),
      propertyImages: selectedImages,
      propertyImageKeys: dataForm.propertyImageKeys || [],
      Purpose: dataForm.purpose,
      ...(dataForm.vacancyStatus && { vacancyStatus: dataForm.vacancyStatus }),
      ...(dataForm.primaryPrice && { primaryPrice: dataForm.primaryPrice }),
      ...(dataForm.resalePrice && { resalePrice: dataForm.resalePrice }),
      ...(dataForm.premiumLoss && { premiumAndLoss: dataForm.premiumLoss }),
      ...(dataForm.rent && { Rent: dataForm.rent }),
      ...(dataForm.noOfCheques && { noOfCheques: dataForm.noOfCheques }),
      listed:
        typeof isListed === "boolean" ? isListed : isListed === "YES" ? true : isListed === "NO" ? false : isListed, // Keep it as is if it's not "YES" or "NO"
    }).reduce((acc, [key, value]) => {
      if (value !== "N/A" && value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {})

    try {
      let response
      if (isEditing) {
        const updatedData = { ...finalData, _id: propertyToEdit._id }

        // Process any images marked for deletion
        if (imagesToDelete.length > 0) {
          const deletePromises = imagesToDelete.map((imageKey) => deleteFromAWS(imageKey))
          await Promise.all(deletePromises)
        }

        console.log(updatedData)
        response = await axios.put(`${process.env.NEXT_PUBLIC_CMS_SERVER}/property/updateSingleRecord`, updatedData)
        resetForm()
      } else {
        console.log(finalData)

        response = await axios.post(`${process.env.NEXT_PUBLIC_CMS_SERVER}/property/addSingleRecord`, finalData)
      }
      console.log(response)
      if (response.data.success) {
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
            {Object.entries(propertySections).map(([key, section]) => (
              <PropertySection key={key} title={section.title}>
                {Object.entries(section.fields).map(([fieldKey, field]) =>
                  field.type === "select" ? (
                    <SelectField
                      key={fieldKey}
                      label={field.label}
                      fieldKey={fieldKey}
                      options={field.options as any}
                      value={dataForm[fieldKey] || ""}
                      onChange={(value) => handleSelectChange(value, fieldKey)}
                    />
                  ) : field.type === "array" ? (
                    <div key={fieldKey} className="space-y-2 mb-4">
                      <Label htmlFor={fieldKey}>{field.label}</Label>
                      <Input
                        name={fieldKey}
                        value={arrayInputs[fieldKey] || ""}
                        onChange={(e) => handleArrayInputChange(e, fieldKey)}
                        onKeyDown={(e) => handleArrayInputKeyDown(e, fieldKey)}
                        type="text"
                        id={fieldKey}
                        placeholder="Type and press Enter"
                        className={`bg-input border-input ${errors[fieldKey] ? "border-destructive" : ""}`}
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Array.isArray(dataForm[fieldKey]) &&
                          dataForm[fieldKey]?.length > 0 &&
                          (dataForm[fieldKey] || []).map((value: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 px-3 py-1.5 bg-muted rounded-full text-sm"
                            >
                              {value}
                              <button
                                onClick={() => removeArrayItem(fieldKey, index)}
                                className="ml-1 hover:text-zinc-400"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : field.type === "images" ? (
                    <div key={fieldKey} className="col-span-2 space-y-4">
                      <Label>{field.label}</Label>
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
                  ) : (
                    <div key={fieldKey} className="space-y-2 mb-4">
                      <Label htmlFor={fieldKey}>{field.label}</Label>
                      <Input
                        name={fieldKey}
                        value={dataForm[fieldKey] || ""}
                        onChange={(e) => handleChange(e, fieldKey, field.type)}
                        type={field.type}
                        id={fieldKey}
                        placeholder={field.placeholder}
                        className={`bg-input border-input ${errors[fieldKey] ? "border-destructive" : ""}`}
                      />
                    </div>
                  ),
                )}
              </PropertySection>
            ))}
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox id="listed" checked={isListed} onCheckedChange={(checked) => setIsListed(checked as boolean)} />
              <Label htmlFor="listed">Is property listed?</Label>
            </div>
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

function PropertySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

function SelectField({
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
