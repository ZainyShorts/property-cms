"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  MapPin,
  Star,
  Users,
  Sparkles,
  BarChart3,
  Home,
  Building,
  Castle,
  Hotel,
  Warehouse,
  TrendingUp,
  TrendingDown,
  Calendar,
  Ruler,
  Square,
} from "lucide-react"

export default function Component() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Development Info Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="bg-gray-100 dark:bg-gray-700">
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Building2 className="h-5 w-5" />
              Development Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Road Location</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Downtown Main St</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Development Name</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Burj Khalifa District</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Development Ranking</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    A+
                  </Badge>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">No. of Facilities</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">15</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">No. of Amenities</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">25</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">No. of Plots Total</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">500</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">No. of Plots Developed</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">350</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Building className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">No. of Plots Under Construction</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">100</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Square className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">No. of Plots Vacant</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">50</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Types Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="bg-gray-100 dark:bg-gray-700">
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <BarChart3 className="h-5 w-5" />
              Project Types
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      colSpan={2}
                      className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Project Heights
                      </div>
                    </th>
                    <th
                      colSpan={2}
                      className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Project BUA Sq. Ft.
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Home className="h-4 w-4" />
                        Apartments
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Hotel className="h-4 w-4" />
                        Hotel Apartments
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Castle className="h-4 w-4" />
                        Villas
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Building className="h-4 w-4" />
                        Townhouses
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <BarChart3 className="h-4 w-4" />
                        Total
                      </div>
                    </th>
                  </tr>
                  <tr className="bg-gray-100 dark:bg-gray-600">
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingDown className="h-4 w-4" />
                        Minimum
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Maximum
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                      Min
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                      Max
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300"></th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300"></th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300"></th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300"></th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200 dark:border-gray-600">
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600">
                      5 floors
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600">
                      50 floors
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600">
                      500 sq ft
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600">
                      5000 sq ft
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">150</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">75</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">100</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">175</td>
                    <td className="p-3 text-center text-sm font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20">
                      500
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Type Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="bg-gray-100 dark:bg-gray-700">
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Warehouse className="h-5 w-5" />
              Inventory Type
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Home className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Apartments</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">150</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Castle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Villas</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">100</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Building className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Townhouses</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">175</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Hotel className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Hotel</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">75</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Labour Camp</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">25</div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-600 dark:text-blue-400">Total</span>
                </div>
                <div className="font-semibold text-blue-800 dark:text-blue-300">525</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="bg-gray-100 dark:bg-gray-700">
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <BarChart3 className="h-5 w-5" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Type</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Castle className="h-4 w-4" />
                        Villas
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Building className="h-4 w-4" />
                        Townhouses
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Home className="h-4 w-4" />
                        Apartment
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Warehouse className="h-4 w-4" />
                        Warehouse
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4" />
                        School
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center gap-1">
                        <Building2 className="h-4 w-4" />
                        Hospital
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200 dark:border-gray-600">
                    <td className="p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        Sell
                      </div>
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">1</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">2</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">0</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">3</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">0</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">1</td>
                  </tr>
                  <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50">
                    <td className="p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        Rent
                      </div>
                    </td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">5</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">1</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">3</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">2</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">0</td>
                    <td className="p-3 text-center text-sm text-gray-900 dark:text-gray-100">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
