import { PropertyListings } from "@/components/kanban/Kanban"

// Example dummy data structured as an array of categories
const dummyCategories = [
  {
    status: "Available",
    properties: [
      {
        id: "LST-004",
        description: "Luxury condo with smart home features and a panoramic ocean view balcony",
        price: 1200000,
        photos: ["https://www.bankrate.com/2022/09/01171315/Commercial-real-estate.jpg?auto=webp&optimize=high&crop=16:9"],
        location: "321 Beachfront Blvd, Oceanview",
        size: 1500,
        amenities: ["Balcony", "Gym", "Smart Home"],
        dateListed: "1/27/2025",
        propertyType: "Condo",
      },
      {
        id: "LST-005",
        description: "Eco-friendly house with solar panels and a vegetable garden",
        price: 600000,
        photos: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRisNsbAKpFyCYcmaAyKEvih_fMDFJ1xnpERQ&s"],
        location: "654 Greenway Drive, Eco City",
        size: 2000,
        amenities: ["Solar Panels", "Garden", "Energy Efficient"],
        dateListed: "1/23/2025",
        propertyType: "House",
      },
    ],
  },
  {
    status: "Sold",
    properties: [
      {
        id: "LST-003",
        description: "Spacious suburban townhouse with a private garage and community gym",
        price: 450000,
        photos: ["https://static.vecteezy.com/system/resources/thumbnails/044/515/482/small_2x/elegant-blank-mockup-of-a-luxury-home-for-sale-yard-sign-with-space-for-propertys-photo.jpg"],
        location: "789 Oak Avenue, Rivertown",
        size: 1800,
        amenities: ["Garage", "Gym", "Community Pool"],
        dateListed: "12/27/2024",
        propertyType: "Townhouse",
      }, 
      {
        id: "LST-009",
        description: "Spacious suburban townhouse with a private garage and community gym",
        price: 450000,
        photos: ["https://img.freepik.com/free-photo/3d-electric-car-building_23-2148972401.jpg"],
        location: "789 Oak Avenue, Rivertown",
        size: 1800,
        amenities: ["Garage", "Gym", "Community Pool"],
        dateListed: "12/27/2024",
        propertyType: "Townhouse",
      }, 
      {
        id: "LST-008",
        description: "Spacious suburban townhouse with a private garage and community gym",
        price: 450000,
        photos: ["https://static.vecteezy.com/system/resources/previews/046/987/502/non_2x/exterior-of-modern-house-in-new-area-of-the-city-real-estate-residential-apartment-and-office-building-architecture-photo.jpg"],
        location: "789 Oak Avenue, Rivertown",
        size: 1800,
        amenities: ["Garage", "Gym", "Community Pool"],
        dateListed: "12/27/2024",
        propertyType: "Townhouse",
      },
    ],
  },
  {
    status: "Rented",
    properties: [
      {
        id: "LST-006",
        description: "Quaint apartment in a historic building with vintage charm and modern amenities",
        price: 91800,
        photos: ["https://www.maramani.com/cdn/shop/files/Realestatecommercialbuilding-ID29908Image1.jpg?v=1695819684&width=2048"],
        location: "967 Heritage Lane, Oldtown",
        size: 950,
        amenities: ["Balcony", "Gym", "Pet Friendly"],
        dateListed: "1/8/2025",
        propertyType: "Apartment",
      },
    ],
  },
]

export default function Page() {
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">
            Premium Property Listings
          </h1>
          <p className="text-xl text-muted-foreground">Discover your dream property from our exclusive collection</p>
        </div>
        <PropertyListings categories={dummyCategories} />
      </div>
    </div>
  )
}

