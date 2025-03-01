"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Copy, Check, FilePenLine, ChevronLeft, ChevronRight, ChevronDown, ExternalLink } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface DataTableProps {
  headers: string[]
  data?: any[]
  onAddButton?: () => void
  onDelete?: (id: string) => void
  onEdit?: (row: string) => void
}

export function DataTable({ headers, data = [], onAddButton, onDelete, onEdit }: DataTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatId = (id: string) => {
    return id.slice(0, 4) + "..."
  }

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  } 
  console.log(currentData);

  return (
    <div className="rounded-lg border bg-background shadow-sm">
      <div className="overflow-x-auto thin-scrollbar">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              {headers.map((header, index) => (
                <TableHead
                  key={index}
                  className="px-6 py-3 text-left text-xs  text-muted-foreground uppercase tracking-widest whitespace-nowrap font-bold  bg-muted/30"
                >
                  {header}
                </TableHead>
              ))}
              <TableHead className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap bg-muted/30">
                Edit
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap bg-muted/30">
                Actions
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap bg-muted/30">
                   View
              </TableHead>
              
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                {Object.entries(row).map(([key, val]: [string, any], index) => (
                  <TableCell key={index} className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {key === "_id" ? (
                      <div className="flex items-center space-x-2">
                        <span>{formatId(val)}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopy(val)}
                                className="h-6 w-6 p-0 hover:bg-muted"
                              >
                                {copiedId === val ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{copiedId === val ? "Copied" : "Copy"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ) : key === "unitView" && Array.isArray(val) ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            View <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {val.map((item: string, i: number) => (
                            <div key={i} className="px-2 py-1 text-sm">
                              {item}
                            </div>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      val
                    )}
                  </TableCell>
                ))}
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit && onEdit(row)}
                    className="hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <FilePenLine className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete && onDelete(row._id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                <Link href={`/dashboard/properties/${row._id}`}>
                <ExternalLink className="h-4 w-4"  />
                </Link>

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between bg-muted/30">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                className="gap-2 bg-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-black hover:text-foreground hover:bg-muted"
                onClick={onAddButton}
              >
                <Plus className="h-4 w-4" />
                Add record
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add a new record to the table</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => goToPage(page)}
              className={`w-8 h-8 ${currentPage === page ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
        </div>
      </div>
    </div>
  )
}

