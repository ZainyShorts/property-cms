import { PropertyCard } from "@/components/gallery/Poperty-card/Card"

const dummyData = [
  {
    image: "https://cdn.businessday.ng/2021/07/luxury-residential-real-estate.png",
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
    image: "https://media.istockphoto.com/id/899471458/photo/purchase-agreement-for-new-house.jpg?s=612x612&w=0&k=20&c=S97ewd-sqqOYk3kX5Wg-1FWJBndPW9AgI0VBHmDHMeA=",
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
    image: "https://images.ctfassets.net/n2ifzifcqscw/3QRMlAcJFrYAEAbhziixZW/d4b9aa50215c5ea7a161b8a6b59f1974/hero-real-estate-facts-trends.jpeg?w=425",
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

