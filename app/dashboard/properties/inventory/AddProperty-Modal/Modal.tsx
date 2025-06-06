"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { File, Plus, Minus, Loader2 } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

interface AddPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  propertyToEdit?: any
  fetchRecords?: () => void
}

const unitTypes = {
  Studio: "Studio",
  Office: "Office",
  Shop: "Shop",
  Bedroom: "Bedroom",
}

const unitPurposes = {
  Rent: "Rent",
  Sell: "Sell",
  Manage: "Manage",
  Develop: "Develop",
  Valuation: "Valuation",
  Hold: "Hold",
  Pending: "Pending",
}

export function AddPropertyModal({ fetchRecords, isOpen, onClose, propertyToEdit }: AddPropertyModalProps) {
  const [dataForm, setDataForm] = useState<Record<string, any>>({})
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [arrayInputs, setArrayInputs] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // Handle property editing initialization
  useEffect(() => {
    if (propertyToEdit) {
      console.log("Initializing edit mode with data:", propertyToEdit)
      setIsEditing(true)

      // Initialize form data from propertyToEdit
      setDataForm({
        unitNumber: propertyToEdit.unitNumber || "",
        unitHeight: propertyToEdit.unitHeight || "",
        unitInternalDesign: propertyToEdit.unitInternalDesign || "",
        unitExternalDesign: propertyToEdit.unitExternalDesign || "",
        plotSizeSqFt: typeof propertyToEdit.plotSizeSqFt === "number" ? propertyToEdit.plotSizeSqFt : "",
        BuaSqFt: typeof propertyToEdit.BuaSqFt === "number" ? propertyToEdit.BuaSqFt : "",
        noOfBedRooms: typeof propertyToEdit.noOfBedRooms === "number" ? propertyToEdit.noOfBedRooms : "",
        unitType: propertyToEdit.unitType || "",
        rentedAt: propertyToEdit.rentedAt || "",
        rentedTill: propertyToEdit.rentedTill || "",
        unitView: propertyToEdit.unitView || [],
        unitPurpose: propertyToEdit.unitPurpose || "",
        listingDate: propertyToEdit.listingDate || "",
        purchasePrice: typeof propertyToEdit.purchasePrice === "number" ? propertyToEdit.purchasePrice : "",
        marketPrice: typeof propertyToEdit.marketPrice === "number" ? propertyToEdit.marketPrice : "",
        askingPrice: typeof propertyToEdit.askingPrice === "number" ? propertyToEdit.askingPrice : "",
        premiumAndLoss: typeof propertyToEdit.premiumAndLoss === "number" ? propertyToEdit.premiumAndLoss : "",
        marketRent: typeof propertyToEdit.marketRent === "number" ? propertyToEdit.marketRent : "",
        askingRent: typeof propertyToEdit.askingRent === "number" ? propertyToEdit.askingRent : "",
        paidTODevelopers: typeof propertyToEdit.paidTODevelopers === "number" ? propertyToEdit.paidTODevelopers : "",
        payableTODevelopers:
          typeof propertyToEdit.payableTODevelopers === "number" ? propertyToEdit.payableTODevelopers : "",
      })

      if (propertyToEdit.pictures && propertyToEdit.pictures.length > 0) {
        setSelectedImages(propertyToEdit.pictures)
      }
    } else if (propertyToEdit === null) {
      resetForm()
    }
  }, [propertyToEdit])

  const resetForm = () => {
    setDataForm({})
    setSelectedImages([])
    setArrayInputs({})
    setErrors({})
    setIsEditing(false)
    setImagesToDelete([])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string, type: string) => {
    const { value } = e.target
    setDataForm((prev) => ({
      ...prev,
      [fieldKey]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }))
  }

  const handleSelectChange = (value: string, fieldKey: string) => {
    setDataForm((prev) => {
      const newData = { ...prev, [fieldKey]: value }

      // Clear noOfBedRooms if unitType is not "Bedroom"
      if (fieldKey === "unitType" && value !== "Bedroom") {
        newData.noOfBedRooms = ""
      }

      return newData
    })
  }

  const uploadImageToAWS = async (file: File, setUploadProgress: (progress: number) => void): Promise<any> => {
    try {
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

    // Required fields
    if (!dataForm.unitPurpose) newErrors.unitPurpose = true
    if (!dataForm.unitNumber) newErrors.unitNumber = true
    if (!dataForm.unitType) newErrors.unitType = true

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
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
      return
    }
    setLoading(true)

    const finalData = {
      unitNumber: dataForm.unitNumber || "",
      unitHeight: dataForm.unitHeight || "",
      unitInternalDesign: dataForm.unitInternalDesign || "",
      unitExternalDesign: dataForm.unitExternalDesign || "",
      plotSizeSqFt: dataForm.plotSizeSqFt ? Number(dataForm.plotSizeSqFt) : 0,
      BuaSqFt: dataForm.BuaSqFt ? Number(dataForm.BuaSqFt) : 0,
      noOfBedRooms: dataForm.unitType === "Bedroom" && dataForm.noOfBedRooms ? Number(dataForm.noOfBedRooms) : 0,
      unitType: dataForm.unitType || "",
      rentedAt: dataForm.rentedAt || "",
      rentedTill: dataForm.rentedTill || "",
      unitView: dataForm.unitView || [],
      unitPurpose: dataForm.unitPurpose || "",
      listingDate: dataForm.listingDate || "",
      purchasePrice: dataForm.purchasePrice ? Number(dataForm.purchasePrice) : 0,
      marketPrice: dataForm.marketPrice ? Number(dataForm.marketPrice) : 0,
      askingPrice: dataForm.askingPrice ? Number(dataForm.askingPrice) : 0,
      premiumAndLoss: dataForm.premiumAndLoss ? Number(dataForm.premiumAndLoss) : 0,
      marketRent: dataForm.marketRent ? Number(dataForm.marketRent) : 0,
      askingRent: dataForm.askingRent ? Number(dataForm.askingRent) : 0,
      pictures: selectedImages,
      paidTODevelopers: dataForm.paidTODevelopers ? Number(dataForm.paidTODevelopers) : 0,
      payableTODevelopers: dataForm.payableTODevelopers ? Number(dataForm.payableTODevelopers) : 0,
    }

    try {
      let response
      if (isEditing) {
        const updatedData = { ...finalData }

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

      setLoading(false)

      if (response.data) {
        toast.success(isEditing ? "Property updated successfully!" : "Property added successfully!")
        if (fetchRecords) {
          fetchRecords()
        }
        onClose()
        resetForm()
      }
    } catch (error) {
      setLoading(false)
      console.error(isEditing ? "Error updating property:" : "Error adding property:", error)
      toast.error(
        isEditing ? "Failed to update property. Please try again." : "Failed to add property. Please try again.",
      )
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const remainingSlots = 6 - selectedImages.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    if (filesToUpload.length === 0) return

    const loadingToastId = toast.loading("Uploading image...")

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
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
        return combined.slice(0, 6)
      })

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
    const imageKeys = dataForm.propertyImageKeys || []
    const imageKey = imageKeys[index]

    if (isEditing && imageKey) {
      setImagesToDelete((prev) => [...prev, imageKey])
      setSelectedImages((prev) => prev.filter((_, i) => i !== index))
      setDataForm((prev) => ({
        ...prev,
        propertyImageKeys: prev.propertyImageKeys?.filter((_: string, i: number) => i !== index) || [],
      }))
      toast.success("Image removed from preview")
    } else if (imageKey) {
      try {
        const loadingToastId = toast.loading("Deleting image...")
        await deleteFromAWS(imageKey)
        setSelectedImages((prev) => prev.filter((_, i) => i !== index))
        setDataForm((prev) => ({
          ...prev,
          propertyImageKeys: prev.propertyImageKeys?.filter((_: string, i: number) => i !== index) || [],
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
      <DialogContent className="lg:max-w-4xl bg-background text-foreground">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <DialogTitle className="text-2xl font-bold">{isEditing ? "Edit Property" : "Add Property"}</DialogTitle>
            <File className="text-white" />
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] pr-4 p-2 overflow-y-auto scrollbar-hide">
          <div className="space-y-8 p-2">
            {/* Unit Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Unit Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitNumber">Unit Number *</Label>
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
                  <Label htmlFor="unitType">Unit Type *</Label>
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
                      {Object.entries(unitTypes).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unitType && <p className="text-sm text-destructive">Unit type is required</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitPurpose">Unit Purpose *</Label>
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
                      {Object.entries(unitPurposes).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unitPurpose && <p className="text-sm text-destructive">Unit purpose is required</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitHeight">Unit Height</Label>
                  <Input
                    id="unitHeight"
                    name="unitHeight"
                    value={dataForm.unitHeight || ""}
                    onChange={(e) => handleChange(e, "unitHeight", "text")}
                    className="bg-input border-input"
                    placeholder="e.g., 12 ft"
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

                {/* Conditional Bedrooms field - only show when Bedroom is selected */}
                {dataForm.unitType === "Bedroom" && (
                  <div className="space-y-2">
                    <Label htmlFor="noOfBedRooms">Number of Bedrooms</Label>
                    <Input
                      id="noOfBedRooms"
                      name="noOfBedRooms"
                      value={dataForm.noOfBedRooms || ""}
                      onChange={(e) => handleChange(e, "noOfBedRooms", "number")}
                      type="number"
                      className="bg-input border-input"
                      placeholder="e.g., 2"
                    />
                  </div>
                )}

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

            {/* Rental Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rental Information</h3>
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
              </div>
            </div>

            {/* Pricing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="purchasePrice">Purchase Price</Label>
                  <Input
                    id="purchasePrice"
                    name="purchasePrice"
                    type="number"
                    value={dataForm.purchasePrice || ""}
                    onChange={(e) => handleChange(e, "purchasePrice", "number")}
                    className="bg-input border-input"
                    placeholder="Enter purchase price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marketPrice">Market Price</Label>
                  <Input
                    id="marketPrice"
                    name="marketPrice"
                    type="number"
                    value={dataForm.marketPrice || ""}
                    onChange={(e) => handleChange(e, "marketPrice", "number")}
                    className="bg-input border-input"
                    placeholder="Enter market price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="askingPrice">Asking Price</Label>
                  <Input
                    id="askingPrice"
                    name="askingPrice"
                    type="number"
                    value={dataForm.askingPrice || ""}
                    onChange={(e) => handleChange(e, "askingPrice", "number")}
                    className="bg-input border-input"
                    placeholder="Enter asking price"
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
                    placeholder="Enter premium/loss"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marketRent">Market Rent</Label>
                  <Input
                    id="marketRent"
                    name="marketRent"
                    type="number"
                    value={dataForm.marketRent || ""}
                    onChange={(e) => handleChange(e, "marketRent", "number")}
                    className="bg-input border-input"
                    placeholder="Enter market rent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="askingRent">Asking Rent</Label>
                  <Input
                    id="askingRent"
                    name="askingRent"
                    type="number"
                    value={dataForm.askingRent || ""}
                    onChange={(e) => handleChange(e, "askingRent", "number")}
                    className="bg-input border-input"
                    placeholder="Enter asking rent"
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

            <Button
              onClick={handleSubmit}
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Update Property" : "Add Property"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
