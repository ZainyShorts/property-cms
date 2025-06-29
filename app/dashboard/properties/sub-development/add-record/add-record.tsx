"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, ImageIcon, Upload, Search, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import axios from "axios"
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import useSWR from "swr"

import { Progress } from "@/components/ui/progress"
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface MasterDevelopment {
  _id: string
  roadLocation: string
  developmentName: string
  locationQuality: string
  buaAreaSqFt: number
  facilitiesAreaSqFt: number
  amentiesAreaSqFt: number
  totalAreaSqFt: number
  pictures: string[]
  facilitiesCategories: string[]
  amentiesCategories: string[]
  createdAt: string
  updatedAt: string
}

// Define the SubDevRecord type
interface SubDevRecord {
  _id?: string
  masterDevelopment?: MasterDevelopment | string
  roadLocation?: string
  developmentName?: string
  subDevelopment: string
  plotNumber: string
  plotHeight: number
  plotPermission: string
  plotSizeSqFt: number
  plotBUASqFt: number
  plotStatus: string
  buaAreaSqFt: number
  facilitiesAreaSqFt: number
  amenitiesAreaSqFt: number
  totalAreaSqFt: number
  pictures: string[]
  facilitiesCategories: string[]
  amentiesCategories: string[]
}

// Change the formSchema to make plotPermission an array instead of a string
const formSchema = z.object({
  masterDevelopment: z.string().min(1, "Master development is required"),
  roadLocation: z.string().optional(),
  developmentName: z.string().optional(),
  subDevelopment: z.string().min(1, "Sub development is required"),
  plotNumber: z.string().min(1, "Plot number is Required"),
  plotHeight: z.coerce.number().positive("Plot height must be positive"),
  plotPermission: z.array(z.string()).min(1, "Select at least one plot permission"),
  plotSizeSqFt: z.coerce.number().nonnegative("Value cannot be negative").min(0, "Plot size is required"),
  plotBUASqFt: z.coerce.number().nonnegative("Value cannot be negative").min(0, "Plot BUA is required"),
  plotStatus: z.string().min(1, "Plot status is required"),
  buaAreaSqFt: z.coerce.number().nonnegative("Value cannot be negative").min(0, "BUA area is required"),
  facilitiesAreaSqFt: z.coerce.number().nonnegative("Value cannot be negative").min(0, "Facilities area is required"),
  amenitiesAreaSqFt: z.coerce.number().nonnegative("Value cannot be negative").min(0, "Amenities area is required"),
  totalAreaSqFt: z.coerce.number().nonnegative("Value cannot be negative").min(0, "Total size is required"),
  facilitiesCategories: z.array(z.string()).min(0, "Select at least one facility category"),
  amentiesCategories: z.array(z.string()).min(0, "Select at least one amenity category"),
  pictures: z.array(z.any()).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AddRecordModalProps {
  setIsModalOpen: (open: boolean) => void
  editRecord?: SubDevRecord | null
  onRecordSaved?: () => void
}

interface ImageData {
  file: File
  preview: string
  awsUrl?: string
  awsKey?: string
  isExisting?: boolean
}

// Define empty form values
const emptyFormValues = {
  masterDevelopment: "",
  roadLocation: "",
  developmentName: "",
  subDevelopment: "",
  plotNumber: "",
  plotHeight: 0,
  plotPermission: [],
  plotSizeSqFt: 0,
  plotBUASqFt: 0,
  plotStatus: "",
  buaAreaSqFt: 0,
  facilitiesAreaSqFt: 0,
  amenitiesAreaSqFt: 0,
  totalAreaSqFt: 0,
  facilitiesCategories: [],
  amentiesCategories: [],
  pictures: [],
}

export function SubDevAddRecordModal({ setIsModalOpen, editRecord = null, onRecordSaved }: AddRecordModalProps) {
  const [pictures, setPictures] = useState<Array<ImageData | null>>(Array(6).fill(null))
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [error, setError] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Array<number>>(Array(6).fill(0))
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null))
  const [masterDevelopments, setMasterDevelopments] = useState<MasterDevelopment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isEditMode = !!editRecord
  const [devNameSearchTerm, setDevNameSearchTerm] = useState("")
  const [isSearchingDevName, setIsSearchingDevName] = useState(false)
  const { data: authData } = useSWR("/api/me", fetcher)

  // Extract masterDevelopment ID if it's an object
  const getMasterDevelopmentId = () => {
    if (!editRecord?.masterDevelopment) return ""

    if (typeof editRecord.masterDevelopment === "object" && editRecord.masterDevelopment !== null) {
      const id = editRecord.masterDevelopment._id || ""
      console.log("Master development is an object, extracted ID:", id)
      return id
    }

    console.log("Master development is a string:", editRecord.masterDevelopment)
    return editRecord.masterDevelopment as string
  }

  // Initialize form with empty values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyFormValues,
  })

  // Reset form when edit mode changes
  useEffect(() => {
    if (isEditMode && editRecord) {
      const masterDevId = getMasterDevelopmentId()

      form.reset({
        masterDevelopment: masterDevId,
        roadLocation: editRecord.roadLocation || "",
        developmentName: editRecord.developmentName || "",
        subDevelopment: editRecord.subDevelopment || "",
        plotNumber: editRecord.plotNumber || "",
        plotHeight: editRecord.plotHeight || 0,
        plotPermission: Array.isArray(editRecord.plotPermission)
          ? editRecord.plotPermission
          : editRecord.plotPermission
            ? [editRecord.plotPermission]
            : [],
        plotSizeSqFt: editRecord.plotSizeSqFt || 0,
        plotBUASqFt: editRecord.plotBUASqFt || 0,
        plotStatus: editRecord.plotStatus || "",
        buaAreaSqFt: editRecord.buaAreaSqFt || 0,
        facilitiesAreaSqFt: editRecord.facilitiesAreaSqFt || 0,
        amenitiesAreaSqFt: editRecord.amenitiesAreaSqFt || 0,
        totalAreaSqFt: editRecord.totalAreaSqFt || 0,
        facilitiesCategories: editRecord.facilitiesCategories || [],
        amentiesCategories: editRecord.amentiesCategories || [],
        pictures: [],
      })

      // Initialize pictures from existing record
      if (editRecord.pictures && editRecord.pictures.length > 0) {
        const newPictures = Array(6).fill(null)
        editRecord.pictures.forEach((url, index) => {
          if (index < 6) {
            newPictures[index] = {
              file: new File([], `image-${index}.jpg`),
              preview: url,
              awsUrl: url,
              isExisting: true,
            }
          }
        })
        setPictures(newPictures)
      }
    } else {
      // Reset to empty values for add mode
      form.reset(emptyFormValues)
      setPictures(Array(6).fill(null))
      setImagesToDelete([])
    }
  }, [editRecord, form, isEditMode])

  const masterDevelopment = useWatch({
    control: form.control,
    name: "masterDevelopment",
  })

  const fetchMasterDevelopments = async (searchTerm = "") => {
    try {
      setIsLoading(true)
      const endpoint = searchTerm
        ? `${process.env.NEXT_PUBLIC_CMS_SERVER}/masterDevelopment?developmentName=${searchTerm}`
        : `${process.env.NEXT_PUBLIC_CMS_SERVER}/masterDevelopment`

      const response = await axios.get(endpoint)
      const fetchedDevelopments = response.data.data
      setMasterDevelopments(fetchedDevelopments)

      // If there's a search term and a currently selected masterDevelopment,
      // check if the selected masterDevelopment is still in the filtered results
      if (searchTerm && masterDevelopment) {
        const isSelectedDevInResults = fetchedDevelopments.some(
          (dev: MasterDevelopment) => dev._id === masterDevelopment,
        )

        if (!isSelectedDevInResults) {
          form.setValue("masterDevelopment", "")
          form.setValue("roadLocation", "")
          form.setValue("developmentName", "")
        }
      }
    } catch (error) {
      console.error("Error fetching master developments:", error)
      toast.error("Failed to load master developments")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!masterDevelopments.length) {
      fetchMasterDevelopments()
    }
  }, [])

  // Cleanup effect to reset form when component unmounts
  useEffect(() => {
    return () => {
      // Reset form to empty values
      form.reset(emptyFormValues)

      // Clear pictures state and revoke blob URLs
      setPictures((prevPictures) => {
        prevPictures.forEach((pic) => {
          if (pic && pic.preview && pic.preview.startsWith("blob:")) {
            URL.revokeObjectURL(pic.preview)
          }
        })
        return Array(6).fill(null)
      })

      // Reset other states
      setError(null)
      setActiveImageIndex(null)
      setUploadProgress(Array(6).fill(0))
      setDevNameSearchTerm("")
      setIsSearchingDevName(false)
      setImagesToDelete([])
    }
  }, [form])

  const buaAreaSqFt = useWatch({
    control: form.control,
    name: "buaAreaSqFt",
    defaultValue: 0,
  })

  const facilitiesAreaSqFt = useWatch({
    control: form.control,
    name: "facilitiesAreaSqFt",
    defaultValue: 0,
  })

  const amenitiesAreaSqFt = useWatch({
    control: form.control,
    name: "amenitiesAreaSqFt",
    defaultValue: 0,
  })

  // Update development name and road location when master development changes
  useEffect(() => {
    if (masterDevelopment) {
      const selectedDevelopment = masterDevelopments.find((dev) => dev._id === masterDevelopment)
      if (selectedDevelopment) {
        form.setValue("roadLocation", selectedDevelopment.roadLocation)
        form.setValue("developmentName", selectedDevelopment.developmentName)
      }
    } else {
      // Clear roadLocation and developmentName if no masterDevelopment is selected
      form.setValue("roadLocation", "")
      form.setValue("developmentName", "")
    }
  }, [masterDevelopment, masterDevelopments, form])

  // Auto-calculate total land area (buaAreaSqFt + facilitiesAreaSqFt + amenitiesAreaSqFt)
  useEffect(() => {
    const totalLandArea = Number(buaAreaSqFt || 0) + Number(facilitiesAreaSqFt || 0) + Number(amenitiesAreaSqFt || 0)
    form.setValue("totalAreaSqFt", totalLandArea)
  }, [buaAreaSqFt, facilitiesAreaSqFt, amenitiesAreaSqFt, form])

  const handleCheckChangedFields = () => {
    const currentValues = form.getValues()
    const changedFields: Record<string, any> = {}

    Object.entries(currentValues).forEach(([key, value]) => {
      if (key === "pictures") return // Skip pictures here, we'll handle them separately

      // Handle masterDevelopment specially
      if (key === "masterDevelopment") {
        const currentMasterDevId = value
        const originalMasterDevId = getMasterDevelopmentId()

        if (currentMasterDevId !== originalMasterDevId) {
          changedFields[key] = value
        }
        return
      }

      const editValue = editRecord?.[key as keyof typeof editRecord]

      if (Array.isArray(value) && Array.isArray(editValue)) {
        const sortedValue = [...value].sort()
        const sortedEditValue = [...editValue].sort()
        if (JSON.stringify(sortedValue) !== JSON.stringify(sortedEditValue)) {
          changedFields[key] = value
        }
      } else if (value !== editValue) {
        changedFields[key] = value
      }
    })

    // We'll handle pictures separately in the onSubmit function
    // to ensure all new images are uploaded to AWS first

    return changedFields
  }

  const uploadImageToAWS = async (file: File, index: number): Promise<{ awsUrl: string; key: string }> => {
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

      await axios.put(signedUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress((prev) => {
              const newProgress = [...prev]
              newProgress[index] = progress
              return newProgress
            })
          }
        },
      })

      return {
        awsUrl: signedUrl.split("?")[0],
        key: response.data.msg.key,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const newPictures = [...pictures]

      // Mark this as a new image that needs to be uploaded to AWS
      newPictures[index] = {
        file,
        preview: URL.createObjectURL(file),
        isExisting: false, // Explicitly mark as not existing
      }

      setPictures(newPictures)
      setActiveImageIndex(null)
    }
  }

  const removePicture = async (index: number) => {
    const image = pictures[index]
    if (!image) return

    try {
      if (image.preview && image.preview.startsWith("blob:")) {
        URL.revokeObjectURL(image.preview)
      }

      if (isEditMode && image.isExisting && image.awsUrl) {
        // In edit mode, track the image for deletion but don't delete immediately
        setImagesToDelete((prev) => [...prev, image.awsUrl!])
        toast.success("Image marked for deletion")
      } else if (!isEditMode && image.awsKey) {
        // In create mode, delete immediately
        try {
          await deleteFromAWS(image.awsKey)
          toast.success("Image deleted successfully")
        } catch (error: any) {
          const deleteErrorMessage =
            error?.response?.data?.message ||
            error?.response?.message ||
            error?.message ||
            "Failed to delete image. Please try again."
          toast.error(deleteErrorMessage)
        }
      }

      const newPictures = [...pictures]
      newPictures[index] = null
      setPictures(newPictures)
    } catch (error) {
      toast.error("Failed to remove image")
      console.error("Error removing picture:", error)
    }
  }

  const handleImageBoxClick = (index: number) => {
    setActiveImageIndex(index)
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.click()
    }
  }

  const onSubmit = async (data: FormValues) => {
    console.log("submitting", data)
    setIsSubmitting(true)
    try {
      // Delete all marked images from AWS in edit mode
      if (isEditMode && imagesToDelete.length > 0) {
        try {
          console.log("Deleting images from AWS:", imagesToDelete)

          // Extract keys from URLs for deletion
          const deletePromises = imagesToDelete.map((imageUrl) => {
            // Extract the key from the full AWS URL
            const urlParts = imageUrl.split("/")
            const imageKey = urlParts[urlParts.length - 1]
            return deleteFromAWS(imageKey)
          })

          await Promise.all(deletePromises)
          console.log("Successfully deleted all marked images from AWS")
          toast.success(`Deleted ${imagesToDelete.length} image(s) from storage`)
        } catch (error: any) {
          console.error("Error deleting images from AWS:", error)
          const deleteErrorMessage =
            error?.response?.data?.message ||
            error?.response?.message ||
            error?.message ||
            "Some images could not be deleted from storage"
          toast.error(deleteErrorMessage)
          // Continue with the update even if image deletion fails
        }
      }

      // Upload all images to AWS and get their URLs
      const uploadPromises = pictures.map(async (pic, index) => {
        if (pic) {
          // If it's an existing image that hasn't changed, just return it
          if (pic.isExisting && pic.awsUrl) {
            return pic
          }

          if (pic.file) {
            try {
              const { awsUrl, key } = await uploadImageToAWS(pic.file, index)
              return { ...pic, awsUrl, awsKey: key, isExisting: false }
            } catch (error) {
              console.error(`Failed to upload image ${index}:`, error)
              return null
            }
          }
        }
        return pic
      })

      const uploadedPictures = await Promise.all(uploadPromises)

      // Extract AWS URLs from the uploaded pictures
      const pictureUrls = uploadedPictures
        .filter((pic): pic is NonNullable<typeof pic> => pic !== null)
        .map((pic) => pic.awsUrl)

      // Prepare the data to submit, including AWS URLs for images
      // Only include roadLocation if masterDevelopment is selected
      const submitData: Record<string, any> = {
        ...data,
        pictures: pictureUrls,
      }

      // Remove roadLocation if no masterDevelopment is selected
      if (!data.masterDevelopment) {
        delete submitData.roadLocation
        delete submitData.developmentName
      }

      if (isEditMode && editRecord) {
        // In edit mode, always include the pictures array in changedFields
        const changedFields = handleCheckChangedFields()

        // Force include pictures in changedFields to ensure they're updated
        changedFields.pictures = pictureUrls

        // Remove roadLocation from changedFields if no masterDevelopment is selected
        if (!data.masterDevelopment) {
          delete changedFields.roadLocation
          delete changedFields.developmentName
        }

        if (Object.keys(changedFields).length === 0) {
          toast.info("No changes detected")
          setIsModalOpen(false)
          return
        } else {
          console.log("Updating record with changed fields:", changedFields)
          console.log("Record ID:", editRecord._id)
          try {
            const response = await axios.patch(
              `${process.env.NEXT_PUBLIC_CMS_SERVER}/subDevelopment/updateSingleRecord/${editRecord._id}`,
              changedFields,
            )

            console.log("Update response:", response)
            toast.success("Sub-development record has been updated successfully")
          } catch (error: any) {
            console.error("Error submitting form:", error)

            // Show specific error message from server response
            const errorMessage = error?.response?.data?.message || error?.response?.message || error?.message

            if (error.response?.data?.statusCode === 400) {
              toast.error(errorMessage || "Bad Request: Please check your input data")
            } else if (error.response?.data?.statusCode === 409) {
              toast.error(errorMessage || "Conflict: Record already exists")
            } else {
              toast.error(errorMessage || `Failed to ${isEditMode ? "update" : "add"} record. Please try again.`)
            }
          }
          if (onRecordSaved) {
            onRecordSaved()
          }
        }
      } else {
        console.log("Sending", submitData)
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_CMS_SERVER}/subDevelopment/addSingleRecord`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${authData.token}`,
            },
          },
        )
        toast.success("Sub-development record has been added successfully")
        console.log("res", response)
        if (onRecordSaved) {
          onRecordSaved()
        }
      }

      // Reset form after successful submission
      if (!isEditMode) {
        form.reset(emptyFormValues)
        setPictures(Array(6).fill(null))
      }
      // Reset images to delete array
      setImagesToDelete([])

      setIsModalOpen(false)
    } catch (error: any) {
      console.error("Error submitting form:", error)

      // Show specific error message from server response
      const errorMessage = error?.response?.data?.message || error?.response?.message || error?.message

      if (error.response?.data?.status === 400) {
        toast.error(errorMessage || "Bad Request: Please check your input data")
      } else if (error.response?.data?.status === 409) {
        toast.error(errorMessage || "Conflict: Record already exists")
      } else {
        toast.error(errorMessage || `Failed to ${isEditMode ? "update" : "add"} record. Please try again.`)
      }
    } finally {
      setIsSubmitting(false)
    }
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

  const plotStatusOptions = ["Vacant", "Under Construction", "Ready", "Pending"]

  // Update the handleDevNameSearchChange function to call fetchMasterDevelopments with the search term
  const handleDevNameSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setDevNameSearchTerm(term)

    // Set searching state
    setIsSearchingDevName(true)

    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetchMasterDevelopments(term)
      setIsSearchingDevName(false)
    }, 500)

    // Clear the timeout if the component unmounts or the search term changes again
    return () => clearTimeout(timeoutId)
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${process.env.NEXT_PUBLIC_CMS_SERVER}/masterDevelopment`)
        const fetchedDevelopments = response.data.data
        setMasterDevelopments(fetchedDevelopments)

        if (editRecord && editRecord.masterDevelopment) {
          const masterDevId = getMasterDevelopmentId()
          console.log("Edit mode, setting master development:", masterDevId)

          form.setValue("masterDevelopment", masterDevId)

          const selectedDevelopment = fetchedDevelopments.find((dev) => dev._id === masterDevId)
          if (selectedDevelopment) {
            form.setValue("roadLocation", selectedDevelopment.roadLocation)
            form.setValue("developmentName", selectedDevelopment.developmentName)
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
        toast.error("Failed to load master developments")
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [editRecord, form])

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">
          {isEditMode ? "Edit Sub-Development" : "Add Sub-Development"}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Master Development Selection */}
            <div className="space-y-4">
              <FormLabel>Master Development</FormLabel>

              {/* Search Input for Development Names */}
              <div className="relative mb-2">
                <Input
                  placeholder="Search development names..."
                  value={devNameSearchTerm}
                  onChange={handleDevNameSearchChange}
                  className="pr-10"
                />
                {isSearchingDevName ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Master Development Dropdown */}
              <FormField
                control={form.control}
                name="masterDevelopment"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select master development" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoading ? (
                          <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Loading...</span>
                          </div>
                        ) : masterDevelopments.length > 0 ? (
                          masterDevelopments.map((dev) => (
                            <SelectItem key={dev._id} value={dev._id}>
                              {dev.developmentName}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-muted-foreground">No developments found</div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Road Location (Read-only) */}
            <FormField
              control={form.control}
              name="roadLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Road Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Auto-filled from master development"
                      {...field}
                      disabled
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sub Development */}
            <FormField
              control={form.control}
              name="subDevelopment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Development</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Palm Gardens Phase 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plot Number */}
            <FormField
              control={form.control}
              name="plotNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot Number</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="e.g. 101-N" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plot Height */}
            <FormField
              control={form.control}
              name="plotHeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot Height</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="e.g. 25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plot Size SqFt */}
            <FormField
              control={form.control}
              name="plotSizeSqFt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot Size (sq ft)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="e.g. 1500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plot BUA SqFt */}
            <FormField
              control={form.control}
              name="plotBUASqFt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot BUA (sq ft)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="e.g. 1200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plot Status */}
            <FormField
              control={form.control}
              name="plotStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plot status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {plotStatusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BUA Area SqFt */}
            <FormField
              control={form.control}
              name="buaAreaSqFt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BUA Area (sq ft)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="e.g. 1100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Facilities Area SqFt */}
            <FormField
              control={form.control}
              name="facilitiesAreaSqFt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facilities Area (sq ft)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="e.g. 150" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amenities Area SqFt */}
            <FormField
              control={form.control}
              name="amenitiesAreaSqFt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amenities Area (sq ft)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="e.g. 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Size SqFt (Auto-calculated) */}
            <FormField
              control={form.control}
              name="totalAreaSqFt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Land Area (sq ft)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Auto-calculated"
                      disabled
                      className="bg-muted/50 cursor-not-allowed"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">BUA Area + Facilities Area + Amenities Area</p>
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormLabel className="block mb-2">Property Images</FormLabel>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-2">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative overflow-hidden rounded-lg shadow-md transition-all duration-300",
                      "h-[120px] flex items-center justify-center",
                      pictures[index] ? "border-2 border-primary" : "border-2 border-dashed border-muted-foreground/50",
                      activeImageIndex === index && !pictures[index] && "border-primary border-2 bg-primary/5",
                    )}
                  >
                    {pictures[index] ? (
                      <div className="relative w-full h-full group">
                        <img
                          src={pictures[index]!.preview || "/placeholder.svg"}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
                        />
                        {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-2">
                            <span className="text-white text-xs mb-2 text-center">
                              Uploading... {uploadProgress[index]}%
                            </span>
                            <Progress value={uploadProgress[index]} className="w-full h-2" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => removePicture(index)}
                            disabled={uploadProgress[index] > 0 && uploadProgress[index] < 100}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleImageBoxClick(index)}
                      >
                        {activeImageIndex === index ? (
                          <Upload className="h-10 w-10 text-primary animate-pulse" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                        <span className="text-xs text-muted-foreground mt-1">
                          {activeImageIndex === index ? "Select image" : "Add image"}
                        </span>
                        <input
                          ref={(el) => {
                            fileInputRefs.current[index] = el
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, index)}
                        />
                      </button>
                    )}
                  </div>
                ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Select up to 6 images. All images will be stored in cloud storage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="plotPermission"
              render={({ field }) => (
                <FormItem className="p-4 border rounded-lg shadow-sm">
                  <FormLabel className="text-lg font-medium">Plot Permission</FormLabel>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {plotPermissionOptions.map((permission) => (
                      <FormItem key={permission} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            className="h-5 w-5 rounded-md data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            checked={field.value?.includes(permission)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                if (field.value?.length >= 5) {
                                  setError("You can only select up to 5 permissions.")
                                  return
                                }
                                field.onChange([...field.value, permission])
                              } else {
                                field.onChange(field.value?.filter((value) => value !== permission))
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{permission}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-red-500">{error}</p>}

            <FormField
              control={form.control}
              name="facilitiesCategories"
              render={({ field }) => (
                <FormItem className="p-4 border rounded-lg shadow-sm">
                  <FormLabel className="text-lg font-medium">Facilities Categories</FormLabel>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {facilitiesCategoriesOptions.map((category) => (
                      <FormItem key={category} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            className="h-5 w-5 rounded-md data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            checked={field.value?.includes(category)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, category])
                                : field.onChange(field.value?.filter((value) => value !== category))
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{category}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amentiesCategories"
              render={({ field }) => (
                <FormItem className="p-4 border rounded-lg shadow-sm">
                  <FormLabel className="text-lg font-medium">Amenities Categories</FormLabel>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {amenitiesCategoriesOptions.map((category) => (
                      <FormItem key={category} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            className="h-5 w-5 rounded-md data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            checked={field.value?.includes(category)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, category])
                                : field.onChange(field.value?.filter((value) => value !== category))
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{category}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false)
                // Reset form when modal is closed
                if (!isEditMode) {
                  form.reset(emptyFormValues)
                  setPictures(Array(6).fill(null))
                }
                setImagesToDelete([])
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              {isSubmitting ? "Submitting..." : isEditMode ? "Update Record" : "Add Record"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}
