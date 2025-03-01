"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"

export function PropertyCard({ data }: { data: any }) {
  const isArray = (value: any) => Array.isArray(value)
  const isObject = (value: any) => typeof value === "object" && value !== null && !Array.isArray(value)

  const renderValue = (value: any) => {
    if (isArray(value)) {
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item: any, index: number) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground transition-colors"
            >
              {item}
            </Badge>
          ))}
        </div>
      )
    } else if (isObject(value)) {
      return Object.entries(value).map(([subKey, subValue]: [string, any]) => (
        <div key={subKey} className="pl-4 border-l-2 border-primary/20 mt-2">
          <span className="text-sm font-medium text-primary">{subKey}: </span>
          <span className="text-sm">{renderValue(subValue)}</span>
        </div>
      ))
    } else {
      return <span className="text-foreground/80">{value}</span>
    }
  }

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="h-full">
      <Card className="overflow-hidden h-full bg-card dark:bg-card/5 hover:shadow-xl transition-all duration-300 border-primary/10">
        {data.image && (
          <div className="relative aspect-[4/3] overflow-hidden group">
            <Image
              src={data.image || "/placeholder.svg"}
              alt="Property"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}

        <CardContent className="p-6 space-y-6">
          {Object.entries(data).map(([key, value]: [string, any]) => {
            if (key === "image") return null
            return (
              <div key={key} className="space-y-2">
                <CardHeader className="flex flex-row items-center justify-between p-0">
                  <h3 className="font-semibold text-lg tracking-tight capitalize text-primary">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </h3>
                  <ChevronRight className="h-4 w-4 text-primary/50" />
                </CardHeader>
                <div className="text-sm text-muted-foreground">{renderValue(value)}</div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </motion.div>
  )
}

