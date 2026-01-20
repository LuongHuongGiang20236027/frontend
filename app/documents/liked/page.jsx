"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function DocumentsPage() {
  const router = useRouter()

  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [likedDocs, setLikedDocs] = useState(new Set())

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      // 1️⃣ check login
      const meRes = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!meRes.ok) {
        router.push("/login")
        return
      }

      // 2️⃣ fetch liked documents
      await fetchLikedDocuments(token)
    } catch (err) {
      console.error(err)
      router.push("/login")
    }
  }

  const fetchLikedDocuments = async (token) => {
    try {
      const res = await fetch(
        `${API_URL}/api/documents/liked`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) throw new Error("Fetch liked documents failed")

      const data = await res.json()

      setDocuments(data.documents || [])

      // ❤️ tất cả doc ở đây đều đã liked
      setLikedDocs(
        new Set((data.documents || []).map((d) => d.id))
      )
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (docId) => {
    // ❗ trang này chỉ UNLIKE
    try {
      const token = localStorage.getItem("token")

      await fetch(`${API_URL}/api/documents/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ document_id: docId }),
      })

      // remove khỏi UI
      setDocuments((prev) =>
        prev.filter((d) => d.id !== docId)
      )

      setLikedDocs((prev) => {
        const next = new Set(prev)
        next.delete(docId)
        return next
      })
    } catch (err) {
      console.error("Unlike failed", err)
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
              <h1 className="text-4xl font-bold">
                Tài liệu đã thích
              </h1>
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
            <p className="text-muted-foreground">
              Bạn chưa thích tài liệu nào
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {documents.map((doc) => (
                <Card
                  key={doc.id}
                  className="group overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={`${API_URL}${doc.thumbnail}`}
                      alt={doc.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />

                    {/* ❤️ UNLIKE */}
                    <button
                      onClick={() => handleLike(doc.id)}
                      className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow hover:scale-110 transition"
                      title="Bỏ thích"
                    >
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
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
                      <Link href={`/documents/${doc.id}`}>
                        Xem
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
