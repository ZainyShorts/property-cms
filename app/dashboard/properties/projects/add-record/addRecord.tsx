"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { X, ImageIcon, Upload, CalendarIcon } from "lucide-react"
import { toast } from "react-toastify"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

enum SalesStatus {
   PRIMARY = 'Primary',
  PEDING = 'Pending',
  RESALE = 'Resale',
  PRIMARY_RESALE = 'Primary Resale',
  OFF_PLANN_RESALE = 'Off Plan Resale',
  PRIMARYPLUSOFFPLANRESALE = 'Primary + Off Plan Resale',
}

enum PlotPermission {
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

const plotStatusOptions = ["Vacant", "Under Construction", "Ready", "Pending"]

interface FormValues {
  // Project Details
  masterDevelopment?: string
  subDevelopment?: string
  propertyType: string
  projectName: string
  projectQuality: string

  // Construction & Sales
  constructionStatus: number | string
  launchDate: Date | undefined
  completionDate: Date | undefined
  salesStatus: string
  downPayment: number | string
  height?: number | string
  commission?: number | string
  duringConstruction?: number | string
  percentOfConstruction: number | string
  installmentDate: Date | undefined
  uponCompletion: Date | undefined
  postHandOver: Date | undefined

  // Unit Counts

  facilityCategories: string[]
  amenitiesCategories: string[]
  pictures: any[]

