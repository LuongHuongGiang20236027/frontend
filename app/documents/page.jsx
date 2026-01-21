"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, Heart } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"

// 🔹 API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL

// 🔹 Helper lấy JWT token
const getToken = () => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [likedDocs, setLikedDocs] = useState(new Set())

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      const token = getToken()

      // luôn load tài liệu
      await fetchDocuments()

      // nếu có login → load liked
      if (token) {
        await fetchLikedDocuments(token)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 Lấy danh sách tài liệu
  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/documents`)
      const data = await res.json()
      setDocuments(data.documents || [])
    } catch (err) {
      console.error(err)
    }
  }

  // 🔹 Lấy danh sách đã like
  const fetchLikedDocuments = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/documents/liked`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) return

      const data = await res.json()
      setLikedDocs(new Set((data.documents || []).map((d) => d.id)))
    } catch (err) {
      console.error(err)
    }
  }

  // 🔹 Like / Unlike
  const handleLike = async (docId) => {
    const token = getToken()
    if (!token) {
      alert("Vui lòng đăng nhập để thích tài liệu")
      return
    }

    const isLiked = likedDocs.has(docId)

    // ✅ Optimistic UI
    setLikedDocs((prev) => {
      const next = new Set(prev)
      isLiked ? next.delete(docId) : next.add(docId)
      return next
    })

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? {
            ...doc,
            like_count: isLiked
              ? Number(doc.like_count) - 1
              : Number(doc.like_count) + 1,
          }
          : doc
      )
    )

    try {
      const res = await fetch(`${API_URL}/api/documents/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          document_id: docId,
        }),
      })

      if (!res.ok) {
        throw new Error("Like failed")
      }
    } catch (err) {
      console.error("Like failed", err)

      // 🔄 rollback
      setLikedDocs((prev) => {
        const next = new Set(prev)
        isLiked ? next.add(docId) : next.delete(docId)
        return next
      })

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId
            ? {
              ...doc,
              like_count: isLiked
                ? Number(doc.like_count) + 1
                : Number(doc.like_count) - 1,
            }
            : doc
        )
      )
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20">
                <FileText className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold">Tất cả tài liệu</h1>
            </div>
            {!isLoading && (
              <p className="text-lg text-muted-foreground">
                {documents.length} tài liệu
              </p>
            )}
          </div>

          {isLoading ? (
            <p>Đang tải dữ liệu...</p>
          ) : documents.length === 0 ? (
            <p className="text-muted-foreground">Chưa có tài liệu nào</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {documents.map((doc) => {
                const isLiked = likedDocs.has(doc.id)

                return (
                  <Card
                    key={doc.id}
                    className="group overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-muted">
                      <img
                        src={doc.thumbnail}
                        alt={doc.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />

                      {/* ❤️ Like button */}
                      <button
                        onClick={() => handleLike(doc.id)}
                        className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow hover:scale-110 transition"
                      >
                        <Heart
                          className={`h-5 w-5 ${isLiked
                            ? "fill-red-500 text-red-500"
                            : "text-gray-500"
                            }`}
                        />
                      </button>
                    </div>

                    <CardHeader>
                      <CardTitle className="line-clamp-1">
                        {doc.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {doc.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {doc.like_count} lượt thích
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tạo bởi {doc.author_name}
                      </p>
                    </CardContent>

                    <CardFooter>
                      <Button
                        className="w-full"
                        variant="secondary"
                        asChild
                      >
                        <Link href={`/documents/${doc.id}`}>Xem</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
