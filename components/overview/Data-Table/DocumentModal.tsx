"use client"

import type React from "react"

import { useState, useRef } from "react"
import axios from "axios"
import { Upload, File, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the file type enum
export enum FileType {
  DOCX = "docx",
  XLSX = "xlsx",
  CSV = "csv",
  IMAGE = "image",
  PDF = "pdf",
  VIDEO = "mp4",
}

// Define the document data interface that will be returned to the parent
export interface DocumentData {
  refId: string
  documentUrl: string
  title: string
  type: FileType
}

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  rowId: string | null
  onDocumentSave: (documentData: DocumentData) => void
}

interface UploadedDocument {
  id: string
  file: File
  preview?: string
  awsUrl?: string
  key?: string
  title: string
  type: FileType
}

const uploadFileToAWS = async (file: File, setUploadProgress: (progress: number) => void): Promise<any> => {
  try {
    const formData = new FormData()
    formData.append("file", file)
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_PLUDO_SERVER}/aws/signed-url?fileName=${file.name}&contentType=${file.type}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    const signedUrl = response.data.msg.url

    const uploadResponse = await axios.put(signedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(progress)
        }
      },
    })

    if (uploadResponse.status === 200) {
      return { awsUrl: signedUrl.split("?")[0], key: response.data.msg.key }
    } else {
      throw new Error("Failed to upload file")
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload file")
  }
}

// Helper function to determine file type from extension
const getFileTypeFromExtension = (fileName: string): FileType | null => {
  const extension = fileName.split(".").pop()?.toLowerCase() || ""

  if (extension === "docx") return FileType.DOCX
  if (extension === "xlsx") return FileType.XLSX
  if (extension === "csv") return FileType.CSV
  if (extension === "mp4") return FileType.VIDEO
  if (["jpg", "jpeg", "png", "gif", "webp", "avif"].includes(extension)) return FileType.IMAGE
  if (extension === "pdf") return FileType.PDF

  return null
}

const getAcceptAttributeForType = (type: FileType | ""): string => {
  switch (type) {
    case FileType.DOCX:
      return ".docx"
    case FileType.XLSX:
      return ".xlsx"
    case FileType.CSV:
      return ".csv"
    case FileType.IMAGE:
      return ".jpg,.jpeg,.png,.gif,.webp,.avif"
    case FileType.PDF:
      return ".pdf"
    case FileType.VIDEO:
      return ".mp4"
    default:
      return ".pdf,.docx,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.webp,.avif,.mp4"
  }
}

export default function DocumentModal({ isOpen, onClose, rowId, onDocumentSave }: DocumentModalProps) {
  const [documentTitle, setDocumentTitle] = useState("")
  const [documentType, setDocumentType] = useState<FileType | "">("")
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      // Detect file type from extension
      const detectedType = getFileTypeFromExtension(file.name)

      if (!detectedType) {
        alert("Invalid file type. Please upload DOCX, XLSX, CSV, Image, or PDF files.")
        return
      }

      // Set the detected type in the dropdown
      setDocumentType(detectedType)

      const doc: UploadedDocument = {
        id: Math.random().toString(36).substring(2, 9),
        file: file,
        title: documentTitle || file.name.split(".")[0],
        type: detectedType,
      }

      if (file.type.startsWith("image/")) {
        doc.preview = URL.createObjectURL(file)
      }

      setUploadedDocument(doc)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeDocument = () => {
    if (uploadedDocument?.preview) {
      URL.revokeObjectURL(uploadedDocument.preview)
    }
    setUploadedDocument(null)
    setDocumentType("")
  }

  const handleSubmit = async () => {
    if (!uploadedDocument || !rowId || !documentType) return

    setIsUploading(true)

    try {
      // Update document title and type if changed
      const docWithTitle = {
        ...uploadedDocument,
        title: documentTitle || uploadedDocument.title,
        type: documentType as FileType,
      }

      // Upload the document to AWS
      const updateDocumentProgress = (progress: number) => {
        setUploadProgress(progress)
      }

      // Upload the document
      const result = await uploadFileToAWS(docWithTitle.file, updateDocumentProgress)

      // Create the document data to return to parent
      const documentData: DocumentData = {
        refId: rowId,
        documentUrl: result.awsUrl,
        title: docWithTitle.title,
        type: docWithTitle.type,
      }

      // Pass the document data to the parent component
      onDocumentSave(documentData)

      // Reset state and close modal
      onClose()
      setUploadedDocument(null)
      setDocumentTitle("")
      setDocumentType("")
      setUploadProgress(0)
    } catch (error) {
      console.error("Error uploading document:", error)
      alert("Failed to upload document. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Upload Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="document-title">Document Title</Label>
            <Input
              id="document-title"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="Enter document title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select value={documentType} onValueChange={(value) => setDocumentType(value as FileType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FileType.DOCX}>DOCX</SelectItem>
                <SelectItem value={FileType.XLSX}>XLSX</SelectItem>
                <SelectItem value={FileType.CSV}>CSV</SelectItem>
                <SelectItem value={FileType.IMAGE}>Image</SelectItem>
                <SelectItem value={FileType.PDF}>PDF</SelectItem>
                <SelectItem value={FileType.VIDEO}>Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center">
            <Input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="document-upload"
              accept={getAcceptAttributeForType(documentType as FileType)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-full p-0 flex items-center justify-center"
            >
              <Upload className="h-5 w-5" />
              <span className="sr-only">Upload document</span>
            </Button>
          </div>

          {uploadedDocument && (
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
              <div className="flex-shrink-0">
                {uploadedDocument.preview ? (
                  <div className="h-10 w-10 rounded overflow-hidden">
                    <img
                      src={uploadedDocument.preview || "/placeholder.svg"}
                      alt={uploadedDocument.file.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <File className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{uploadedDocument.file.name.slice(0, 30)}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {(uploadedDocument.file.size / 1024).toFixed(1)} KB
                </p>
                {uploadProgress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeDocument}
                className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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
            disabled={!uploadedDocument || !documentType || isUploading}
          >
            {isUploading ? "Uploading..." : "Save Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
