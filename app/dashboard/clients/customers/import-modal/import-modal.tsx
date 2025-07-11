"use client"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileSpreadsheet, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "react-toastify"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ImportCustomersModalProps {
  isOpen: boolean
  onClose: () => void
  fetchRecords: any
}

interface ImportResponse {
  success: boolean
  insertedEntries: number
  skippedDuplicateEntires: number
  totalEntries: number
}

export function ImportCustomersModal({ isOpen, onClose, fetchRecords }: ImportCustomersModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const { data: authData } = useSWR("/api/me", fetcher)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setUploadStatus("idle")
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  })

 const handleUpload = async () => {
  if (!file) return;

  setUploading(true);
  setUploadProgress(0);

  try {
    const formData = new FormData();
    formData.append("file", file);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);

    const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_SERVER}/customer/import`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${authData?.token}`,
      },
    });

    clearInterval(interval);
    setUploadProgress(100);

    const data = await response.json();
    console.log("response data:", data);

    if (!response.ok) {
      setUploadStatus("error");

      toast.error(data.message || "Invalid file format or headers", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      return; // Don't proceed to success UI
    }

    // ✅ 200 - Success
    setUploadStatus("success");
    fetchRecords();

    toast.success(data.message || "Import successful", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    setTimeout(() => {
      handleClose();
    }, 1500);
  } catch (error) {
    console.error("Upload error:", error);
    setUploadStatus("error");

    toast.error(
      "There was an error importing your customer data. Please try again.",
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  } finally {
    setUploading(false);
  }
};


  const handleClose = () => {
    setFile(null)
    setUploadProgress(0)
    setUploadStatus("idle")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Customer Records
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 transition-colors
              ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
              ${file ? "bg-primary/5 border-primary" : ""}
              hover:border-primary hover:bg-primary/5
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              {file ? (
                <>
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {isDragActive ? "Drop the file here" : "Drag & drop your file here"}
                  </p>
                  <p className="text-xs text-muted-foreground">Supports Excel (.xlsx) and CSV files</p>
                </>
              )}
            </div>
          </div>
          {file && (
            <div className="space-y-2">
              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">Uploading... {uploadProgress}%</p>
                </div>
              )}
              {uploadStatus === "success" && (
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <p className="text-sm">Upload successful!</p>
                </div>
              )}
              {uploadStatus === "error" && (
                <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">Upload failed. Please try again.</p>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading} className="gap-2">
            {uploading ? (
              <>
                <Upload className="h-4 w-4 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
