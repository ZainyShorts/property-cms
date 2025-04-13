"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, File, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  rowId: string | null
}

interface UploadedDocument {
  id: string
  name: string
  file: File
  preview?: string
}

export default function DocumentModal({ isOpen, onClose, rowId }: DocumentModalProps) {
  const [documentName, setDocumentName] = useState("")
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).slice(0, 3 - uploadedDocuments.length)

      const newDocuments = newFiles.map((file) => {
        const doc: UploadedDocument = {
          id: Math.random().toString(36).substring(2, 9),
          name: documentName || file.name,
          file: file,
        }

        // Create preview for image files
        if (file.type.startsWith("image/")) {
          doc.preview = URL.createObjectURL(file)
        }

        return doc
      })

      setUploadedDocuments((prev) => [...prev, ...newDocuments].slice(0, 3))
      setDocumentName("")

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeDocument = (id: string) => {
    setUploadedDocuments((prev) => {
      const filtered = prev.filter((doc) => doc.id !== id)

      // Revoke object URLs to prevent memory leaks
      const docToRemove = prev.find((doc) => doc.id === id)
      if (docToRemove?.preview) {
        URL.revokeObjectURL(docToRemove.preview)
      }

      return filtered
    })
  }

  const handleSubmit = () => {
    // Here you would typically upload the documents to your server
    console.log("Uploading documents for row ID:", rowId)
    console.log("Documents:", uploadedDocuments)

    // Close the modal and reset state
    onClose()
    setUploadedDocuments([])
    setDocumentName("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Upload Documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="document-name">Document Name</Label>
            <Input
              id="document-name"
              placeholder="Enter document name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Document</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="document-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                disabled={uploadedDocuments.length >= 3}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-dashed border-2 h-24 flex flex-col items-center justify-center gap-2"
                disabled={uploadedDocuments.length >= 3}
              >
                <Upload className="h-6 w-6" />
                <span className="text-sm text-center">
                  {uploadedDocuments.length >= 3 ? "Maximum 3 files allowed" : "Click to upload document"}
                </span>
              </Button>
            </div>
          </div>

          {uploadedDocuments.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Documents</Label>
              <div className="space-y-2">
                {uploadedDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                    <div className="flex-shrink-0">
                      {doc.preview ? (
                        <div className="h-10 w-10 rounded overflow-hidden">
                          <img
                            src={doc.preview || "/placeholder.svg"}
                            alt={doc.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <File className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{(doc.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDocument(doc.id)}
                      className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="sm:w-auto w-full">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="sm:w-auto w-full bg-black text-white dark:bg-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80"
            disabled={uploadedDocuments.length === 0}
          >
            Save Documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
