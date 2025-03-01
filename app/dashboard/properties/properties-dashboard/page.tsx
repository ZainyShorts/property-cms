import { DashboardCharts } from "@/components/dashboard/Dashboard-charts"

export default function Page() {
  const dummyData = {
    barData: [
      { name: "Jan", value: 2500 },
      { name: "Feb", value: 3000 },
      { name: "Mar", value: 1800 },
      { name: "Apr", value: 1500 },
      { name: "May", value: 2200 },
      { name: "Jun", value: 2800 },
    ],
    pieData: [
      { name: "Pool", value: 25 },
      { name: "Gym", value: 25 },
      { name: "Garden", value: 25 },
      { name: "Balcony", value: 25 },
    ],
    lineData: [
      { name: "Q1 2023", value: 500000 },
      { name: "Q2 2023", value: 750000 },
      { name: "Q3 2023", value: 600000 },
      { name: "Q4 2023", value: 900000 },
      { name: "Q1 2024", value: 1100000 },
      { name: "Q2 2024", value: 950000 },
    ],
  }

  return <DashboardCharts {...dummyData} />
}

