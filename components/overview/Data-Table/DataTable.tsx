"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Trash2,
  Copy,
  Check,
  FilePenLine,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  FileText,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import DocumentModal from "./DocumentModal"

interface DataTableProps {
  headers: string[]
  data?: any[]
  page?: any
  setPage: any
  Count: any
  onAddButton?: () => void
  onDelete?: (id: string) => void
  onEdit?: (row: string) => void
}

export function DataTable({ headers, data = [], page, setPage, Count, onAddButton, onDelete, onEdit }: DataTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  //const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatId = (id: string) => {
    return id.slice(0, 4) + "..."
  }

  const totalPages = Math.ceil(Count / itemsPerPage) - 1
  //const startIndex = (currentPage - 1) * itemsPerPage
  //const endIndex = startIndex + itemsPerPage
  //const currentData = data.slice(startIndex, endIndex)

  const goToPage = (pageNumber: number) => {
    setPage(pageNumber)
  }

  const openDocumentModal = (rowId: string) => {
    setSelectedRowId(rowId)
    setIsModalOpen(true)
  }

  console.log(data)

  return (
    <>
      <div className="rounded-lg border shadow-sm">
        <div className="overflow-x-auto thin-scrollbar sm:mx-0">
          <div className="min-w-full inline-block align-middle">
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
                    Upload Documents
                  </TableHead>
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
                {data.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                   {Object.entries(row)
  .filter(([key]) => key !== "propertyImages") 
  .map(([key, val]: [string, any], index) => (
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
                        variant="outline"
                        size="sm"
                        onClick={() => openDocumentModal(row._id)}
                        className="bg-black text-white dark:bg-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Documents
                      </Button>
                    </TableCell>
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
                    <Link href={`/dashboard/properties/${row._id}`} target="_blank" rel="noopener noreferrer">
  <ExternalLink className="h-4 w-4" />
</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="p-3 sm:p-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30">
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

          <div className="flex justify-center items-center flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="hover:bg-muted h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {totalPages <= 3 ? (
              // If 3 or fewer pages on mobile, 5 or fewer on desktop, show all page numbers
              Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={page === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNumber)}
                  className={`min-w-7 sm:min-w-8 ${page === pageNumber ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  {pageNumber}
                </Button>
              ))
            ) : (
              // If more than 3 pages on mobile, 5 on desktop, show simplified pagination
              <>
                {/* Always show page 1 */}
                <Button
                  variant={page === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(1)}
                  className={`min-w-7 sm:min-w-8 ${page === 1 ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  1
                </Button>

                {/* Show ellipsis if current page > 3 */}
                {page > 3 && <span className="px-2 text-muted-foreground">...</span>}

                {/* Show current page and surrounding pages */}
                {page > 2 && page < totalPages - 1 && (
                  <>
                    {page > 3 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(page - 1)}
                        className="min-w-7 sm:min-w-8 hover:bg-muted hidden sm:inline-flex"
                      >
                        {page - 1}
                      </Button>
                    )}

                    <Button
                      variant="default"
                      size="sm"
                      className="min-w-7 sm:min-w-8 bg-primary text-primary-foreground"
                    >
                      {page}
                    </Button>

                    {page < totalPages - 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(page + 1)}
                        className="min-w-7 sm:min-w-8 hover:bg-muted hidden sm:inline-flex"
                      >
                        {page + 1}
                      </Button>
                    )}
                  </>
                )}

                {/* Show ellipsis if current page < totalPages - 2 */}
                {page < totalPages - 2 && <span className="px-2 text-muted-foreground">...</span>}

                {/* Always show last page */}
                <Button
                  variant={page === totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  className={`min-w-7 sm:min-w-8 ${page === totalPages ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  {totalPages}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages || totalPages === 0}
              className="hover:bg-muted h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <span className="text-sm text-muted-foreground ml-0 sm:ml-2 mt-1 sm:mt-0 w-full sm:w-auto text-center sm:text-left">
              Page {page} of {totalPages || 1}
            </span>
          </div>
        </div>
      </div>

      <DocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} rowId={selectedRowId} />
    </>
  )
}
