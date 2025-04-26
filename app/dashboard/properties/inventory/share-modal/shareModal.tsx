"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, FileText, ImageIcon, Mail, Share2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  onShare: (options: ShareOptions) => void
}

export interface ShareOptions {
  format: "pdf" | "word" | "jpg" | "excell"
  method: "whatsapp" | "gmail"
}

export function ShareModal({ isOpen, onClose, onShare }: ShareModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ShareOptions["format"] | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<ShareOptions["method"] | null>(null)

  const handleShare = () => {
    if (selectedFormat && selectedMethod) {
      onShare({
        format: selectedFormat,
        method: selectedMethod,
      })
      onClose()
    }
  }

  const resetSelections = () => {
    setSelectedFormat(null)
    setSelectedMethod(null)
  }

  const handleClose = () => {
    resetSelections()
    onClose()
  }

  const formatOptions = [
    {
      id: "pdf",
      label: "PDF Document",
      description: "Share as a PDF document",
      icon: <FileText className="h-6 w-6 text-red-500" />,
    },
    {
      id: "word",
      label: "Word Document",
      description: "Share as a Word document",
      icon: <FileText className="h-6 w-6 text-blue-500" />,
    },
    {
      id: "jpg",
      label: "JPG Image",
      description: "Share as a JPG image",
      icon: <ImageIcon className="h-6 w-6 text-green-500" />,
    }, 
    {
      id: "xlxs",
      label: "Excell File",
      description: "Share as a Excell document",
      icon: <FileText className="h-6 w-6 text-green-500" />,
    },
  ]

  const methodOptions = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      description: "Share via WhatsApp",
      icon: (
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-500 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </div>
      ),
    },
    {
      id: "gmail",
      label: "Gmail",
      description: "Share via Gmail",
      icon: <Mail className="h-6 w-6 text-red-500" />,
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Share2 className="h-5 w-5" />
            Share Property Data
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div>
            <h3 className="text-sm font-medium mb-3">Select Format</h3>
            <div className="grid gap-3">
              {formatOptions.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    selectedFormat === option.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-muted/50",
                  )}
                  onClick={() => setSelectedFormat(option.id as ShareOptions["format"])}
                >
                  <div className="flex-shrink-0">{option.icon}</div>
                  <div className="flex-grow">
                    <h4 className="font-medium">{option.label}</h4>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {selectedFormat === option.id ? (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-muted-foreground/30"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Share Via</h3>
            <div className="grid gap-3">
              {methodOptions.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    selectedMethod === option.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-muted/50",
                  )}
                  onClick={() => setSelectedMethod(option.id as ShareOptions["method"])}
                >
                  <div className="flex-shrink-0">{option.icon}</div>
                  <div className="flex-grow">
                    <h4 className="font-medium">{option.label}</h4>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {selectedMethod === option.id ? (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-muted-foreground/30"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleClose} className="gap-1">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={!selectedFormat || !selectedMethod} className="gap-1.5">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
