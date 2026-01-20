"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileText, Plus, Trash2, Heart } from "lucide-react"
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

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function MyDocumentsPage() {
  const router = useRouter()

  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [likedDocs, setLikedDocs] = useState(new Set())

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const meRes = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!meRes.ok) {
          router.push("/login")
          return
        }

        await fetchMyDocuments(token)
      } catch (err) {
        console.error(err)
        router.push("/login")
      }
    }

    init()
  }, [router])

  const fetchMyDocuments = async (token) => {
    try {
      const res = await fetch(
        `${API_URL}/api/documents/my-documents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) throw new Error("Failed to fetch documents")

      const data = await res.json()
      setDocuments(data.documents || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (docId) => {
    if (!confirm("Bạn có chắc muốn xóa tài liệu này?")) return

    try {
      const token = localStorage.getItem("token")

      const res = await fetch(
        `${API_URL}/api/documents/${docId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) throw new Error("Delete failed")

      setDocuments((prev) => prev.filter((d) => d.id !== docId))
    } catch (err) {
      console.error(err)

    }
  }

  const handleLike = async (docId) => {
    const token = localStorage.getItem("token")
    const isLiked = likedDocs.has(docId)

    // Optimistic UI
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
      await fetch(`${API_URL}/api/documents/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ document_id: docId }),
      })
    } catch (err) {
      console.error("Like failed", err)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20">
                  <FileText className="h-6 w-6" />
                </div>
                <h1 className="text-4xl font-bold">Tài liệu của tôi</h1>
              </div>

              {!isLoading && (
                <p className="text-lg text-muted-foreground">
                  {documents.length} tài liệu đã tạo
                </p>
              )}
            </div>

            <Button asChild>
              <Link href="/documents/upload">
                <Plus className="mr-2 h-4 w-4" />
                Tải lên tài liệu mới
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <p>Đang tải dữ liệu...</p>
          ) : documents.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Chưa có tài liệu nào
              </h3>
              <p className="text-muted-foreground mb-6">
                Bắt đầu chia sẻ kiến thức bằng cách tải lên tài liệu
              </p>
              <Button asChild>
                <Link href="/documents/upload">
                  <Plus className="mr-2 h-4 w-4" />
                  Tải lên tài liệu
                </Link>
              </Button>
            </Card>
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
                        src={`${API_URL}${doc.thumbnail}`}
                        alt={doc.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />

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
                    </CardContent>

                    <CardFooter className="gap-2">
                      <Button variant="secondary" className="flex-1" asChild>
                        <Link href={`/documents/${doc.id}`}>
                          Xem
                        </Link>
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
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
