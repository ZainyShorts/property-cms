"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, BarChart3Icon, PieChartIcon } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Bar, Cell , BarChart, Line, LineChart, Pie, PieChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ChartData {
  name: string
  value: number
}

interface DashboardChartsProps {
  barData: ChartData[]
  pieData: ChartData[]
  lineData: ChartData[]
}

const chartColors = {
  bar: "hsl(217, 91%, 60%)", // Bright blue
  pie: [
    "hsl(217, 91%, 60%)", // Blue
    "hsl(316, 80%, 36%)", // Purple
    "hsl(330, 100%, 65%)", // Pink
    "hsl(28, 96%, 41%)", // Orange
    "hsl(150, 100%, 65%)", // Green
  ],
  line: "hsl(217, 91%, 60%)",
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function DashboardCharts({ barData, pieData, lineData }: DashboardChartsProps) {
  const barChartConfig = {
    bar: {
      color: chartColors.bar,
    },
  }

  const pieChartConfig = {
    pie: {
      color: chartColors.pie, 
    },
  };
  const lineChartConfig = {
    line: {
      color: chartColors.line,
    },
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-12 text-5xl font-bold text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Dashboard Analytics
          </span>
        </h1>
        <div className="grid gap-8 lg:grid-cols-2 ">
          <ChartCard title="Monthly Performance" description="Overview of monthly statistics" icon={BarChart3Icon}>
            <ChartContainer className="w-full h-[400px]" config={barChartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar barSize={20}   dataKey="value" name="Performance" fill={chartColors.bar} radius={[4, 4, 0, 0]}>
                    {barData.map((_, index) => (
                      <motion.rect
                        key={`bar-${index}`}
                        initial={{ y: 300, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Amenities Distribution" description="Breakdown of property features" icon={PieChartIcon}>
  <ChartContainer config={pieChartConfig} className="w-full h-[400px]">
  <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ name, value }) => `${name}: ${value}%`}
              className="stroke-white stroke-[2px]"
            >
       {pieData.map((entry, index) => (
  <Cell
    key={`cell-${index}`}
    fill={chartColors.pie?.[index % chartColors.pie.length] || "#ff0000"}
    stroke="#ffffff"
    strokeWidth={2}
    className="transition-transform duration-300 "
  />
))}


            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: "white", fontSize: "14px" }} />
          </PieChart>
        </ResponsiveContainer>
  </ChartContainer>
</ChartCard>

          <ChartCard
            title="Revenue Trends"
            description="Financial performance analysis"
            icon={Activity}
            className="lg:col-span-2 xl:col-span-1"
          >
            <ChartContainer className="w-full h-[400px]" config={lineChartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Revenue"
                    stroke={chartColors.line}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}

interface ChartCardProps {
  title: string
  description: string
  icon: React.ElementType
  children: React.ReactNode
  className?: string
}

function ChartCard({ title, description, icon: Icon, children, className }: ChartCardProps) {
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ duration: 0.5 }}>
      <Card
        className={`border border-gray-800 bg-white/5 shadow-lg transition-all hover:shadow-2xl hover:shadow-blue-500/10 ${className}`}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-6 w-6 text-blue-400" />
            <CardTitle className="text-xl font-semibold text-white">{title}</CardTitle>
          </div>
          <CardDescription className="text-sm text-gray-400">{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  )
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    name: string
    fill?: string
  }>
  label?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="bg-black bg-opacity-80 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-lg"
        >
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm flex items-center">
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.fill }}></span>
              <span className="text-gray-400">{item.name}: </span>
              <span className="text-blue-400 font-medium ml-1">{item.value}</span>
            </p>
          ))}
        </motion.div>
      </AnimatePresence>
    )
  }
  return null
}
