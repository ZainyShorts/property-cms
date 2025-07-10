"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Mail, Phone, Globe, MapPin, Building, User, Calendar, Tag, Briefcase, Users, Edit, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css" 
import useSWR from "swr"

import axios from "axios"

interface Customer {
  _id: string
  customerSegment: string
  customerCategory: string
  customerSubCategory: string
  customerType: string
  customerSubType: string
  customerBusinessSector: string
  customerNationality: string
  customerName: string
  contactPerson: string
  customerDepartment: string
  customerDesignation: string
  telOffice: string
  tellDirect: string
  emailAddress: string
  mobile1: string
  mobile2: string
  webAddress: string
  officeLocation: string
  createdAt: string
  updatedAt: string
} 
const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`)
  }
  return res.json() as Promise<T>
}

type Props = {
  params: { id: string }; // <- This comes from the [id] folder name
};
export default function CustomerDetailsPage({ params }: Props){
  const searchParams = useSearchParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
const { data } = useSWR<any>("/api/me", fetcher)

  useEffect(() => {
    if (data) console.log("data →", data)
  }, [data])
  const customerId = params.id;

  useEffect(() => {
    if (customerId && data) {
      fetchCustomerDetails(customerId)
    } 
  }, [customerId ,data])

  const fetchCustomerDetails = async (id: string) => {
    try {
      setLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_CMS_SERVER}/customer/${id}`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      })
      setCustomer(response.data.data || response.data)
    } catch (error) {
      console.error("Error fetching customer details:", error)
      setError("Failed to fetch customer details")
      toast.error("Failed to fetch customer details")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getSegmentColor = (segment: string) => {
    switch (segment.toLowerCase()) {
      case "customer":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "supplier":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "organisation":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "individual":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const closeWindow = () => {
    window.close()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-10 w-32 mb-4" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <ToastContainer position="top-right" autoClose={3000} />
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Customer Not Found</h2>
            <p className="text-muted-foreground mb-4">{error || "The customer you're looking for doesn't exist."}</p>
            <Button onClick={closeWindow}>Close Window</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={closeWindow} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="h-4 w-4 mr-2" />
              Close Window
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Print Details
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{customer.customerName}</h1>
              <div className="flex items-center gap-2">
                <Badge className={getSegmentColor(customer.customerSegment)}>{customer.customerSegment}</Badge>
                <Badge className={getCategoryColor(customer.customerCategory)}>{customer.customerCategory}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Building className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Tag className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Customer Type</p>
                        <p className="text-base text-gray-900 dark:text-white">{customer.customerType}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Tag className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sub Category</p>
                        <p className="text-base text-gray-900 dark:text-white">{customer.customerSubCategory}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Briefcase className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Business Sector</p>
                        <p className="text-base text-gray-900 dark:text-white">{customer.customerBusinessSector}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Tag className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sub Type</p>
                        <p className="text-base text-gray-900 dark:text-white">{customer.customerSubType}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Globe className="h-5 w-5 text-teal-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nationality</p>
                        <p className="text-base text-gray-900 dark:text-white">{customer.customerNationality}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Calendar className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Created</p>
                        <p className="text-base text-gray-900 dark:text-white">{formatDate(customer.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <User className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contact Person</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {customer.contactPerson}
                        </p>
                      </div>
                    </div>
                    {customer.customerDepartment && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Building className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Department</p>
                          <p className="text-base text-gray-900 dark:text-white">{customer.customerDepartment}</p>
                        </div>
                      </div>
                    )}
                    {customer.customerDesignation && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Users className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Designation</p>
                          <p className="text-base text-gray-900 dark:text-white">{customer.customerDesignation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {customer.emailAddress && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Mail className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</p>
                          <a
                            href={`mailto:${customer.emailAddress}`}
                            className="text-base text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {customer.emailAddress}
                          </a>
                        </div>
                      </div>
                    )}
                    {customer.webAddress && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Globe className="h-5 w-5 text-teal-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Website</p>
                          <a
                            href={
                              customer.webAddress.startsWith("http")
                                ? customer.webAddress
                                : `https://${customer.webAddress}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {customer.webAddress}
                          </a>
                        </div>
                      </div>
                    )}
                    {customer.officeLocation && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <MapPin className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Office Location</p>
                          <p className="text-base text-gray-900 dark:text-white">{customer.officeLocation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Phone Numbers */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <Phone className="h-5 w-5" />
                  Phone Numbers
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {customer.telOffice && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Office</p>
                      <a
                        href={`tel:${customer.telOffice}`}
                        className="text-base text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        {customer.telOffice}
                      </a>
                    </div>
                  )}
                  {customer.tellDirect && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Direct</p>
                      <a
                        href={`tel:${customer.tellDirect}`}
                        className="text-base text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        {customer.tellDirect}
                      </a>
                    </div>
                  )}
                  {customer.mobile1 && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mobile 1</p>
                      <a
                        href={`tel:${customer.mobile1}`}
                        className="text-base text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        {customer.mobile1}
                      </a>
                    </div>
                  )}
                  {customer.mobile2 && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mobile 2</p>
                      <a
                        href={`tel:${customer.mobile2}`}
                        className="text-base text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        {customer.mobile2}
                      </a>
                    </div>
                  )}
                  {!customer.telOffice && !customer.tellDirect && !customer.mobile1 && !customer.mobile2 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No phone numbers available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-t-lg">
                <CardTitle className="text-lg text-purple-700 dark:text-purple-300">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                 
                  <Button className="w-full bg-transparent" variant="outline" onClick={() => window.print()}>
                    <Building className="h-4 w-4 mr-2" />
                    Print Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Record Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-t-lg">
                <CardTitle className="text-lg text-gray-700 dark:text-gray-300">Record Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Customer ID</p>
                    <p className="text-sm font-mono bg-white dark:bg-gray-900 p-3 rounded border text-gray-900 dark:text-gray-100 break-all">
                      {customer._id}
                    </p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Created</p>
                      <p className="text-sm text-gray-900 dark:text-white">{formatDate(customer.createdAt)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Last Updated</p>
                      <p className="text-sm text-gray-900 dark:text-white">{formatDate(customer.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
