"use client"

import { FileUp, Plus } from 'lucide-react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onManualSelect: () => void
  onFileSelect: () => void
}

export function SelectionModal({ isOpen, onClose, onManualSelect, onFileSelect }: SelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-black dark:text-white"
      >
        <div className="grid gap-6 py-4">
          <h2 className="text-lg font-semibold text-center text-black dark:text-white">
            Add New Property
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <Button
              variant="outline"
              className="h-24 border border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 text-black dark:text-white"
              onClick={onManualSelect}
            >
              <div className="flex flex-col items-center gap-2">
                <Plus className="h-6 w-6" />
                <span>Add Manually</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-24 border border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 text-black dark:text-white"
              onClick={onFileSelect}
            >
              <div className="flex flex-col items-center gap-2">
                <FileUp className="h-6 w-6" />
                <span>Upload Excel File</span>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
