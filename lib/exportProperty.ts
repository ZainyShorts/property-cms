import * as XLSX from "xlsx"

interface CellStyle {
  fill?: {
    patternType?: string
    fgColor?: { rgb: string }
    bgColor?: { rgb: string }
  }
  font?: {
    name?: string
    sz?: number
    color?: { rgb: string }
    bold?: boolean
    underline?: boolean
  }
  alignment?: {
    horizontal?: "left" | "center" | "right"
    vertical?: "top" | "center" | "bottom"
    wrapText?: boolean
  }
  border?: {
    top?: { style: string; color: { rgb: string } }
    bottom?: { style: string; color: { rgb: string } }
    left?: { style: string; color: { rgb: string } }
    right?: { style: string; color: { rgb: string } }
  }
}

export function exportToExcel(data: any[], fileName = "properties-export") {
  // Process the data to handle arrays and maintain structure
  const processedData = data.map((property) => ({
    ID: property._id || "N/A",
    "Road Location": property.roadLocation || "N/A",
    "Development Name": property.developmentName || "N/A",
    "Sub Development": property.subDevelopmentName || "N/A",
    "Project Name": property.projectName || "N/A",
    "Property Type": property.propertyType || "N/A",
    "Property Height": property.propertyHeight || "N/A",
    "Project Location": property.projectLocation || "N/A",
    "Unit Number": property.unitNumber || "N/A",
    "Bed Room": property.bedrooms || "N/A",
    "Unit Land Size": property.unitLandSize || "N/A",
    "Unit BUA": property.unitBua || "N/A",
    "Unit View": Array.isArray(property.unitView) ? property.unitView.join(", ") : property.unitView || "N/A",
    "Unit Location": property.unitLocation || "N/A",
    Purpose: property.Purpose || "N/A",
    "Vacancy Status": property.vacancyStatus || "N/A",
    "Primary Price": property.primaryPrice || "N/A",
    "Resale Price": property.resalePrice || "N/A",
    "Premium & Loss":
      property.resalePrice && property.primaryPrice ? property.resalePrice - property.primaryPrice : "N/A",
    Rent: property.rent || "N/A",
    "No of Cheques": property.noOfCheques || "N/A",
    Listed: property.listed ? "YES" : "NO",
    "Created At": property.createdAt ? new Date(property.createdAt).toLocaleString() : "N/A",
  }))

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(processedData)

  // Set column widths based on content
  const columnWidths: { width: number }[] = []
  processedData.forEach((row) => {
    Object.entries(row).forEach(([key, value], colIndex) => {
      const contentLength = String(value).length
      const headerLength = key.length
      const maxLength = Math.max(contentLength, headerLength)

      if (!columnWidths[colIndex] || columnWidths[colIndex].width < maxLength) {
        columnWidths[colIndex] = { width: maxLength + 2 } // Add padding
      }
    })
  })

  // Apply column widths
  worksheet["!cols"] = columnWidths

  // Define styles
  const headerStyle: CellStyle = {
    fill: {
      patternType: "solid",
      fgColor: { rgb: "0F5A7A" },
    },
    font: {
      name: "Arial",
      sz: 11,
      color: { rgb: "FFFFFF" },
      bold: true,
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  }

  const evenRowStyle: CellStyle = {
    fill: {
      patternType: "solid",
      fgColor: { rgb: "D6EAF8" },
    },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  }

  const oddRowStyle: CellStyle = {
    fill: {
      patternType: "solid",
      fgColor: { rgb: "FFFFFF" },
    },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  }

  // Get the range of cells in the worksheet
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1")

  // Apply styles to cells and set cell formats
  for (let row = range.s.r; row <= range.e.r; row++) {
    const rowStyle = row === 0 ? headerStyle : row % 2 === 0 ? evenRowStyle : oddRowStyle

    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
      const cell = worksheet[cellRef]

      if (!cell) continue

      // Create a new cell object with the style
      worksheet[cellRef] = {
        ...cell,
        s: rowStyle,
      }

      // Set number format for specific columns (if needed)
      if (row > 0) {
        const columnHeader = Object.keys(processedData[0])[col]
        if (["Primary Price", "Resale Price", "Premium & Loss", "Rent"].includes(columnHeader)) {
          cell.z = "#,##0.00" // Apply number format for currency
        } else if (columnHeader === "Created At") {
          cell.z = "yyyy-mm-dd hh:mm:ss" // Apply date format
        }
      }
    }
  }

  // Create workbook and append the worksheet
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Properties")

  // Generate Excel file and trigger download
  const date = new Date().toISOString().split("T")[0]
  XLSX.writeFile(workbook, `${fileName}-${date}.xlsx`)
}