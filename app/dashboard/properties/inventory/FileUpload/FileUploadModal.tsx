"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileUp, X, Upload } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_CMS_SERVER}/property/updateBulkRecord`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
       console.log(response);
      if (response.data.success) {
        toast.success("File uploaded and processed successfully!")
        onClose()
      } else {
        toast.error("Failed to process the file. Please try again.")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("An error occurred while uploading the file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>Upload Excel File</DialogTitle>
        </DialogHeader>
        <div
          className={`mt-4 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 transition-colors ${
            dragActive ? "border-primary bg-accent" : "border-muted bg-muted/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!file ? (
            <>
              <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center mb-2">
                Drag and drop your Excel file here, or click to select
              </p>
              <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleChange} id="file-upload" />
              <Button
                variant="outline"
                className="border-input hover:bg-accent"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Select File
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Upload className="h-4 w-4" />
                {file.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload File"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

