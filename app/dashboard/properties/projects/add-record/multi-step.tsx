"use client"

import { useState, useEffect } from "react"
import { Check, ChevronRight, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import axios from "axios"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

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

interface MasterDevelopment {
  _id: string
  developmentName: string
}

interface SubDevelopment {
  _id: string
  subDevelopment: string
}

export interface PlotDetails {
  plotNumber: string
  plotHeight: string
  plotPermission: string[]
  plotSizeSqFt: string
  plotBUASqFt: string
  plotStatus: string
  buaAreaSqFt: string
}

export interface MultiStepFormData {
  masterDevelopmentId: string
  masterDevelopmentName: string
  subDevelopmentName: string
  subDevelopmentId?: string
  plot?: PlotDetails
}

interface MultiStepModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (data: MultiStepFormData) => void
  onEdit?: any
  onCompleteEdit?: (data: any) => void
}

export function MultiStepModal({ open, onEdit, onOpenChange, onComplete, onCompleteEdit }: MultiStepModalProps) {
  const [step, setStep] = useState<number>(1)
  const [masterDevelopments, setMasterDevelopments] = useState<MasterDevelopment[]>([])
  const [subDevelopments, setSubDevelopments] = useState<SubDevelopment[]>([])
  const [selectedMasterDevelopmentId, setSelectedMasterDevelopmentId] = useState<string>("")
  const [masterDevelopmentName, setMasterDevelopmentName] = useState<string>("")
  const [subDevelopmentName, setSubDevelopmentName] = useState<string>("")
  const [selectedSubDevelopmentId, setSelectedSubDevelopmentId] = useState<string>("")
  const [plotDetails, setPlotDetails] = useState<PlotDetails>({
    plotNumber: "",
    plotHeight: "",
    plotPermission: [],
    plotSizeSqFt: "",
    plotBUASqFt: "",
    plotStatus: "",
    buaAreaSqFt: "",
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isEditMode, setIsEditMode] = useState<boolean>(false)

  // Reset form and set edit mode when modal opens/closes
  useEffect(() => {
    if (open) {
      resetForm()
      setIsEditMode(!!onEdit && Object.keys(onEdit).length > 0)
      fetchMasterDevelopments()
    }
  }, [open, onEdit])

  // Load edit data whenever modal opens in edit mode
  useEffect(() => {
    if (open && onEdit && Object.keys(onEdit).length > 0) {
      loadEditData()
    }
  }, [open, onEdit])

  const loadEditData = () => {
    console.log("Loading edit data:", onEdit)

    // Set master development data
    if (onEdit.masterDevelopment) {
      setSelectedMasterDevelopmentId(onEdit.masterDevelopment._id || "")
      setMasterDevelopmentName(onEdit.masterDevelopment.developmentName || "")
      fetchSubDevelopments(onEdit.masterDevelopment._id)
    }

    // Set sub development data if available
    if (onEdit.subDevelopment) {
      setSubDevelopmentName(onEdit.subDevelopment.subDevelopment || "")
      setSelectedSubDevelopmentId(onEdit.subDevelopment._id || "")
    }

    // Set plot data if available
    if (onEdit.plot) {
      setPlotDetails({
        plotNumber: onEdit.plot.plotNumber || "",
        plotHeight: onEdit.plot.plotHeight || "",
        plotPermission: onEdit.plot.plotPermission || [],
        plotSizeSqFt: onEdit.plot.plotSizeSqFt || "",
        plotBUASqFt: onEdit.plot.plotBUASqFt || "",
        plotStatus: onEdit.plot.plotStatus || "",
        buaAreaSqFt: onEdit.plot.buaAreaSqFt || "",
      })
    }
  }

  const fetchMasterDevelopments = async () => {
    setLoading(true)
    try {
      const response = await axios.get("http://213.210.37.77:3013/masterDevelopment")
      setMasterDevelopments(response.data.data)
    } catch (error) {
      console.error("Error fetching master developments:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubDevelopments = async (masterDevelopmentId: string) => {
    setLoading(true)
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_CMS_SERVER}/subDevelopment`)
      setSubDevelopments(response.data.data)
    } catch (error) {
      console.error("Error fetching sub developments:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setSelectedMasterDevelopmentId("")
    setMasterDevelopmentName("")
    setSubDevelopmentName("")
    setSelectedSubDevelopmentId("")
    setPlotDetails({
      plotNumber: "",
      plotHeight: "",
      plotPermission: [],
      plotSizeSqFt: "",
      plotBUASqFt: "",
      plotStatus: "",
      buaAreaSqFt: "",
    })
    setErrors({})
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleMasterDevelopmentChange = (id: string) => {
    setSelectedMasterDevelopmentId(id)
    const selectedDevelopment = masterDevelopments.find((dev) => dev._id === id)
    if (selectedDevelopment) {
      setMasterDevelopmentName(selectedDevelopment.developmentName)
      fetchSubDevelopments(id)
    }
  }

  const handleSubDevelopmentChange = (value: string, id: string) => {
    setSubDevelopmentName(value)
    setSelectedSubDevelopmentId(id)
  }

  const completeForm = (stepNo?: any) => {
    // If in edit mode, use onCompleteEdit with different format
    if (isEditMode && onCompleteEdit) {
      const editedData = { ...onEdit }

      // Always update master development - only pass ID as string
      editedData.masterDevelopment = selectedMasterDevelopmentId

      // Handle step 2 - SubDevelopment
      if (step === 2 && subDevelopmentName.trim()) {
        // If user selected a SubDevelopment, add it (only ID) and remove any existing PlotDetails
        editedData.subDevelopment = selectedSubDevelopmentId
        if (editedData.plot) {
          delete editedData.plot
        }
      }
      else if (step === 3 && stepNo !== 3) {
        editedData.plot = plotDetails
        if (editedData.subDevelopment) {
          delete editedData.subDevelopment
        }
      }
      // Handle skipping step 3
      else if (step === 3 && stepNo === 3) {
        if (editedData.plot) {
          delete editedData.plot
        }
      }

      onCompleteEdit(editedData)
    } else {
      // For new entries, create base form data with master development
      const formData: Partial<MultiStepFormData> = {
        masterDevelopmentId: selectedMasterDevelopmentId,
        masterDevelopmentName,
      }

      // Handle the same logic for new entries
      if (step === 2 && subDevelopmentName.trim()) {
        // If user selected a SubDevelopment, add it
        formData.subDevelopmentName = subDevelopmentName
        formData.subDevelopmentId = selectedSubDevelopmentId
        // Don't include plotDetails
      } else if (step === 3 && stepNo !== 3) {
        // If user added PlotDetails, add them
        formData.plot = plotDetails
        // Don't include subDevelopment
      }

      onComplete(formData as MultiStepFormData)
    }

    onOpenChange(false)
  }

  const validatePlotDetails = () => {
    const newErrors: Record<string, string> = {}

    if (!plotDetails.plotNumber.trim()) {
      newErrors.plotNumber = "Plot number is required"
    }
    if (!plotDetails.plotHeight.trim()) {
      newErrors.plotHeight = "Plot height is required"
    }
    if (!plotDetails.plotSizeSqFt.trim()) {
      newErrors.plotSizeSqFt = "Plot size is required"
    }
    if (!plotDetails.plotBUASqFt.trim()) {
      newErrors.plotBUASqFt = "Plot BUA is required"
    }
    if (!plotDetails.plotStatus.trim()) {
      newErrors.plotStatus = "Plot status is required"
    }
    if (!plotDetails.buaAreaSqFt.trim()) {
      newErrors.buaAreaSqFt = "BUA area is required"
    }
    if (plotDetails.plotPermission.length === 0) {
      newErrors.plotPermission = "At least one plot permission is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1) {
      if (!selectedMasterDevelopmentId) {
        toast({
          title: "Error",
          description: "Master development selection is required",
          variant: "destructive",
        })
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (subDevelopmentName.trim()) {
        // If SubDevelopment is selected, complete the form
        completeForm()
      } else {
        // If SubDevelopment is skipped, go to PlotDetails
        setStep(3)
      }
    } else if (step === 3) {
      if (validatePlotDetails()) {
        completeForm()
      } else {
        toast({
          title: "Error",
          description: "Please fill all required plot details",
          variant: "destructive",
        })
      }
    }
  }

  const handleSkip = () => {
    if (step === 2) {
      setSubDevelopmentName("")
      setSelectedSubDevelopmentId("")
      setStep(3)
    } else if (step === 3) {
      setPlotDetails({
        plotNumber: "",
        plotHeight: "",
        plotPermission: [],
        plotSizeSqFt: "",
        plotBUASqFt: "",
        plotStatus: "",
        buaAreaSqFt: "",
      })
      setErrors({})

      completeForm(3)
    }
  }

  const handlePlotPermissionChange = (permission: PlotPermission) => {
    setPlotDetails((prev) => {
      const currentPermissions = [...prev.plotPermission]

      if (currentPermissions.includes(permission)) {
        return {
          ...prev,
          plotPermission: currentPermissions.filter((p) => p !== permission),
        }
      } else {
        return {
          ...prev,
          plotPermission: [...currentPermissions, permission],
        }
      }
    })

    // Clear permission error when a permission is selected
    if (errors.plotPermission) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.plotPermission
        return newErrors
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit " : ""}
              {step === 1 ? "Master Development" : step === 2 ? "Sub Development" : "Plot Details"}
            </DialogTitle>
            <DialogDescription>
              {step === 1
                ? "Select the master development"
                : step === 2
                  ? "Enter the sub development name (optional)"
                  : "Enter plot details (optional)"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {step === 1 && (
              <div className="space-y-2">
                <Label htmlFor="masterDevelopmentName">Master Development Name *</Label>
                {loading ? (
                  <div className="h-10 w-full bg-gray-100 animate-pulse rounded-md"></div>
                ) : (
                  <Select value={selectedMasterDevelopmentId} onValueChange={handleMasterDevelopmentChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select master development" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterDevelopments.map((dev) => (
                        <SelectItem key={dev._id} value={dev._id}>
                          {dev.developmentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <div className="mb-4">
                  <Label className="text-sm text-muted-foreground">Selected Master Development</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md">{masterDevelopmentName}</div>
                </div>
                <Label htmlFor="subDevelopmentName">Sub Development Name</Label>
                {loading ? (
                  <div className="h-10 w-full bg-gray-100 animate-pulse rounded-md"></div>
                ) : (
                  <Select
                    value={subDevelopmentName}
                    onValueChange={(value) => {
                      const subDev = subDevelopments.find((sd) => sd.subDevelopment === value)
                      handleSubDevelopmentChange(value, subDev?._id || "")
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select sub development" />
                    </SelectTrigger>
                    <SelectContent>
                      {subDevelopments.map((subDev) => (
                        <SelectItem key={subDev._id} value={subDev.subDevelopment}>
                          {subDev.subDevelopment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="mb-4">
                  <Label className="text-sm text-muted-foreground">Selected Master Development</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md">{masterDevelopmentName}</div>

                  {subDevelopmentName && (
                    <>
                      <Label className="text-sm text-muted-foreground mt-2">Sub Development</Label>
                      <div className="mt-1 p-2 bg-muted rounded-md">{subDevelopmentName}</div>
                    </>
                  )}
                </div>

                <h3 className="text-sm font-medium">Plot Details</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plotNumber">Plot Number *</Label>
                    <Input
                      id="plotNumber"
                      value={plotDetails.plotNumber}
                      onChange={(e) => {
                        setPlotDetails({ ...plotDetails, plotNumber: e.target.value })
                        if (errors.plotNumber) setErrors((prev) => ({ ...prev, plotNumber: "" }))
                      }}
                      placeholder="Plot Number"
                    />
                    {errors.plotNumber && <p className="text-sm text-red-500">{errors.plotNumber}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plotHeight">Plot Height *</Label>
                    <Input
                      id="plotHeight"
                      value={plotDetails.plotHeight}
                      onChange={(e) => {
                        setPlotDetails({ ...plotDetails, plotHeight: e.target.value })
                        if (errors.plotHeight) setErrors((prev) => ({ ...prev, plotHeight: "" }))
                      }}
                      placeholder="Plot Height"
                    />
                    {errors.plotHeight && <p className="text-sm text-red-500">{errors.plotHeight}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plotSizeSqFt">Plot Size (Sq Ft) *</Label>
                    <Input
                      id="plotSizeSqFt"
                      value={plotDetails.plotSizeSqFt}
                      onChange={(e) => {
                        setPlotDetails({ ...plotDetails, plotSizeSqFt: e.target.value })
                        if (errors.plotSizeSqFt) setErrors((prev) => ({ ...prev, plotSizeSqFt: "" }))
                      }}
                      placeholder="Plot Size"
                      type="number"
                    />
                    {errors.plotSizeSqFt && <p className="text-sm text-red-500">{errors.plotSizeSqFt}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plotBUASqFt">Plot BUA (Sq Ft) *</Label>
                    <Input
                      id="plotBUASqFt"
                      value={plotDetails.plotBUASqFt}
                      onChange={(e) => {
                        setPlotDetails({ ...plotDetails, plotBUASqFt: e.target.value })
                        if (errors.plotBUASqFt) setErrors((prev) => ({ ...prev, plotBUASqFt: "" }))
                      }}
                      placeholder="Plot BUA"
                      type="number"
                    />
                    {errors.plotBUASqFt && <p className="text-sm text-red-500">{errors.plotBUASqFt}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plotStatus">Plot Status *</Label>
                    <Select
                      value={plotDetails.plotStatus}
                      onValueChange={(value) => {
                        setPlotDetails({ ...plotDetails, plotStatus: value })
                        if (errors.plotStatus) setErrors((prev) => ({ ...prev, plotStatus: "" }))
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select plot status" />
                      </SelectTrigger>
                      <SelectContent>
                        {plotStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.plotStatus && <p className="text-sm text-red-500">{errors.plotStatus}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buaAreaSqFt">BUA Area (Sq Ft) *</Label>
                    <Input
                      id="buaAreaSqFt"
                      value={plotDetails.buaAreaSqFt}
                      onChange={(e) => {
                        setPlotDetails({ ...plotDetails, buaAreaSqFt: e.target.value })
                        if (errors.buaAreaSqFt) setErrors((prev) => ({ ...prev, buaAreaSqFt: "" }))
                      }}
                      placeholder="BUA Area"
                      type="number"
                    />
                    {errors.buaAreaSqFt && <p className="text-sm text-red-500">{errors.buaAreaSqFt}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Plot Permission *</Label>
                  {errors.plotPermission && <p className="text-sm text-red-500">{errors.plotPermission}</p>}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {Object.values(PlotPermission).map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={`permission-${permission}`}
                          checked={plotDetails.plotPermission.includes(permission)}
                          onCheckedChange={() => handlePlotPermissionChange(permission as PlotPermission)}
                        />
                        <label
                          htmlFor={`permission-${permission}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={handleClose}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>

            <div className="flex gap-2">
              {step > 1 && (
                <Button variant="outline" onClick={handleSkip}>
                  Skip
                </Button>
              )}

              <Button onClick={handleNext} disabled={step === 1 && !selectedMasterDevelopmentId}>
                {step === 3 ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
