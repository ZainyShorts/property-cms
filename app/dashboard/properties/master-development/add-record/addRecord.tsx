"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, ImageIcon, Upload } from "lucide-react"
import { toast } from "react-toastify" 
import axios from "axios"
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { MasterDevelopment } from "../page"
import { Progress } from "@/components/ui/progress"

const formSchema = z.object({
  roadLocation: z.string().min(1, "Road location is required"),
  developmentName: z.string().min(1, "Development name is required"),
  locationQuality: z.string().min(1, "Location quality is required"),
  buaAreaSqFt: z.coerce.number().nonnegative("Value cannot be negative").min(1, "BUA area is required"),
  facilitiesAreaSqFt: z.coerce.number().nonnegative("Value cannot be negative").min(1, "Facilities area is required"),
  amentiesAreaSqFt: z.coerce.number().nonnegative("Value cannot be negative").min(1, "Amenities area is required"),
  totalAreaSqFt: z.coerce.number().nonnegative("Value cannot be negative").min(1, "Total area is required"),
  facilitiesCategories: z.array(z.string()).min(1, "Select at least one facility category"),
  amentiesCategories: z.array(z.string()).min(1, "Select at least one amenity category"),
  pictures: z.array(z.any()).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AddRecordModalProps {
  setIsModalOpen: (open: boolean) => void
  editRecord?: MasterDevelopment | null
  onRecordSaved?: () => void
}

interface ImageData {
  file: File
  preview: string
  awsUrl?: string
  awsKey?: string
  isExisting?: boolean
}

export function AddRecordModal({ setIsModalOpen, editRecord = null, onRecordSaved }: AddRecordModalProps) {
  const [pictures, setPictures] = useState<Array<ImageData | null>>(Array(6).fill(null))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Array<number>>(Array(6).fill(0))
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null))
  const isEditMode = !!editRecord

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roadLocation: editRecord?.roadLocation || "",
      developmentName: editRecord?.developmentName || "",
      locationQuality: editRecord?.locationQuality || "",
      buaAreaSqFt: editRecord?.buaAreaSqFt || 0,
      facilitiesAreaSqFt: editRecord?.facilitiesAreaSqFt || 0,
      amentiesAreaSqFt: editRecord?.amentiesAreaSqFt || 0,
      totalAreaSqFt: editRecord?.totalAreaSqFt || 0,
      facilitiesCategories: editRecord?.facilitiesCategories || [],
      amentiesCategories: editRecord?.amentiesCategories || [],
      pictures: [],
    },
  })

  useEffect(() => {
    if (editRecord) {
      form.reset({
        roadLocation: editRecord.roadLocation || "",
        developmentName: editRecord.developmentName || "",
        locationQuality: editRecord.locationQuality || "",
        buaAreaSqFt: editRecord.buaAreaSqFt || 0,
        facilitiesAreaSqFt: editRecord.facilitiesAreaSqFt || 0,
        amentiesAreaSqFt: editRecord.amentiesAreaSqFt || 0,
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
              isExisting: true
            }
          }
        })
        setPictures(newPictures)
      }
    } else {
      form.reset({
        roadLocation: "",
        developmentName: "",
        locationQuality: "",
        buaAreaSqFt: 0,
        facilitiesAreaSqFt: 0,
        amentiesAreaSqFt: 0,
        totalAreaSqFt: 0,
        facilitiesCategories: [],
        amentiesCategories: [],
        pictures: [],
      })
      setPictures(Array(6).fill(null))
    }
  }, [editRecord, form])

  const buaAreaSqFt = useWatch({
    control: form.control,
    name: "buaAreaSqFt",
    defaultValue: editRecord?.buaAreaSqFt || 0,
  })

  const facilitiesAreaSqFt = useWatch({
    control: form.control,
    name: "facilitiesAreaSqFt",
    defaultValue: editRecord?.facilitiesAreaSqFt || 0,
  })

  const amentiesAreaSqFt = useWatch({
    control: form.control,
    name: "amentiesAreaSqFt",
    defaultValue: editRecord?.amentiesAreaSqFt || 0,
  })

  const handleCheckChangedFields = () => {
    const currentValues = form.getValues()
    const changedFields: Record<string, any> = {}
    
    Object.entries(currentValues).forEach(([key, value]) => {
      if (key === 'pictures') return

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

    const currentPictures = pictures
      .filter(pic => pic !== null)
      .map(pic => pic?.awsUrl || pic?.preview)
    
    const originalPictures = editRecord?.pictures || []
    
    if (JSON.stringify(currentPictures) !== JSON.stringify(originalPictures)) {
      changedFields.pictures = currentPictures
    }

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
            setUploadProgress(prev => {
              const newProgress = [...prev]
              newProgress[index] = progress
              return newProgress
            })
          }
        },
      })

      return {
        awsUrl: signedUrl.split("?")[0],
        key: response.data.msg.key
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      throw new Error("Failed to upload file")
    }
  }

  const deleteFromAWS = async (filename: string): Promise<void> => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_PLUDO_SERVER}/aws/${filename}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
    } catch (error) {
      console.error("Error deleting file:", error)
      throw new Error("Failed to delete file")
    }
  }

  useEffect(() => {
    const totalArea = Number(buaAreaSqFt || 0) + Number(facilitiesAreaSqFt || 0) + Number(amentiesAreaSqFt || 0)
    form.setValue("totalAreaSqFt", totalArea)
  }, [buaAreaSqFt, facilitiesAreaSqFt, amentiesAreaSqFt, form])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const newPictures = [...pictures]
      
      // Create local preview
      newPictures[index] = {
        file,
        preview: URL.createObjectURL(file)
      }
      
      setPictures(newPictures)
      setActiveImageIndex(null)
    }
  }

  const removePicture = async (index: number) => {
    const image = pictures[index]
    if (!image) return

    try {
      if (image.isExisting && image.awsUrl) {
        const filename = image.awsUrl.split('/').pop()
        if (filename) {
          await deleteFromAWS(filename)
          toast.success("Image deleted from cloud storage")
        }
      }

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

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const uploadPromises = pictures.map(async (pic, index) => {
        if (pic && !pic.isExisting && pic.file) {
          try {
            const result = await uploadImageToAWS(pic.file, index)
            return { ...pic, ...result }
          } catch (error) {
            console.error(`Failed to upload image ${index}:`, error)
            return null
          }
        }
        return pic
      })

      const uploadedPictures = await Promise.all(uploadPromises)

      const submitData = {
        ...data,
        pictures: uploadedPictures
          .filter((pic): pic is NonNullable<typeof pic> => pic !== null)
          .map(pic => pic.awsUrl)
      }

      if (isEditMode && editRecord) {
        const changedFields = handleCheckChangedFields()
        
        if (Object.keys(changedFields).length === 0) {
          toast.info("No changes detected")
        } else {
          const response = await axios.patch(
            `${process.env.NEXT_PUBLIC_CMS_SERVER}/masterDevelopment/updateSingleRecord/${editRecord._id}`,
            changedFields
          )
          toast.success("Master development record has been updated successfully")
        }
      } else {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_CMS_SERVER}/masterDevelopment/addSingleRecord`,
          submitData
        )
        toast.success("Master development record has been added successfully")
      }

      if (onRecordSaved) {
        onRecordSaved()
      }
      setIsModalOpen(false)
    } catch (error: any) {
      console.error("Error submitting form:", error)
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Bad Request: Please check your input data")
      }  
     else if (error.response?.status === 504) {
        toast.error(error.response.data.message || "Bad Request")
      } 
      else {
        toast.error(`Failed to ${isEditMode ? "update" : "add"} record. Please try again.`)
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
    "Public Transport"
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
    "Community Recycling Points"
  ]

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">
          {isEditMode ? "Edit Master Development" : "Add Master Development"}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="roadLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Road Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Al Barsha South" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="developmentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Development Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Heights" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationQuality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Quality</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality grade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buaAreaSqFt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BUA Area (sq ft)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="e.g. 120000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="facilitiesAreaSqFt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facilities Area (sq ft)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="e.g. 25000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amentiesAreaSqFt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amenities Area (sq ft)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="e.g. 30000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalAreaSqFt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Area (sq ft)</FormLabel>
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
                            <Progress 
                              value={uploadProgress[index]} 
                              className="w-full h-2" 
                            />
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
            <p className="text-xs text-muted-foreground">Select up to 6 images. All images will be stored in cloud storage.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
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