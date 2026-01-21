"use client"

import { useState, useEffect, useMemo } from "react"
import { Heart, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function DocumentDetail({ document: doc }) {
  const [liked, setLiked] = useState(doc.isLiked || false)
  const [likesCount, setLikesCount] = useState(
    Number(doc.like_count) || 0
  )

  // Fallback preview nếu backend chưa gắn
  const previewUrl = useMemo(() => {
    if (doc.preview_url) return doc.preview_url
    if (!doc.file_url) return null
    return doc.file_url.replace("/upload/", "/upload/fl_inline/")
  }, [doc])

  // Like / Unlike
  const handleLike = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Vui lòng đăng nhập để thích tài liệu")
      return
    }

    const prev = liked

    setLiked(!prev)
    setLikesCount((v) => (prev ? v - 1 : v + 1))

    try {
      const res = await fetch(
        `${API_URL}/api/documents/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ document_id: doc.id }),
        }
      )

      if (!res.ok) throw new Error()
    } catch {
      setLiked(prev)
      setLikesCount((v) => (prev ? v + 1 : v - 1))
    }
  }

  // Download qua backend (bảo mật)
  const handleDownload = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Vui lòng đăng nhập để tải tài liệu")
      return
    }

    const link = window.document.createElement("a")
    link.href = `${API_URL}/api/documents/download/${doc.id}`
    link.target = "_blank"
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Thumbnail */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <img
            src={doc.thumbnail || "/placeholder.png"}
            alt={doc.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-4xl font-bold">{doc.title}</h1>
            <p className="mt-2 text-lg text-white/90">
              {doc.description}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Về tài liệu này</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {doc.description ||
                    "Tài liệu này cung cấp những kiến thức quan trọng và hữu ích."}
                </p>

                <div className="flex items-center gap-4 pt-4">
                  <Button
                    variant={liked ? "default" : "outline"}
                    onClick={handleLike}
                    className="flex-1"
                  >
                    <Heart
                      className={`mr-2 h-4 w-4 ${liked
                          ? "fill-red-500 text-red-500"
                          : "text-gray-500"
                        }`}
                    />
                    {liked ? "Đã thích" : "Thích"} ({likesCount})
                  </Button>

                  <Button
                    className="flex-1"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Tải xuống
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Xem trước tài liệu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-4/3 rounded-lg border overflow-hidden">
                  {previewUrl ? (
                    <iframe
                      src={`${previewUrl}#toolbar=0`}
                      title="Preview PDF"
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      Không có file preview
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Người tạo
                  </p>
                  <p className="font-medium">
                    {doc.author_name || "Không rõ"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Ngày tạo
                  </p>
                  <p className="font-medium">
                    {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Lượt thích
                  </p>
                  <p className="font-medium">
                    {likesCount}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
