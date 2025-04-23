"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Download } from "lucide-react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { DeleteConfirmationModal } from "../../properties/master-development/delete-confirmation-modal"

interface Document {
  _id: any
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
                <thead className="bg-gray-50 dark:bg-gray-900 text-sm ">
                  <tr className="w-full">
                    <th className="px-6 py-3 text-center font-medium whitespace-nowrap">Title</th>
                    <th className="px-6 py-3 text-center font-medium whitespace-nowrap">Type</th>
                    <th className="px-6 py-3 text-center font-medium whitespace-nowrap">Document</th>
                    <th className="px-6 py-3 text-center font-medium whitespace-nowrap">Created At</th>
                    <th className="px-6 py-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr
                      key={doc._id}
                      className="border-t border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 text-sm"
                    >
                      <td className="px-6 py-3 text-center">{doc.title}</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">
                        <div className="flex justify-center">
                          <span
                            className={`px-3 py-1.5 rounded-md text-white font-medium flex items-center gap-1.5 ${
                              doc.type.toLowerCase().includes("pdf")
                                ? "bg-gradient-to-r from-red-500 to-red-600 shadow-sm shadow-red-200 dark:shadow-red-900/20"
                                : doc.type.toLowerCase().includes("doc")
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm shadow-blue-200 dark:shadow-blue-900/20"
                                  : doc.type.toLowerCase().includes("xls")
                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/20"
                                    : doc.type.toLowerCase().includes("jpg") ||
                                        doc.type.toLowerCase().includes("jpeg") ||
                                        doc.type.toLowerCase().includes("png") ||
                                        doc.type.toLowerCase().includes("gif")
                                      ? "bg-gradient-to-r from-purple-500 to-purple-600 shadow-sm shadow-purple-200 dark:shadow-purple-900/20"
                                      : doc.type.toLowerCase().includes("mp4") ||
                                          doc.type.toLowerCase().includes("mov") ||
                                          doc.type.toLowerCase().includes("avi") ||
                                          doc.type.toLowerCase().includes("webm")
                                        ? "bg-gradient-to-r from-amber-500 to-amber-600 shadow-sm shadow-amber-200 dark:shadow-amber-900/20"
                                        : doc.type.toLowerCase().includes("ppt")
                                          ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm shadow-orange-200 dark:shadow-orange-900/20"
                                          : doc.type.toLowerCase().includes("zip") ||
                                              doc.type.toLowerCase().includes("rar")
                                            ? "bg-gradient-to-r from-teal-500 to-teal-600 shadow-sm shadow-teal-200 dark:shadow-teal-900/20"
                                            : "bg-gradient-to-r from-gray-500 to-gray-600 shadow-sm shadow-gray-200 dark:shadow-gray-900/20"
                            }`}
                          >
                            {doc.type.toLowerCase().includes("pdf") ? (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : doc.type.toLowerCase().includes("doc") ? (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : doc.type.toLowerCase().includes("xls") ? (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : doc.type.toLowerCase().includes("jpg") ||
                              doc.type.toLowerCase().includes("jpeg") ||
                              doc.type.toLowerCase().includes("png") ||
                              doc.type.toLowerCase().includes("gif") ? (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : doc.type.toLowerCase().includes("mp4") ||
                              doc.type.toLowerCase().includes("mov") ||
                              doc.type.toLowerCase().includes("avi") ||
                              doc.type.toLowerCase().includes("webm") ? (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                            ) : doc.type.toLowerCase().includes("ppt") ? (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : doc.type.toLowerCase().includes("zip") || doc.type.toLowerCase().includes("rar") ? (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5 2a1 1 0 00-1 1v1h1a1 1 0 010 2H4v1h1a1 1 0 010 2H4v1h1a1 1 0 010 2H4v1h1a1 1 0 010 2H4a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1H5z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {doc.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex justify-center">
                          <a
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
                            title="Download document"
                          >
                            <Download className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">
                        <div className="flex justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteModal(doc._id)}
                            className="flex items-center"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Delete
                          </Button>
                        </div>
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
