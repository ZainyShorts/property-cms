import Image from "next/image"
import { Mail, Phone, MapPin, BedDouble, Bath, Ruler, Car } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function PropertyDetail() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Modern luxury house"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src="https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    alt={`Property view ${i + 1}`}
                    fill
                    className="object-cover hover:opacity-75 transition-opacity cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Luxury Modern Villa</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <MapPin className="h-4 w-4" />
                <span>456 Ocean Drive, Santa Monica, CA</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="p-4">
                  <div className="font-semibold">Price</div>
                  <div className="text-2xl font-bold text-primary">AED 1,200,000.00</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="font-semibold">Property ID</div>
                  <div className="text-2xl font-bold">PROP002</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                <BedDouble className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">4 Beds</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                <Bath className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">3 Baths</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                <Ruler className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">3200 sq.ft</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                <Car className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">2 Parking</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Features & Amenities</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {["Balcony", "Gym", "Pool", "Garden", "Security", "Central AC"].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Contact Agent</h2>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full">
                      <Image
                        src="/placeholder.svg?height=64&width=64"
                        alt="Agent photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold">Jane Smith</div>
                      <div className="text-sm text-muted-foreground">Agent ID: AG002</div>
                      <div className="mt-2 flex gap-4">
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <Separator />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Description</h2>
            <p className="text-muted-foreground">
              This stunning modern villa offers luxurious living spaces with high-end finishes throughout. The property
              features an open concept design with floor-to-ceiling windows that flood the interior with natural light.
              The gourmet kitchen is equipped with premium appliances and custom cabinetry. The primary suite includes a
              spa-like bathroom and walk-in closet.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Similar Properties</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src="https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=1200"
                      alt={`Similar property ${i}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">Modern Villa</h3>
                    <div className="text-sm text-muted-foreground">Santa Monica, CA</div>
                    <div className="mt-2 font-semibold text-primary">AED 1,100,000.00</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

