"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Copy, Trash2 } from "lucide-react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { DeleteConfirmationModal } from "../../properties/master-development/delete-confirmation-modal"

interface Document {
  _id: string
  refId: string
  type: string
  documentUrl: string
  title: string
  createdAt: string
  updatedAt: string
  __v: number
}

interface ApiResponse {
  data: Document[]
  totalCount: number
  totalPages: number
  pageNumber: number
}

export default function DocumentsPage() {
  const [refId, setRefId] = useState("")
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)

  const fetchDocuments = async () => {
    if (!refId.trim()) {
      toast.error("Please enter a reference ID")
      return
    }

    setLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_SERVER}/document/byRefId/${refId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch documents")
      }

      const data: ApiResponse = await response.json()
      setDocuments(data.data)

      if (data.data.length === 0) {
        toast.info("No documents found for this reference ID")
      } else {
        toast.success(`Found ${data.data.length} document(s)`)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
      toast.error("Failed to load documents. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (id: string) => {
    setDocumentToDelete(id)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setDocumentToDelete(null)
  }

  const confirmDelete = async () => {
    if (!documentToDelete) return

    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_SERVER}/document/${documentToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete document")
      }

      // Remove the document from the local state
      setDocuments(documents.filter((doc) => doc._id !== documentToDelete))
      toast.success("Document deleted successfully")
    } catch (error) {
      console.error("Error deleting document:", error)
      toast.error("Failed to delete document. Please try again.")
    } finally {
      setLoading(false)
      closeDeleteModal()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.info("Copied to clipboard")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchDocuments()
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Document Finder</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Input
            placeholder="Enter reference ID"
            value={refId}
            onChange={(e) => setRefId(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow"
          />
          <Button onClick={fetchDocuments} disabled={loading} className="min-w-[120px]">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Load Documents"}
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden border-gray-200 dark:border-gray-800">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !hasSearched ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">Documents will be shown here</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">No documents found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 text-sm">
                  <tr>
                    {Object.keys(documents[0]).map(
                      (key) =>
                        key !== "__v" && (
                          <th key={key} className="px-4 py-3 text-left font-medium whitespace-nowrap">
                            {key === "_id"
                              ? "ID"
                              : key === "refId"
                                ? "Reference ID"
                                : key === "documentUrl"
                                  ? "Document URL"
                                  : key === "createdAt"
                                    ? "Created At"
                                    : key === "updatedAt"
                                      ? "Updated At"
                                      : key.charAt(0).toUpperCase() + key.slice(1)}
                          </th>
                        ),
                    )}
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr
                      key={doc._id}
                      className="border-t border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 text-sm"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="truncate max-w-[120px]">{doc._id}</span>
                          <button
                            onClick={() => copyToClipboard(doc._id)}
                            className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            aria-label="Copy ID"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="truncate max-w-[120px]">{doc.refId}</span>
                          <button
                            onClick={() => copyToClipboard(doc.refId)}
                            className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            aria-label="Copy Reference ID"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{doc.type}</td>
                      <td className="px-4 py-3">
                        <a
                          href={doc.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px] inline-block"
                        >
                          {doc.documentUrl}
                        </a>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{doc.title}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(doc.updatedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteModal(doc._id)}
                          className="flex items-center"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal isOpen={deleteModalOpen} onClose={closeDeleteModal} onConfirm={confirmDelete} />

      
    </div>
  )
}
