"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface AssignedPropertiesModalProps {
  isOpen: boolean
  onClose: () => void
  assignedProperties: Array<{ id: string; name: string; propertyName: string }>
}

export function AssignedPropertiesModal({ isOpen, onClose, assignedProperties }: AssignedPropertiesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cannot Delete Customer</DialogTitle>
          <DialogDescription>
            This customer is currently assigned to the following properties. Please remove them from these properties
            before attempting to delete.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {assignedProperties.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {assignedProperties.map((prop, index) => (
                <li key={index} className="text-sm">
                  <strong>{prop.name}</strong>: {prop.propertyName}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No assigned properties found.</p>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
