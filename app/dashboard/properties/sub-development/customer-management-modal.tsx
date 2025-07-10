"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, UserPlus, Search, Trash2, Users } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import axios from "axios"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Customer {
  _id: string
  customerName: string
  customerType: string
  customerSegment?: string
  customerCategory?: string
  emailAddress?: string
  mobile1?: string
  contactPerson?: string
}

interface CustomerManagementModalProps {
  isOpen: boolean
  onClose: () => void
  token: string
  rowId: string | null
  existingCustomerIds: string[]
  previousCustomerIds?: string[]
  onCustomersUpdated: () => void
}

export function CustomerManagementModal({
  isOpen,
  onClose,
  rowId,
  token,
  existingCustomerIds = [],
  previousCustomerIds = [],
  onCustomersUpdated,
}: CustomerManagementModalProps) {
  const [existingCustomers, setExistingCustomers] = useState<any[]>([])
  const [allCustomers, setAllCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingExisting, setLoadingExisting] = useState(false)
  const [loadingPrevious, setLoadingPrevious] = useState(false)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddSection, setShowAddSection] = useState(false)

  // Fetch existing customer details, previous customers, and all customers when modal opens
  useEffect(() => {
    fetchExistingCustomers()
    fetchAllCustomers()
  }, [isOpen, rowId, showAddSection])

  const fetchExistingCustomers = async () => {
    setLoadingExisting(true)
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_CMS_SERVER}/subDevelopment/customerDetails/${rowId}`)
      console.log("data", response.data)
      const { currentCustomers = [] } = response.data.data
      setExistingCustomers(currentCustomers)
      // setPreviousCustomers(previousCustomers)
      // optionally store previousCustomers too
    } catch (error) {
      console.error("Error fetching customer details:", error)
      toast.error("Failed to fetch customer details")
    } finally {
      setLoadingExisting(false)
    }
  }

  const fetchAllCustomers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_SERVER}/customer/subdevelopment/${rowId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      console.log('fetchedALL',data)
      if (data) {
        setAllCustomers(data)
      } else if (data) {
        setAllCustomers(data)
      } else {
        setAllCustomers([])
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      toast.error("Failed to fetch customers. Please try again.")
      setAllCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomer = async () => {
    if (!selectedCustomer || !rowId) {
      toast.error("Please select a customer")
      return
    }

    // Check if customer is already added
    const isAlreadyAdded = existingCustomerIds.includes(selectedCustomer._id)
    if (isAlreadyAdded) {
      toast.error("This customer is already added to this property")
      return
    }

    setAdding(true)
    try {
      // Create updated customers array with IDs
      const updatedCustomerIds = [...existingCustomerIds, selectedCustomer._id]
      const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_SERVER}/subDevelopment/updateSingleRecord/${rowId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customers: updatedCustomerIds,
        }),
      })

      if (response.ok) {
        toast.success("Customer added successfully!")
        onCustomersUpdated()
        setSelectedCustomer(null)
        setShowAddSection(false)
        // Refresh customer data
        fetchExistingCustomers()
      }
    } catch (error) {
      console.error("Error adding customer:", error)
      toast.error("Failed to add customer. Please try again.")
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveCustomer = async (customerId: string) => {
    if (!rowId) return
    setRemoving(customerId)
    try {
      const updatedCustomerIds = existingCustomerIds.filter((id) => id !== customerId)

      const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_SERVER}/subDevelopment/updateSingleRecord/${rowId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customers: updatedCustomerIds,
        }),
      })

      if (response.ok) {
        toast.success("Customer removed!")
        onCustomersUpdated() 
        onClose()
        // Refresh customer data
        fetchExistingCustomers()
      }
    } catch (error) {
      console.error("Error removing customer:", error)
      toast.error("Failed to remove customer. Please try again.")
    } finally {
      setRemoving(null)
    }
  }

  const handleClose = () => {
    setSelectedCustomer(null)
    setSearchTerm("")
    setShowAddSection(false)
    onClose()
  }

  // Filter customers based on search term (exclude already added customers and previous customers)
let filteredCustomers: typeof allCustomers = [];

if (allCustomers && allCustomers.length > 0) {
  filteredCustomers = allCustomers.filter(
    (customer) =>
      !existingCustomerIds.includes(customer._id) &&
      (
        customer.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customerType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );
}
  const getCustomerTypeColor = (type: string) => {
    const colors = {
      Individual: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Organisation: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Corporate: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      default: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    }
    return colors[type as keyof typeof colors] || colors.default
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[96vh] overflow-auto flex flex-col">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Manage Customers</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                View, add, or remove customers for this property
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-auto">
          {/* Current Customers Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Current Customers ({existingCustomers.length})</Label>
              <Button variant="outline" size="sm" onClick={() => setShowAddSection(!showAddSection)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                {showAddSection ? "Cancel" : "Add Customer"}
              </Button>
            </div>

            {loadingExisting ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading customers...</span>
              </div>
            ) : existingCustomers.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No customers added yet</p>
              </div>
            ) : (
              <ScrollArea className="min-h-[200px] pr-4">
                <div className="space-y-2">
                  {existingCustomers.map((customer) => (
                    <Card key={customer._id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-full">
                                <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">{customer.customerName || "N/A"}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {customer.contactPerson && `Contact: ${customer.contactPerson}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className={getCustomerTypeColor(customer.customerType || "default")}
                              >
                                {customer.customerType || "N/A"}
                              </Badge>
                              {customer.customerSegment && (
                                <Badge variant="outline" className="text-xs">
                                  {customer.customerSegment}
                                </Badge>
                              )}
                            </div>
                            {(customer.emailAddress || customer.mobile1) && (
                              <div className="text-xs text-muted-foreground space-y-1">
                                {customer.emailAddress && <div>Email: {customer.emailAddress}</div>}
                                {customer.mobile1 && <div>Mobile: {customer.mobile1}</div>}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 bg-transparent"
                            onClick={() => handleRemoveCustomer(customer._id)}
                            disabled={removing === customer._id}
                          >
                            {removing === customer._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Previous Customers Section */}

          {/* Add Customer Section */}
          {showAddSection && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label className="text-sm font-medium text-blue-600 dark:text-blue-400">Add New Customer</Label>

                {/* Search Input */}
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-sm font-medium">
                    Search Customers
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name, type, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Customer Selection */}
                <div className="space-y-3">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading customers...</span>
                    </div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {searchTerm ? "No customers found matching your search" : "No customers available to add"}
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[350px] pr-4">
                      <div className="space-y-2">
                        {filteredCustomers.map((customer) => (
                          <Card
                            key={customer._id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                              selectedCustomer?._id === customer._id
                                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                                      <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm">{customer.customerName || "N/A"}</h4>
                                      <p className="text-xs text-muted-foreground">
                                        {customer.contactPerson && `Contact: ${customer.contactPerson}`}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge
                                      variant="outline"
                                      className={getCustomerTypeColor(customer.customerType || "default")}
                                    >
                                      {customer.customerType || "N/A"}
                                    </Badge>
                                    {customer.customerSegment && (
                                      <Badge variant="outline" className="text-xs">
                                        {customer.customerSegment}
                                      </Badge>
                                    )}
                                  </div>
                                  {(customer.emailAddress || customer.mobile1) && (
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      {customer.emailAddress && <div>Email: {customer.emailAddress}</div>}
                                      {customer.mobile1 && <div>Mobile: {customer.mobile1}</div>}
                                    </div>
                                  )}
                                </div>
                                {selectedCustomer?._id === customer._id && (
                                  <div className="ml-2 p-1 bg-blue-500 rounded-full">
                                    <div className="h-2 w-2 bg-white rounded-full" />
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                {/* Selected Customer Preview */}
                {selectedCustomer && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-600 dark:text-green-400">Selected Customer</Label>
                    <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-full">
                            <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-green-800 dark:text-green-200">
                              {selectedCustomer.customerName}
                            </h4>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              {selectedCustomer.customerType}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={adding}>
            Close
          </Button>
          {showAddSection && selectedCustomer && (
            <Button onClick={handleAddCustomer} disabled={adding} className="gap-2">
              {adding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Add Customer
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