  plotNumber?: string
  plotHeight?: string
  plotSizeSqFt?: string
  plotStatus?: string
  plotBUASqFt?: string
  plotPermission?: string[]
  buaAreaSqFt?: string
}

interface RecordModalProps {
  setIsModalOpen: (open: boolean) => void
  editRecord?: any | null
  open: boolean
  onRecordSaved?: () => void
  onRecordUpdated?: () => void
  onOpenChange?: (open: boolean) => void
  multiStepFormData?: {
    masterDevelopmentId: string
    masterDevelopmentName: string
    subDevelopmentName: string
    subDevelopmentId?: string
    plot: any
  } | null
}

interface ImageData {
  file: File
  preview: string
  awsUrl?: string
  awsKey?: string
  isExisting?: boolean
}

export function AddRecordModal({
  open,
  setIsModalOpen,
  editRecord = null,
  onRecordSaved,
  onRecordUpdated,
  onOpenChange,
  multiStepFormData = null,
}: RecordModalProps) {
  const [pictures, setPictures] = useState<Array<ImageData | null>>(Array(6).fill(null))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Array<number>>(Array(6).fill(0))
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null))
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false)
  const [plotDetails, setPlotDetails] = useState<any>(null)

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      masterDevelopment: multiStepFormData?.masterDevelopmentId || "",
      subDevelopment: multiStepFormData?.subDevelopmentId || "",
      propertyType: "",
      projectName: "",
      projectQuality: "",
      constructionStatus: null,
      launchDate: undefined,
      completionDate: undefined,
      salesStatus: SalesStatus.PRIMARY,
      downPayment: null,
      height: "",
      commission: "",
      duringConstruction: "",
      percentOfConstruction: null,
      uponCompletion: undefined,
      postHandOver: undefined,
      facilityCategories: [],
      amenitiesCategories: [],
      pictures: [],
    },
  })

  useEffect(() => {
    if (multiStepFormData) {
      setValue("masterDevelopment", multiStepFormData.masterDevelopmentId || "")

      if (multiStepFormData.subDevelopmentId) {
        setValue("subDevelopment", multiStepFormData.subDevelopmentId)
      }

      if (multiStepFormData.plot) {
        if (multiStepFormData.plot.plotNumber) {
          setValue("plotNumber", multiStepFormData.plot.plotNumber)
        }
        if (multiStepFormData.plot.plotStatus) {
          setValue("plotStatus", multiStepFormData.plot.plotStatus)
        }
        if (multiStepFormData.plot.plotHeight) {
          setValue("plotHeight", multiStepFormData.plot.plotHeight)
        }
        if (multiStepFormData.plot.plotPermission) {
          setValue("plotPermission", multiStepFormData.plot.plotPermission)
        }
        if (multiStepFormData.plot.plotSizeSqFt) {
          setValue("plotSizeSqFt", multiStepFormData.plot.plotSizeSqFt)
        }
        if (multiStepFormData.plot.plotBUASqFt) {
          setValue("plotBUASqFt", multiStepFormData.plot.plotBUASqFt)
        }
        if (multiStepFormData.plot.buaAreaSqFt) {
          setValue("buaAreaSqFt", multiStepFormData.plot.buaAreaSqFt)
        }
      }
    }
  }, [multiStepFormData, setValue])

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
  useEffect(() => {
  return () => { 
    console.log('call');
    reset({
      masterDevelopment: "",
      subDevelopment: "",
      propertyType: "",
      projectName: "",
      projectQuality: "",
      constructionStatus: null,
      launchDate: undefined,
      completionDate: undefined,
      salesStatus: SalesStatus.PRIMARY,
      downPayment: null,
      height: "",
      commission: "",
      duringConstruction: "",
      percentOfConstruction: null,
      uponCompletion: undefined,
      postHandOver: undefined,
      facilityCategories: [],
      amenitiesCategories: [],
      pictures: [],
    });
  };
}, [])


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const newPictures = [...pictures]

      newPictures[index] = {
        file,
        preview: URL.createObjectURL(file),
        isExisting: false,
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

      const newPictures = [...pictures]
      newPictures[index] = null
      setPictures(newPictures)
    } catch (error) {
      toast.error("Failed to delete image")
      console.error("Error removing picture:", error)
    }
  }

  const handleImageBoxClick = (index: number) => {
    setActiveImageIndex(index)
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.click()
    }
  }

  // Detect edit mode and load data
  useEffect(() => {
    if (open) {
      const isEditing = !!editRecord && Object.keys(editRecord).length > 0
      setIsEditMode(isEditing)
    }
  }, [open, editRecord])

  // Remove this line:
  // const hasPopulatedRef = useRef(false)

  // Replace the useEffect that uses hasPopulatedRef with this:
  useEffect(() => {
    if (editRecord && Object.keys(editRecord).length > 0 && open) {
      // Reset the form with the editRecord data
      setValue(
        "masterDevelopment",
        typeof editRecord.masterDevelopment === "object" && editRecord.masterDevelopment?._id
          ? editRecord.masterDevelopment._id
          : editRecord.masterDevelopment || "",
      )
      setValue("propertyType", editRecord.propertyType || "Apartment")
      setValue("projectName", editRecord.projectName || "")
      setValue("projectQuality", editRecord.projectQuality || "B")

      setValue("constructionStatus", editRecord.constructionStatus || 20)
      setValue("percentOfConstruction", editRecord.percentOfConstruction || 50)

      // Handle dates
      if (editRecord.launchDate) {
        setValue("launchDate", new Date(editRecord.launchDate))
      }
      if (editRecord.completionDate) {
        setValue("completionDate", new Date(editRecord.completionDate))
      }
     
      if (editRecord.uponCompletion) {
        setValue("uponCompletion", new Date(editRecord.uponCompletion))
      }
      if (editRecord.postHandOver) {
        setValue("postHandOver", new Date(editRecord.postHandOver))
      }

      setValue("salesStatus", editRecord.salesStatus || SalesStatus.PRIMARY)
      setValue("downPayment", editRecord.downPayment || 10)
      setValue("height", editRecord.height || "")
      setValue("commission", editRecord.commission || "")
      setValue("duringConstruction", editRecord.duringConstruction || "")

      // Categories
      setValue("facilityCategories", editRecord.facilityCategories || [])
      setValue("amenitiesCategories", editRecord.amenitiesCategories || [])

      // Handle existing images if any
      if (editRecord.pictures && editRecord.pictures.length > 0) {
        const newPictures = Array(6).fill(null)
        editRecord.pictures.forEach((url: string, index: number) => {
          if (index < 6) {
            newPictures[index] = {
              preview: url,
              awsUrl: url,
              isExisting: true,
            }
          }
        })
        setPictures(newPictures)
      }
    }
  }, [editRecord, setValue, open])

  // Reset the hasPopulatedRef when the modal closes
  // useEffect(() => {
  //   if (!open) {
  //     hasPopulatedRef.current = false
  //   }
  // }, [open])

  useEffect(() => {
    if (editRecord?.plot) {
      setPlotDetails(editRecord.plot)
    }
  }, [editRecord])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) { 
      console.log('hello');
      // Reset form fields
      reset({
        masterDevelopment: multiStepFormData?.masterDevelopmentId || "",
        subDevelopment: multiStepFormData?.subDevelopmentId || "",
        propertyType: "",
        projectName: "",
        projectQuality: "",
        constructionStatus: 0,
        launchDate: undefined,
        completionDate: undefined,
        salesStatus: SalesStatus.PRIMARY,
        downPayment: 0,
        height: "",
        commission: "",
        duringConstruction: "",
        percentOfConstruction: 0,
        uponCompletion: undefined,
        postHandOver: undefined,
        facilityCategories: [],
        amenitiesCategories: [],
        pictures: [],
      })

      // Reset pictures state
      setPictures(Array(6).fill(null))

      // Reset upload progress
      setUploadProgress(Array(6).fill(0))

      // Reset active image index
      setActiveImageIndex(null)

      // Reset plot details if any
      setPlotDetails(null)

      // Reset edit mode
      setIsEditMode(false)
    }
  }, [open, reset, multiStepFormData])

  const handlePlotDetailsSubmit = (updatedPlotDetails: any) => {
    // Update the editRecord.plot with the new values
    if (editRecord) {
      editRecord.plot = { ...updatedPlotDetails }
    }
    setPlotDetails(updatedPlotDetails)
    setIsPlotModalOpen(false)
  }
 const convertEmptyToZero = (value: any) => {
        if (value === "") return 0
        return value
      }
  const onSubmit = async (data: any) => {
    console.log(`Form submission started for ${isEditMode ? "edit" : "create"}`)
    setIsSubmitting(true)

    try {
      const uploadPromises = pictures.map(async (pic, index) => {
        if (pic) {
          if (pic.file && !pic.isExisting) {
            try {
              const { awsUrl, key } = await uploadImageToAWS(pic.file, index)
              return { ...pic, awsUrl, awsKey: key }
            } catch (error) {
              console.error(`Failed to upload image ${index}:`, error)
              return null
            }
          } else if (pic.awsUrl) {
            return pic
          }
        }
        return pic
      })

      const uploadedPictures = await Promise.all(uploadPromises)

      const pictureUrls = uploadedPictures
        .filter((pic): pic is NonNullable<typeof pic> => pic !== null)
        .map((pic) => pic.awsUrl)

      const formatDateForAPI = (date: Date | undefined) => {
        return date ? format(date, "yyyy-MM-dd") : undefined
      }

      // Base data for API submission
      const submitData: any = {
        masterDevelopment: data.masterDevelopment,
        propertyType: data.propertyType,
        projectName: data.projectName,
        projectQuality: data.projectQuality,

        constructionStatus: data.constructionStatus,
        launchDate: formatDateForAPI(data.launchDate),
        completionDate: formatDateForAPI(data.completionDate),
        salesStatus: data.salesStatus,
        downPayment: data.downPayment,
        height: convertEmptyToZero(data.height),
        commission: convertEmptyToZero(data.commission),
        duringConstruction: convertEmptyToZero(data.duringConstruction),
        percentOfConstruction: data.percentOfConstruction,
        uponCompletion: formatDateForAPI(data.uponCompletion),
        postHandOver: formatDateForAPI(data.postHandOver),
        facilityCategories: data.facilityCategories,
        amenitiesCategories: data.amenitiesCategories,
        pictures: pictureUrls,
      }

      // Convert empty strings to 0 for numeric fields
     

      // Update submitData for numeric fields

      submitData.constructionStatus = convertEmptyToZero(data.constructionStatus)
      submitData.downPayment = convertEmptyToZero(data.downPayment)
      submitData.percentOfConstruction = convertEmptyToZero(data.percentOfConstruction)

      // Handle subDevelopment (optional)
      if (data.subDevelopment) {
        submitData.subDevelopment = data.subDevelopment
      } else if (isEditMode && editRecord?.subDevelopment) {
        submitData.subDevelopment = editRecord.subDevelopment
      } else if (multiStepFormData?.subDevelopmentId) {
        submitData.subDevelopment = multiStepFormData.subDevelopmentId
      }
      console.log("edit", editRecord)

      if (isEditMode && editRecord?.plot) {
        submitData.plot = plotDetails || editRecord.plot
        console.log("Using plot from editRecord:", submitData.plot)
      } else if (multiStepFormData?.plot) {
        submitData.plot = multiStepFormData.plot
        console.log("Using plot from multiStepFormData:", multiStepFormData.plot)
      }

      console.log(`Submitting data to API for ${isEditMode ? "update" : "create"}:`, submitData)

      let response

      if (isEditMode) {
        // Update existing record
        response = await axios.patch(`${process.env.NEXT_PUBLIC_CMS_SERVER}/project/${editRecord._id}`, submitData)
        toast.success("Project record has been updated successfully")

        if (onRecordUpdated) {
          onRecordUpdated()
        }
      } else {
        // Create new record
        response = await axios.post(`${process.env.NEXT_PUBLIC_CMS_SERVER}/project`, submitData)
        toast.success("Project record has been added successfully")

        if (onRecordSaved) {
          onRecordSaved()
        }
      }

      console.log("API response:", response)

      // Reset form after successful submission
      reset({
        masterDevelopment: multiStepFormData?.masterDevelopmentId || "",
        subDevelopment: multiStepFormData?.subDevelopmentId || "",
        propertyType: "Apartment",
        projectName: "",
        projectQuality: "B",
        constructionStatus: 20,
        launchDate: undefined,
        completionDate: undefined,
        salesStatus: SalesStatus.PRIMARY,
        downPayment: 10,
        height: "",
        commission: "",
        duringConstruction: "",
        percentOfConstruction: 50,
        uponCompletion: undefined,
        postHandOver: undefined,
        facilityCategories: [],
        amenitiesCategories: [],
        pictures: [],
      })

      // Reset pictures state
      setPictures(Array(6).fill(null))

      // Reset upload progress
      setUploadProgress(Array(6).fill(0))

      // Reset active image index
      setActiveImageIndex(null)

      // Reset plot details if any
      setPlotDetails(null)

      setIsModalOpen(false)
    } catch (error: any) {
      console.error(`Error ${isEditMode ? "updating" : "submitting"} form:`, error)
      if (error.response?.data?.statusCode === 400) {
        toast.error(error.response.data.message || "Bad Request: Please check your input data")
      } else if (error.response?.data?.statusCode === 504) {
        toast.error("Request timed out. Please try again.")
      } else if (error.response?.data?.statusCode === 409) {
        toast.error(error.response.data.message)
      } else {
        toast.error(`Failed to ${isEditMode ? "update" : "add"} record. Please try again.`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const facilitiesCategoriesOptions = [
    "Gym",
    "Swimming Pool",
    "Parking",
    "Shops",
    "School",
    "Petrol Pump",
    "Hospitals",
    "Clinics",
    "Malls",
    "Public Transport",
  ]

  const amenitiesCategoriesOptions = [
    "Play Area",
    "BBQ Area",
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

  const propertyTypeOptions = [
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

  const salesStatusOptions = Object.values(SalesStatus)

  return (
    <Dialog open={open} onOpenChange={onOpenChange || setIsModalOpen}>
      <DialogContent className="max-w-3xl h-auto  max-h-[90vh] overflow-y-auto pb-4 ">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{isEditMode ? "Edit Project" : "Add Project"}</DialogTitle>
        </DialogHeader>

        {isEditMode && editRecord?.plot && (
          <div className="mb-4">
            <Button
              onClick={() => setIsPlotModalOpen(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Edit Plot Details
            </Button>
          </div>
        )}

        {isPlotModalOpen && (
          <Dialog open={isPlotModalOpen} onOpenChange={setIsPlotModalOpen}>
            <DialogContent className="sm:max-w-[500px] max-h-[70vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Edit Plot Details</DialogTitle>
              </DialogHeader>

              <PlotDetailsForm
                initialData={plotDetails}
                onSubmit={handlePlotDetailsSubmit}
                onCancel={() => setIsPlotModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
          {/* Project Details Section */}
          <div className="p-4 border rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Project Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="masterDevelopment"
                control={control}
                rules={{ required: "Master development is required" }}
                render={({ field }) => <Input type="hidden" {...field} />}
              />
              {errors.masterDevelopment && (
                <p className="text-sm text-destructive">{errors.masterDevelopment.message}</p>
              )}

              <div className="space-y-2">
                <label htmlFor="propertyType" className="text-sm font-medium">
                  Property Type *
                </label>
                <Controller
                  name="propertyType"
                  control={control}
                  rules={{ required: "Property type is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="propertyType">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.propertyType && <p className="text-sm text-destructive">{errors.propertyType.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="projectName" className="text-sm font-medium">
                  Project Name *
                </label>
                <Controller
                  name="projectName"
                  control={control}
                  rules={{ required: "Project name is required" }}
                  render={({ field }) => <Input id="projectName" placeholder="Project Name" {...field} />}
                />
                {errors.projectName && <p className="text-sm text-destructive">{errors.projectName.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="projectQuality" className="text-sm font-medium">
                  Project Quality *
                </label>
                <Controller
                  name="projectQuality"
                  control={control}
                  rules={{ required: "Project quality is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="projectQuality">
                        <SelectValue placeholder="Select quality grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.projectQuality && <p className="text-sm text-destructive">{errors.projectQuality.message}</p>}
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Construction & Sales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="constructionStatus" className="text-sm font-medium">
                  Construction Status (%) *
                </label>
                <Controller
                  name="constructionStatus"
                  control={control}
                  rules={{
                    required: "Construction status is required",
                    min: { value: 0, message: "Must be at least 0%" },
                    max: { value: 100, message: "Must be at most 100%" },
                  }}
                  render={({ field }) => (
                    <Input
                      type="text"
                      inputMode="numeric"
                      id="constructionStatus"
                      placeholder="e.g. 50"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? "" : Number(value))
                      }}
                    />
                  )}
                />
                {errors.constructionStatus && (
                  <p className="text-sm text-destructive">{errors.constructionStatus.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="percentOfConstruction" className="text-sm font-medium">
                  Percent of Construction (%) *
                </label>
                <Controller
                  name="percentOfConstruction"
                  control={control}
                  rules={{
                    required: "Percent of construction is required",
                    min: { value: 0, message: "Must be at least 0%" },
                    max: { value: 100, message: "Must be at most 100%" },
                  }}
                  render={({ field }) => (
                    <Input
                      type="text"
                      inputMode="numeric"
                      id="percentOfConstruction"
                      placeholder="e.g. 50"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? "" : Number(value))
                      }}
                    />
                  )}
                />
                {errors.percentOfConstruction && (
                  <p className="text-sm text-destructive">{errors.percentOfConstruction.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="launchDate" className="text-sm font-medium">
                  Launch Date *
                </label>
                <Controller
                  name="launchDate"
                  control={control}
                  rules={{ required: "Launch date is required" }}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.launchDate && <p className="text-sm text-destructive">{errors.launchDate.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="completionDate" className="text-sm font-medium">
                  Completion Date *
                </label>
                <Controller
                  name="completionDate"
                  control={control}
                  rules={{ required: "Completion date is required" }}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.completionDate && <p className="text-sm text-destructive">{errors.completionDate.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="salesStatus" className="text-sm font-medium">
                  Sales Status *
                </label>
                <Controller
                  name="salesStatus"
                  control={control}
                  rules={{ required: "Sales status is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="salesStatus">
                        <SelectValue placeholder="Select sales status" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.salesStatus && <p className="text-sm text-destructive">{errors.salesStatus.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="downPayment" className="text-sm font-medium">
                  Down Payment (%) *
                </label>
                <Controller
                  name="downPayment"
                  control={control}
                  rules={{
                    required: "Down payment is required",
                    min: { value: 0, message: "Must be at least 0%" },
                    max: { value: 100, message: "Must be at most 100%" },
                  }}
                  render={({ field }) => (
                    <Input
                      type="text"
                      inputMode="numeric"
                      id="downPayment"
                      placeholder="e.g. 10"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? "" : Number(value))
                      }}
                    />
                  )}
                />
                {errors.downPayment && <p className="text-sm text-destructive">{errors.downPayment.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="height" className="text-sm font-medium">
                  Height (m) *
                </label>
                <Controller
                  name="height"
                  control={control}
                  rules={{
                    required: "Height is required",
                  }}
                  render={({ field }) => (
                    <Input
                      type="text"
                      inputMode="numeric"
                      id="height"
                      placeholder="e.g. 10"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? "" : Number(value))
                      }}
                    />
                  )}
                />
                {errors.height && <p className="text-sm text-destructive">{errors.height.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="commission" className="text-sm font-medium">
                  Commission (%) *
                </label>
                <Controller
                  name="commission"
                  control={control}
                  rules={{
                    required: "Commission is required",
                    min: { value: 0, message: "Must be at least 0%" },
                    max: { value: 100, message: "Must be at most 100%" },
                  }}
                  render={({ field }) => (
                    <Input
                      type="text"
                      inputMode="numeric"
                      id="commission"
                      placeholder="e.g. 5"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? "" : Number(value))
                      }}
                    />
                  )}
                />
                {errors.commission && <p className="text-sm text-destructive">{errors.commission.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="duringConstruction" className="text-sm font-medium">
                  During Construction (%) *
                </label>
                <Controller
                  name="duringConstruction"
                  control={control}
                  rules={{
                    required: "During construction value is required",
                    min: { value: 0, message: "Must be at least 0%" },
                    max: { value: 100, message: "Must be at most 100%" },
                  }}
                  render={({ field }) => (
                    <Input
                      type="text"
                      inputMode="numeric"
                      id="duringConstruction"
                      placeholder="e.g. 30"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? "" : Number(value))
                      }}
                    />
                  )}
                />
                {errors.duringConstruction && (
                  <p className="text-sm text-destructive">{errors.duringConstruction.message}</p>
                )}
              </div>

            

              <div className="space-y-2">
                <label htmlFor="uponCompletion" className="text-sm font-medium">
                  Upon Completion Date *
                </label>
                <Controller
                  name="uponCompletion"
                  control={control}
                  rules={{ required: "Upon completion date is required" }}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.uponCompletion && <p className="text-sm text-destructive">{errors.uponCompletion.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="postHandOver" className="text-sm font-medium">
                  Post Handover Date *
                </label>
                <Controller
                  name="postHandOver"
                  control={control}
                  rules={{ required: "Post handover date is required" }}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.postHandOver && <p className="text-sm text-destructive">{errors.postHandOver.message}</p>}
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg shadow-sm">
            <label className="block mb-2 text-lg font-semibold">Project Images</label>
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
          <div className="p-4 border rounded-lg shadow-sm">
            <label className="text-lg font-medium">Amenities Categories *</label>
            <div className="grid grid-cols-2 gap-3 mt-3  overflow-y-auto pr-2">
              <Controller
                name="amenitiesCategories"
                control={control}
                render={({ field }) => (
                  <>
                    {amenitiesCategoriesOptions.map((category) => (
                      <div key={category} className="flex flex-row  items-start space-x-3 space-y-0">
                        <Checkbox
                          id={`amenity-${category}`}
                          className="h-5 w-5 rounded-md data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          checked={field.value.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, category])
                            } else {
                              field.onChange(field.value.filter((value: string) => value !== category))
                            }
                          }}
                        />
                        <label htmlFor={`amenity-${category}`} className="font-normal">
                          {category}
                        </label>
                      </div>
                    ))}
                  </>
                )}
              />
            </div>
            {errors.amenitiesCategories && (
              <p className="text-sm text-destructive">{errors.amenitiesCategories.message}</p>
            )}
          </div>
          <div className="p-4 border rounded-lg shadow-sm">
            <label className="text-lg font-medium">Facilities Categories *</label>
            <div className="grid grid-cols-2 gap-3 mt-3  overflow-y-auto pr-2">
              <Controller
                name="facilityCategories"
                control={control}
                render={({ field }) => (
                  <>
                    {facilitiesCategoriesOptions.map((category) => (
                      <div key={category} className="flex flex-row items-start space-x-3 space-y-0">
                        <Checkbox
                          id={`facility-${category}`}
                          className="h-5 w-5 rounded-md data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          checked={field.value.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, category])
                            } else {
                              field.onChange(field.value.filter((value: string) => value !== category))
                            }
                          }}
                        />
                        <label htmlFor={`facility-${category}`} className="font-normal">
                          {category}
                        </label>
                      </div>
                    ))}
                  </>
                )}
              />
            </div>
            {errors.facilityCategories && (
              <p className="text-sm text-destructive">{errors.facilityCategories.message}</p>
            )}
          </div>

          <DialogFooter className="mt-6 pt-0">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Submitting..."
                : isEditMode
                  ? "Update Project"
                  : "Add Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface PlotDetailsFormProps {
  initialData: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

function PlotDetailsForm({ initialData, onSubmit, onCancel }: PlotDetailsFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      plotNumber: initialData?.plotNumber || "",
      plotHeight: initialData?.plotHeight || "",
      plotSizeSqFt: initialData?.plotSizeSqFt || "",
      plotStatus: initialData?.plotStatus || "Vacant",
      plotBUASqFt: initialData?.plotBUASqFt || "",
      plotPermission: initialData?.plotPermission || [],
      buaAreaSqFt: initialData?.buaAreaSqFt || "",
    },
  })

  const onFormSubmit = (data: any) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="plotNumber" className="text-sm font-medium">
            Plot Number *
          </label>
          <Controller
            name="plotNumber"
            control={control}
            rules={{ required: "Plot number is required" }}
            render={({ field }) => <Input id="plotNumber" placeholder="Plot Number" {...field} />}
          />
          {errors.plotNumber && <p className="text-sm text-destructive">{errors.plotNumber.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="plotHeight" className="text-sm font-medium">
            Plot Height *
          </label>
          <Controller
            name="plotHeight"
            control={control}
            rules={{ required: "Plot height is required" }}
            render={({ field }) => <Input id="plotHeight" placeholder="Plot Height" {...field} />}
          />
          {errors.plotHeight && <p className="text-sm text-destructive">{errors.plotHeight.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="plotSizeSqFt" className="text-sm font-medium">
            Plot Size (Sq Ft) *
          </label>
          <Controller
            name="plotSizeSqFt"
            control={control}
            rules={{ required: "Plot size is required" }}
            render={({ field }) => <Input id="plotSizeSqFt" placeholder="Plot Size" {...field} />}
          />
          {errors.plotSizeSqFt && <p className="text-sm text-destructive">{errors.plotSizeSqFt.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="plotBUASqFt" className="text-sm font-medium">
            Plot BUA (Sq Ft) *
          </label>
          <Controller
            name="plotBUASqFt"
            control={control}
            rules={{ required: "Plot BUA is required" }}
            render={({ field }) => <Input id="plotBUASqFt" placeholder="Plot BUA" {...field} />}
          />
          {errors.plotBUASqFt && <p className="text-sm text-destructive">{errors.plotBUASqFt.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="buaAreaSqFt" className="text-sm font-medium">
            BUA Area (Sq Ft) *
          </label>
          <Controller
            name="buaAreaSqFt"
            control={control}
            rules={{ required: "BUA area is required" }}
            render={({ field }) => <Input id="buaAreaSqFt" placeholder="BUA Area" {...field} />}
          />
          {errors.buaAreaSqFt && <p className="text-sm text-destructive">{errors.buaAreaSqFt.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="plotStatus" className="text-sm font-medium">
            Plot Status *
          </label>
          <Controller
            name="plotStatus"
            control={control}
            rules={{ required: "Plot status is required" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="plotStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {plotStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.plotStatus && <p className="text-sm text-destructive">{errors.plotStatus.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Plot Permission *</label>
        <div className="grid grid-cols-3 gap-2 max-h-[120px] overflow-y-auto pr-2">
          <Controller
            name="plotPermission"
            control={control}
            rules={{ required: "At least one permission is required" }}
            render={({ field }) => (
              <>
                {Object.values(PlotPermission).map((permission) => (
                  <div key={permission} className="flex flex-row items-start space-x-3 space-y-0">
                    <Checkbox
                      id={`permission-${permission}`}
                      className="h-5 w-5 rounded-md data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      checked={field.value?.includes(permission)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...(field.value || []), permission])
                        } else {
                          field.onChange((field.value || []).filter((value: string) => value !== permission))
                        }
                      }}
                    />
                    <label htmlFor={`permission-${permission}`} className="font-normal">
                      {permission}
                    </label>
                  </div>
                ))}
              </>
            )}
          />
        </div>
        {errors.plotPermission && <p className="text-sm text-destructive">{errors.plotPermission.message}</p>}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">OK</Button>
      </DialogFooter>
    </form>
  )
}
