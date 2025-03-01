"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown, ChevronRight, Filter, MoreHorizontal, Plus, CalendarIcon, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"
import Link from "next/link"

interface FilterOption {
  key: string
  label: string
  options: string[]
}

interface BreadcrumbItem {
  label: string
  href: string
}

interface FilterBarProps {
  filters: FilterOption[]
  breadcrumbs: BreadcrumbItem[]
  onAddButton: () => void
  onFilter: () => void
  onSearch?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFilterChange?: (key: string, value: string) => void
  showDatePickers?: boolean
  onApplyFilters: () => void
  startDate?: Date | null
  endDate?: Date | null
  onStartDateChange?: (date: Date | null) => void
  onEndDateChange?: (date: Date | null) => void
  onClear?: () => void
  selectedOptions: Record<string, string>
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>
}

export function FilterBar({
  filters,
  breadcrumbs,
  onAddButton,
  onFilter,
  onSearch,
  onFilterChange,
  showDatePickers = false,
  onApplyFilters,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  selectedOptions,
  setSelectedOptions,
}: FilterBarProps) {
  const handleOptionSelect = (key: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [key]: value }))
    if (onFilterChange) {
      onFilterChange(key, value)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1">
                {breadcrumbs.map((item, index) => (
                  <li key={index} className="inline-flex items-center">
                    {index > 0 && <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />}
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-muted">
                      <Plus className="h-4 w-4 text-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Quick add</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-muted">
                      <MoreHorizontal className="h-4 w-4 text-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More options</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="default"
                className="gap-2 bg-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-black hover:text-foreground hover:bg-muted"
                onClick={onAddButton}
              >
                Add record
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center gap-4">
          {filters.map((filter, index) => (
            <DropdownMenu key={index}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted">
                  {selectedOptions[filter.key] || filter.label}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {filter.options.map((option, optionIndex) => (
                  <DropdownMenuItem key={optionIndex} onSelect={() => handleOptionSelect(filter.key, option)}>
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

          {showDatePickers && (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    {startDate ? format(startDate, "PPP") : "Start Date"}
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate || undefined}
                    onSelect={(date) => onStartDateChange?.(date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    {endDate ? format(endDate, "PPP") : "End Date"}
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate || undefined}
                    onSelect={(date) => onEndDateChange?.(date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </>
          )}

          <div className="ml-auto flex items-center gap-4">
            <TooltipProvider>
              {onSearch && (
                <input
                  type="text"
                  placeholder="Search records"
                  onChange={onSearch}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onFilter} variant="outline" size="icon" className="hover:bg-muted">
                    <Filter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter records</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onClear} variant="outline" size="icon" className="hover:bg-muted">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear Filters</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              className="gap-2 bg-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-black hover:text-foreground hover:bg-muted"
              onClick={onApplyFilters}
              variant="default"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

