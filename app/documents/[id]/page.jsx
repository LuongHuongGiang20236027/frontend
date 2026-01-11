"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import { Header } from "@/components/header"
import { DocumentDetail } from "@/components/document-detail"
import { API_BASE_URL } from "@/config"

export default function DocumentPage() {
  const { id } = useParams()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchDocument = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/documents/${id}`)


        if (!res.ok) {
          setDocument(null)
          return
        }

        const data = await res.json()
        setDocument(data.document)
      } catch (err) {
        console.error(err)
        setDocument(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [id])

  if (!loading && !document) {
    notFound()
  }

  if (loading) {
    return <p className="p-8">Đang tải...</p>
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <DocumentDetail document={document} />
      </main>
    </div>
  )
}
