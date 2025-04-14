"use client"

import type React from "react"

import { useState, useRef, type KeyboardEvent } from "react"
import { Upload, File, Trash2, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  rowId: string | null
}

interface UploadedDocument {
  id: string
  file: File
  preview?: string
}

export default function DocumentModal({ isOpen, onClose, rowId }: DocumentModalProps) {
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).slice(0, 3 - uploadedDocuments.length)

      const newDocuments = newFiles.map((file) => {
        const doc: UploadedDocument = {
          id: Math.random().toString(36).substring(2, 9),
          file: file,
        }

        // Create preview for image files
        if (file.type.startsWith("image/")) {
          doc.preview = URL.createObjectURL(file)
        }

        return doc
      })

      setUploadedDocuments((prev) => [...prev, ...newDocuments].slice(0, 3))

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

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      addTag(tagInput.trim())
      setTagInput("")
    }
  }

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags((prev) => [...prev, tag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = () => {
    // Here you would typically upload the documents to your server
    console.log("Uploading documents for row ID:", rowId)
    console.log("Documents:", uploadedDocuments)
    console.log("Tags:", tags)

    // Close the modal and reset state
    onClose()
    setUploadedDocuments([])
    setTags([])
    setTagInput("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Upload Documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tags-input">Tags</Label>
            <div className="space-y-2">
              <Input
                id="tags-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type tag and press Enter"
              />

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 rounded-full hover:bg-muted p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
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
            <div className="space-y-2 max-h-[100px] overflow-y-auto">
              <Label>Uploaded Documents</Label>
              <div className="space-y-2">
                {uploadedDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                    <div className="flex-shrink-0">
                      {doc.preview ? (
                        <div className="h-10 w-10 rounded overflow-hidden">
                          <img
                            src={doc.preview || "/placeholder.svg"}
                            alt={doc.file.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <File className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.file.name}</p>
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
