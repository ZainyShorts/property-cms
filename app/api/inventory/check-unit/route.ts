import { NextResponse } from "next/server"
import axios from "axios"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const project = searchParams.get("project")
    const unitNumber = searchParams.get("unitNumber")

    if (!project || !unitNumber) {
      return NextResponse.json(
        { error: "Project and unit number are required" },
        { status: 400 }
      )
    }

    // Call the CMS server to check if unit exists
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_CMS_SERVER}/inventory/check-unit?project=${project}&unitNumber=${unitNumber}`
    )

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Error checking unit number:", error)
    return NextResponse.json(
      { error: "Failed to check unit number" },
      { status: 500 }
    )
  }
} 