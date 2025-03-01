import { PropertyCard } from "@/components/gallery/Poperty-card/Card"

const dummyData = [
  {
    image: "https://www.withersworldwide.com/getmedia/db8d2f15-fa7c-4604-8679-1952ea12a46f/GettyImages-635811232-(1920x800).jpg",
    "Property ID": "PROP002",
    "Property Details": {
      Location: "456 Ocean Drive, Santa Monica, CA",
      Price: "AED1,200,000.00",
      Size: "3200.00 sq.ft",
    },
    Features: ["Balcony", "Parking", "Gym"],
    "Agent Info": {
      Name: "Jane Smith",
      ID: "AG002",
    },
    "Additional Info": {
      "Listing Details": "LST-002",
      Documents: "DOC002",
      "Maintenance Requests": "REQ-002",
      Reviews: "RV002",
      Transactions: "TXN002",
      Appointments: "APT002",
    },
  },
  {
    image: "https://media.istockphoto.com/id/1395419120/photo/dawn-view-of-victoria-harbor-and-hong-kong-cityscape-from-victoria-peak.jpg?s=612x612&w=0&k=20&c=42c4tiHYooBYry95Hwhwh6baOx4aZVk5zw34hU_z-Rs=",
    "Property ID": "PROP005",
    "Property Details": {
      Location: "654 Lakeside Ave, Chicago, IL",
      Price: "AED850,000.00",
      Size: "2700.00 sq.ft",
    },
    Features: ["Pool", "Parking", "Garden"],
    "Agent Info": {
      Name: "John Doe",
      ID: "AG005",
    },
    "Additional Info": {
      "Listing Details": "LST-005",
      Documents: "DOC005",
      "Maintenance Requests": "REQ-005",
      Reviews: "RV005",
      Transactions: "TXN005",
      Appointments: "APT005",
    },
  }, 
  {
    image: "https://imarat.com.pk/wp-content/uploads/2024/11/The-Evolution-of-Real-Estate-How-Technology.jpg.webp",
    "Property ID": "PROP005",
    "Property Details": {
      Location: "654 Lakeside Ave, Chicago, IL",
      Price: "AED850,000.00",
      Size: "2700.00 sq.ft",
    },
    Features: ["Pool", "Parking", "Garden"],
    "Agent Info": {
      Name: "John Doe",
      ID: "AG005",
    },
    "Additional Info": {
      "Listing Details": "LST-005",
      Documents: "DOC005",
      "Maintenance Requests": "REQ-005",
      Reviews: "RV005",
      Transactions: "TXN005",
      Appointments: "APT005",
    },
  },
]

export default function Page() {
  return (
    <div className="min-h-screen  dark:bg-background ">
      <div className="container py-10">
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Featured Properties</h1>
          <p className="text-muted-foreground">Discover our exclusive collection of premium properties</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyData.map((property, index) => (
            <PropertyCard key={index} data={property} />
          ))}
        </div>
      </div>
    </div>
  )
}

