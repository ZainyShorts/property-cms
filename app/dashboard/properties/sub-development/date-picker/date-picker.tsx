"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface SimpleDatePickerProps {
  date: Date | null
  setDate: (date: Date | null) => void
  placeholder: string
  className?: string
}

export function SimpleDatePicker({ date, setDate, placeholder, className }: SimpleDatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-[180px] justify-start text-left font-normal", !date && "text-muted-foreground", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMM dd, yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
