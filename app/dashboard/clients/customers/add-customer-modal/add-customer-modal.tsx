"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-toastify"
import axios from "axios"
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Customer enums
enum CustomerSegment {
  Supplier = "Supplier",
  Customer = "Customer",
}

enum CustomerCategory {
  Individual = "Individual",
  Organisation = "Organisation",
}

enum CustomerSubCategory {
  Investor = "Investor",
  EndUser = "End User",
}

enum CustomerType {
  Buyer = "Buyer",
  Seller = "Seller",
}

enum CustomerSubType {
  MasterDeveloper = "Master Developer",
  Banks = "Banks",
}

// Define Customer interface
interface Customer {
  _id?: string
  customerSegment: string
  customerCategory: string
  customerSubCategory: string
  customerType: string
  customerSubType: string
  customerBusinessSector?: string
  customerNationality?: string
  customerName?: string
  contactPerson?: string
  customerDepartment?: string
  customerDesignation?: string
  telOffice?: string
  mobile1?: string
  mobile2?: string
  webAddress?: string
  officeLocation?: string
}

const formSchema = z.object({
  customerSegment: z.string().min(1, "Customer segment is required"),
  customerCategory: z.string().min(1, "Customer category is required"),
  customerSubCategory: z.string().min(1, "Customer sub-category is required"),
  customerType: z.string().min(1, "Customer type is required"),
  customerSubType: z.string().min(1, "Customer sub-type is required"),
  customerBusinessSector: z.string().optional(),
  customerNationality: z.string().optional(),
  customerName: z.string().optional(),
  contactPerson: z.string().optional(),
  customerDepartment: z.string().optional(),
  customerDesignation: z.string().optional(),
  telOffice: z.string().optional(),
  mobile1: z.string().optional(),
  mobile2: z.string().optional(),
  webAddress: z.string().optional(),
  officeLocation: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AddCustomerModalProps {
  setIsModalOpen: (open: boolean) => void
  editRecord?: Customer | null
  onRecordSaved?: () => void
}

// Define empty form values
const emptyFormValues: FormValues = {
  customerSegment: "",
  customerCategory: "",
  customerSubCategory: "",
  customerType: "",
  customerSubType: "",
  customerBusinessSector: "",
  customerNationality: "",
  customerName: "",
  contactPerson: "",
  customerDepartment: "",
  customerDesignation: "",
  telOffice: "",
  mobile1: "",
  mobile2: "",
  webAddress: "",
  officeLocation: "",
}

export function AddCustomerModal({ setIsModalOpen, editRecord = null, onRecordSaved }: AddCustomerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!editRecord
  const { data: authData } = useSWR("/api/me", fetcher)

  // Initialize form with empty values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyFormValues,
  })

  // Reset form when edit mode changes
  useEffect(() => {
    if (isEditMode && editRecord) {
      form.reset({
        customerSegment: editRecord.customerSegment || "",
        customerCategory: editRecord.customerCategory || "",
        customerSubCategory: editRecord.customerSubCategory || "",
        customerType: editRecord.customerType || "",
        customerSubType: editRecord.customerSubType || "",
        customerBusinessSector: editRecord.customerBusinessSector || "",
        customerNationality: editRecord.customerNationality || "",
        customerName: editRecord.customerName || "",
        contactPerson: editRecord.contactPerson || "",
        customerDepartment: editRecord.customerDepartment || "",
        customerDesignation: editRecord.customerDesignation || "",
        telOffice: editRecord.telOffice || "",
        mobile1: editRecord.mobile1 || "",
        mobile2: editRecord.mobile2 || "",
        webAddress: editRecord.webAddress || "",
        officeLocation: editRecord.officeLocation || "",
      })
    } else {
      // Reset to empty values for add mode
      form.reset(emptyFormValues)
    }
  }, [editRecord, form, isEditMode])

  // Cleanup effect to reset form when component unmounts
  useEffect(() => {
    return () => {
      // Reset form to empty values
      form.reset(emptyFormValues)
    }
  }, [form])

  const handleCheckChangedFields = () => {
    const currentValues = form.getValues()
    const changedFields: Record<string, any> = {}

    Object.entries(currentValues).forEach(([key, value]) => {
      const editValue = editRecord?.[key as keyof typeof editRecord]
      if (value !== editValue) {
        changedFields[key] = value
      }
    })

    return changedFields
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      if (isEditMode && editRecord) {
        const changedFields = handleCheckChangedFields()

        if (Object.keys(changedFields).length === 0) {
          toast.info("No changes detected")
        } else {
          const response = await axios.patch(
            `${process.env.NEXT_PUBLIC_CMS_SERVER}/customer/${editRecord._id}`,
            changedFields,
            {
              headers: {
                Authorization: `Bearer ${authData?.token}`,
              },
            },
          )
          toast.success("Customer record has been updated successfully")
        }
      } else {
        console.log(data)
        const response = await axios.post(`${process.env.NEXT_PUBLIC_CMS_SERVER}/customer`, data, {
          headers: {
            Authorization: `Bearer ${authData?.token}`,
          },
        })
        console.log(response)
        toast.success("Customer record has been added successfully")
      }

      // Reset form after successful submission
      if (!isEditMode) {
        form.reset(emptyFormValues)
      }

      if (onRecordSaved) {
        onRecordSaved()
      }
      setIsModalOpen(false)
    } catch (error: any) {
      console.error("Error submitting form:", error)
      // Show specific error message from server response
      const errorMessage = error?.response?.data?.message || error?.response?.message || error?.message
      if (error.response?.status === 400) {
        toast.error(errorMessage || "Bad Request: Please check your input data")
      } else if (error.response?.status === 504) {
        toast.error(errorMessage || "Request timed out. Please try again.")
      } else {
        toast.error(errorMessage || `Failed to ${isEditMode ? "update" : "add"} record. Please try again.`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">{isEditMode ? "Edit Customer" : "Add Customer"}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Required Dropdown Fields */}
          <div className="p-4 border rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Required Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="customerSegment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Segment *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select segment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CustomerSegment).map((segment) => (
                          <SelectItem key={segment} value={segment}>
                            {segment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CustomerCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerSubCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Sub-Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sub-category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CustomerSubCategory).map((subCategory) => (
                          <SelectItem key={subCategory} value={subCategory}>
                            {subCategory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CustomerType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerSubType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Sub-Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sub-type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CustomerSubType).map((subType) => (
                          <SelectItem key={subType} value={subType}>
                            {subType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="p-4 border rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Additional Information (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerBusinessSector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Sector</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Real Estate, Technology" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerNationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. UAE, Indian, British" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact person name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerDepartment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sales, Marketing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerDesignation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Manager, Director" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telOffice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Office Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. +971-4-1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile 1</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. +971-50-1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile 2</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. +971-55-1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="webAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. www.example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="officeLocation"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Office Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full office address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                }
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
