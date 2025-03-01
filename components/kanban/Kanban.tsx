'use client'
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Building2, MapPin, Calendar, Home } from "lucide-react"
import Image from "next/image"

export function PropertyListings({ categories }: { categories: any[] }) {
  return (
    <div className="space-y-16">
      {categories.map((category, categoryIndex) => (
        <motion.section
          key={category.status}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              {category.status}
            </h2>
            <span className="text-lg font-semibold text-muted-foreground">
              {category.properties.length} {category.properties.length === 1 ? "property" : "properties"}
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {category.properties.map((property: any, index: number) => (
              <motion.div
                key={property.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="h-full"
              >
                <Card className="h-full overflow-hidden border-0 bg-background/30 backdrop-blur-xl backdrop-filter hover:bg-background/40 transition-all duration-300 shadow-lg">
                  <CardHeader className="p-0">
                    <div className="relative h-56 w-full">
                      <Image
                        src={property.photos?.[0] || "/placeholder.svg?height=200&width=400"}
                        alt={property.description || "Property Image"}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
                          {property.id || "Property ID"}
                        </h3>
                        {property.price && (
                          <span className="text-lg font-semibold text-primary-foreground bg-primary/80 px-2 py-1 rounded-md">
                            AED {property.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {property.description && (
                      <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{property.description}</p>
                    )}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {property.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{property.location}</span>
                        </div>
                      )}
                      {property.size && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span>{property.size} sqft</span>
                        </div>
                      )}
                      {property.dateListed && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{property.dateListed}</span>
                        </div>
                      )}
                      {property.propertyType && (
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-primary" />
                          <span>{property.propertyType}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  {property.amenities?.length > 0 && (
                    <CardFooter className="p-4 pt-0">
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.map((amenity: string, amenityIndex: number) => (
                          <Badge
                            key={`${amenity}-${amenityIndex}`}
                            variant="secondary"
                            className="bg-secondary/10 hover:bg-secondary/20"
                          >
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </CardFooter>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  )
}

