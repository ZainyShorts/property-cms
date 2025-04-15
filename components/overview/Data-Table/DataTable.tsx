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
  MousePointerIcon as MousePointerSquare,
  X,
  ClipboardCheck,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
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
  onShare? :(data : any) => void
  onEdit?: (row: string) => void
}

export function DataTable({ headers, data = [], page, setPage, Count, onAddButton, onDelete, onShare , onEdit }: DataTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const itemsPerPage = 10

  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set())

  // Get data keys excluding special fields
  const dataKeys = data.length > 0 ? Object.keys(data[0]).filter((key) => key !== "propertyImages") : []

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatId = (id: string) => {
    return id.slice(0, 4) + "..."
  }

  const totalPages = Math.ceil(Count / itemsPerPage) - 1

  const goToPage = (pageNumber: number) => {
    setPage(pageNumber)
  }

  const openDocumentModal = (rowId: string) => {
    setSelectedRowId(rowId)
    setIsModalOpen(true)
  }

  // Toggle row selection
  const toggleRowSelection = (rowIndex: number) => {
    if (!isSelectionMode) return

    const newSelectedRows = new Set(selectedRows)
    if (newSelectedRows.has(rowIndex)) {
      newSelectedRows.delete(rowIndex)
    } else {
      newSelectedRows.add(rowIndex)
    }
    setSelectedRows(newSelectedRows)
  }

  // Toggle column selection
  const toggleColumnSelection = (columnKey: string) => {
    if (!isSelectionMode) return

    const newSelectedColumns = new Set(selectedColumns)
    if (newSelectedColumns.has(columnKey)) {
      newSelectedColumns.delete(columnKey)
    } else {
      newSelectedColumns.add(columnKey)
    }
    setSelectedColumns(newSelectedColumns)
  }

  // Toggle selection mode
  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      setIsSelectionMode(false)
      setSelectedRows(new Set())
      setSelectedColumns(new Set())
    } else {
      setIsSelectionMode(true)
    }
  }

  // Get selected data (intersection of rows and columns)
  const getSelectedData = () => {
    const selectedData: any[] = []

    // If no rows or columns are selected, return empty array
    if (selectedRows.size === 0 || selectedColumns.size === 0) {
      return selectedData
    }

    // For each selected row
    Array.from(selectedRows).forEach((rowIndex) => {
      const rowData: any = {}
      const row = data[rowIndex]

      // Only include selected columns
      Array.from(selectedColumns).forEach((columnKey) => {
        if (row.hasOwnProperty(columnKey)) {
          rowData[columnKey] = row[columnKey]
        }
      })

      if (Object.keys(rowData).length > 0) {
        selectedData.push(rowData)
      }
    })

    return selectedData
  }

  const logSelectedData = () => {
    const selectedData = getSelectedData()
    onShare?.(selectedData); 
  
  }

  const isCellSelected = (rowIndex: number, columnKey: string) => {
    return selectedRows.has(rowIndex) && selectedColumns.has(columnKey)
  }

  const selectAllRows = () => {
    const allRows = new Set<number>()
    data.forEach((_, index) => allRows.add(index))
    setSelectedRows(allRows)
  }

  // Select all columns
  const selectAllColumns = () => {
    const allColumns = new Set<string>()
    dataKeys.forEach((key) => allColumns.add(key))
    setSelectedColumns(allColumns)
  }

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedRows(new Set())
    setSelectedColumns(new Set())
  }

  return (
    <>
      <div className="rounded-lg border shadow-sm">
        {/* Selection toolbar */}
        {isSelectionMode && (
          <div className="p-3 border-b border-border bg-muted/30">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap  items-center gap-2">
                <Badge variant="outline" className="px-2 py-1 text-xs font-medium bg-background">
                  Selection Mode
                </Badge>
                <div className="flex items-center flex-wrap gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllRows}
                    className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Select All Rows
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllColumns}
                    className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Select All Columns
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllSelections}
                    className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-2">
                {(selectedRows.size > 0 || selectedColumns.size > 0) && (
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                    {selectedRows.size} rows × {selectedColumns.size} columns
                  </Badge>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectionMode}
                  className="h-8 gap-1 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                  Exit Selection
                </Button>

                {selectedRows.size > 0 && selectedColumns.size > 0 && (
                  <Button variant="default" size="sm" onClick={logSelectedData} className="h-8 gap-1.5">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Export Selection
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main toolbar */}
        <div className="p-3 border-b border-border flex flex-wrap items-center justify-between gap-2 bg-muted/30">
          <div className="flex gap-2">
            {!isSelectionMode ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectionMode}
                      className="gap-1.5 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                    >
                      <MousePointerSquare className="h-4 w-4" />
                      Enable Selection
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Select specific rows and columns</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}

            {!isSelectionMode && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      className="gap-1.5 bg-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-black hover:text-foreground hover:bg-muted"
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
            )}
          </div>

          {!isSelectionMode && (
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
          )}
        </div>

        <div className="overflow-x-auto thin-scrollbar sm:mx-0">
          <div className="min-w-full inline-block align-middle">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  {isSelectionMode && (
                    <TableHead className="w-12 px-4 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap bg-muted/30">
                      <div className="flex items-center justify-center">
                        <span className="sr-only">Row selection</span>
                      </div>
                    </TableHead>
                  )}

                  {dataKeys.map((key, index) => (
                    <TableHead
                      key={index}
                      className={`px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-widest whitespace-nowrap font-bold ${
                        isSelectionMode
                          ? selectedColumns.has(key)
                            ? "bg-primary/10 border-b-2 border-primary/30"
                            : "bg-muted/30"
                          : "bg-muted/30"
                      }`}
                      onClick={() => toggleColumnSelection(key)}
                      style={{ cursor: isSelectionMode ? "pointer" : "default" }}
                    >
                      <div className="flex items-center gap-2">
                        {isSelectionMode && (
                          <div className="flex-shrink-0">
                            {selectedColumns.has(key) ? (
                              <div className="h-4 w-4 rounded border border-primary bg-primary/20 flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary" />
                              </div>
                            ) : (
                              <div className="h-4 w-4 rounded border border-muted-foreground/30 bg-background/80"></div>
                            )}
                          </div>
                        )}
                        <span className={isSelectionMode && selectedColumns.has(key) ? "text-primary font-bold" : ""}>
                          {key}
                        </span>
                      </div>
                    </TableHead>
                  ))}

                  {!isSelectionMode && (
                    <>
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
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                      isSelectionMode && selectedRows.has(rowIndex) ? "bg-primary/5" : ""
                    }`}
                  >
                    {isSelectionMode && (
                      <TableCell
                        className="w-12 px-4 py-4 whitespace-nowrap text-sm text-foreground"
                        onClick={() => toggleRowSelection(rowIndex)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex items-center justify-center">
                          {selectedRows.has(rowIndex) ? (
                            <div className="h-5 w-5 rounded border border-primary bg-primary/20 flex items-center justify-center">
                              <Check className="h-3.5 w-3.5 text-primary" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded border border-muted-foreground/30 bg-background/80"></div>
                          )}
                        </div>
                      </TableCell>
                    )}

                    {Object.entries(row)
                      .filter(([key]) => key !== "propertyImages")
                      .map(([key, val]: [string, any], index) => {
                        const isSelected = isCellSelected(rowIndex, key)
                        const isRowSelected = selectedRows.has(rowIndex)
                        const isColumnSelected = selectedColumns.has(key)

                        return (
                          <TableCell
                            key={index}
                            className={`px-6 py-4 whitespace-nowrap text-sm ${
                              isSelectionMode
                                ? isSelected
                                  ? "bg-primary/20 font-medium"
                                  : isRowSelected || isColumnSelected
                                    ? "bg-primary/5"
                                    : ""
                                : ""
                            } ${
                              isSelectionMode && isSelected
                                ? "border border-primary/30"
                                : isSelectionMode && (isRowSelected || isColumnSelected)
                                  ? "border-transparent"
                                  : ""
                            }`}
                            onClick={(e) => {
                              if (isSelectionMode) {
                                // If we click on a cell, we want to select both the row and column
                                if (!selectedRows.has(rowIndex) && !selectedColumns.has(key)) {
                                  toggleRowSelection(rowIndex)
                                  toggleColumnSelection(key)
                                } else if (selectedRows.has(rowIndex) && !selectedColumns.has(key)) {
                                  toggleColumnSelection(key)
                                } else if (!selectedRows.has(rowIndex) && selectedColumns.has(key)) {
                                  toggleRowSelection(rowIndex)
                                }
                              }
                            }}
                            style={{ cursor: isSelectionMode ? "pointer" : "default" }}
                          >
                            {key === "_id" ? (
                              <div className="flex items-center space-x-2">
                                <span>{formatId(val)}</span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleCopy(val)
                                        }}
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
                                  <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
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
                        )
                      })}

                    {!isSelectionMode && (
                      <>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              openDocumentModal(row._id)
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation()
                              onEdit && onEdit(row)
                            }}
                            className="hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <FilePenLine className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete && onDelete(row._id)
                            }}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/dashboard/properties/${row._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {!isSelectionMode && (
          <div className="p-3 sm:p-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30">
            <span></span> {/* Empty span to maintain layout */}
            <div className="flex justify-center items-center flex-wrap gap-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground ml-0 sm:ml-2 mt-1 sm:mt-0 w-full sm:w-auto text-center sm:text-left">
                {data.length} records
              </span>
            </div>
          </div>
        )}
      </div>

      <DocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} rowId={selectedRowId} />
    </>
  )
}
