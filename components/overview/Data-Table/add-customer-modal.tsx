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
import { Loader2, User, UserPlus, Search } from "lucide-react"
import { toast } from "react-toastify"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  rowId: string | null 
  token:string
  onCustomerAdded: () => void
  existingCustomers?: Customer[]
}

export function AddCustomerModal({
  isOpen,
  onClose,
  rowId, 
  token,
  onCustomerAdded,
  existingCustomers = [],
}: AddCustomerModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch customers when modal opens
  useEffect(() => {
    if (isOpen && rowId) {
      fetchCustomers()
    }
  }, [isOpen, rowId])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
const response = await axios.get(
  `${process.env.NEXT_PUBLIC_CMS_SERVER}/customer`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
      if (response.data?.data?.customers) {
        setCustomers(response.data.data.customers)
      } else if (response.data?.data) {
        setCustomers(response.data.data)
      } else {
        setCustomers([])
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      toast.error("Failed to fetch customers. Please try again.")
      setCustomers([])
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
    const isAlreadyAdded = existingCustomers.some((customer) => customer._id === selectedCustomer._id)

    if (isAlreadyAdded) {
      toast.error("This customer is already added to this property")
      return
    }

    setAdding(true)
    try {
      // Create updated customers array
      const updatedCustomers = [...existingCustomers, selectedCustomer]

      const response = await axios.patch(`${process.env.NEXT_PUBLIC_CMS_SERVER}/inventory/${rowId}`, {
        customers: updatedCustomers,
      })

      if (response.status === 200) {
        toast.success("Customer added successfully!")
        onCustomerAdded()
        handleClose()
      }
    } catch (error) {
      console.error("Error adding customer:", error)
      toast.error("Failed to add customer. Please try again.")
    } finally {
      setAdding(false)
    }
  }

  const handleClose = () => {
    setSelectedCustomer(null)
    setSearchTerm("")
    onClose()
  }

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Add Customer</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Select a customer to add to this property inventory
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
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

          <Separator />

          {/* Customer Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Customer</Label>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading customers...</span>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "No customers found matching your search" : "No customers available"}
                </p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {filteredCustomers.map((customer) => {
                  const isAlreadyAdded = existingCustomers.some(
                    (existingCustomer) => existingCustomer._id === customer._id,
                  )

                  return (
                    <Card
                      key={customer._id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedCustomer?._id === customer._id
                          ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                          : isAlreadyAdded
                            ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => {
                        if (!isAlreadyAdded) {
                          setSelectedCustomer(customer)
                        }
                      }}
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

                          {isAlreadyAdded && (
                            <Badge variant="secondary" className="ml-2">
                              Already Added
                            </Badge>
                          )}

                          {selectedCustomer?._id === customer._id && !isAlreadyAdded && (
                            <div className="ml-2 p-1 bg-blue-500 rounded-full">
                              <div className="h-2 w-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Selected Customer Preview */}
          {selectedCustomer && (
            <>
              <Separator />
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
                        <p className="text-xs text-green-600 dark:text-green-400">{selectedCustomer.customerType}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={adding}>
            Cancel
          </Button>
          <Button onClick={handleAddCustomer} disabled={!selectedCustomer || adding} className="gap-2">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
