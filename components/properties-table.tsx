import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const properties = [
  {
    id: "PROP002",
    location: "456 Ocean Drive, Santa Monica",
    price: "AED1,200,000.00",
    size: "3200.00",
  },
  {
    id: "PROP005",
    location: "654 Lakeside Ave, Chicago",
    price: "AED850,000.00",
    size: "2700.00",
  },
  {
    id: "PROP004",
    location: "321 City Center, New York",
    price: "AED2,000,000.00",
    size: "1500.00",
  },
  {
    id: "PROP003",
    location: "789 Mountain Rd, Denver",
    price: "AED500,000.00",
    size: "1800.00",
  },
  {
    id: "PROP001",
    location: "123 Sunshine Blvd, Miami",
    price: "AED750,000.00",
    size: "2500.00",
  },
]

export function PropertiesTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property ID</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Size</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell>{property.id}</TableCell>
              <TableCell>{property.location}</TableCell>
              <TableCell>{property.price}</TableCell>
              <TableCell>{property.size}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

