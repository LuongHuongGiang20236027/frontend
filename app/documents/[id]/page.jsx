"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import { Header } from "@/components/header"
import { DocumentDetail } from "@/components/document-detail"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function DocumentPage() {
  const { id } = useParams()

  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (!id) return

    const init = async () => {
      try {
        // 1️⃣ fetch document (PUBLIC)
        const res = await fetch(
          `${API_URL}/api/documents/${id}`
        )

        if (!res.ok) {
          setDocument(null)
          return
        }

        const data = await res.json()
        setDocument(data.document)

        // 2️⃣ check login (JWT)
        const token = localStorage.getItem("token")
        if (!token) return

        const meRes = await fetch(
          `${API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!meRes.ok) return

        // 3️⃣ fetch liked documents
        const likedRes = await fetch(
          `${API_URL}/api/documents/liked`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!likedRes.ok) return

        const likedData = await likedRes.json()
        const likedIds = (likedData.documents || []).map(
          (d) => d.id
        )

        setLiked(likedIds.includes(Number(id)))
      } catch (err) {
        console.error(err)
        setDocument(null)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [id])

  if (!loading && !document) notFound()
  if (loading) return <p className="p-8">Đang tải...</p>

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <DocumentDetail
          document={document}
          liked={liked}
          setLiked={setLiked}
        />
      </main>
    </div>
  )
}
