"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { Slider } from "@/components/ui/slider"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmitExport: (withFilters: boolean, count: number) => void 
}

interface ExportOptionProps {
  title: string
  description: string
  onClick: () => void
}

function ExportOption({ title, description, onClick }: ExportOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col rounded-md border border-muted/50 p-4 hover:border-primary"
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  )
}

export function ExportModal({ isOpen, onClose, onSubmitExport }: ExportModalProps) {
  const [recordCount, setRecordCount] = useState(100)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="relative">
          <DialogTitle className="text-xl font-semibold">Export Properties</DialogTitle>
          <DialogDescription className="text-muted-foreground">Choose your preferred export option</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Records to export: {recordCount}</span>
              <span className="text-muted-foreground">Max: 1000</span>
            </div>
            <Slider
              defaultValue={[100]}
              max={1000}
              step={10}
              value={[recordCount]}
              onValueChange={(value) => setRecordCount(value[0])}
              className="w-full"
            />
          </div>

          <div className="grid gap-4">
            <ExportOption
              title="Export With Current Filteration"
              description="Export only the properties that match your current filters"
              onClick={() => onSubmitExport(true, recordCount)}
            />
            <ExportOption
              title="Export Without Filteration"
              description="Export all properties regardless of filters"
              onClick={() => onSubmitExport(false, recordCount)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

