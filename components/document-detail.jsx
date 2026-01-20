"use client"

import { useState, useEffect } from "react"
import { Heart, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// 🔹 Chi tiết tài liệu
export function DocumentDetail({ document: doc }) {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(
    Number(doc.like_count) || 0
  )

  useEffect(() => {
    const initLikeStatus = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const res = await fetch(
          `${API_URL}/api/documents/liked`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!res.ok) return

        const data = await res.json()

        const likedIds = new Set(
          (data.documents || []).map((d) => d.id)
        )

        if (likedIds.has(doc.id)) {
          setLiked(true)
        }
      } catch (err) {
        console.error("Fetch liked status failed", err)
      }
    }

    initLikeStatus()
  }, [doc.id])

  // xử lý like / unlike
  const handleLike = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Vui lòng đăng nhập để thích tài liệu")
      return
    }

    const isLiked = liked

    setLiked(!isLiked)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))

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

      if (!res.ok) {
        throw new Error("Like failed")
      }
    } catch (err) {
      console.error("Like failed", err)

      setLiked(isLiked)
      setLikesCount((prev) =>
        isLiked ? prev + 1 : prev - 1
      )
    }
  }

  // xử lý tải tài liệu
  const handleDownload = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Vui lòng đăng nhập để tải tài liệu")
      return
    }

    try {
      const res = await fetch(
        `${API_URL}/api/documents/${doc.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {
        throw new Error("Download failed")
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)

      const a = window.document.createElement("a")
      a.href = url
      a.download = doc.title || "document"
      window.document.body.appendChild(a)
      a.click()

      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download failed", err)
      alert("Tải tài liệu thất bại")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Thumbnail */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <img
            src={`${API_URL}${doc.thumbnail}`}
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
                  <iframe
                    src={`${API_URL}${doc.file_url}#toolbar=0`}
                    title="Preview PDF"
                    className="w-full h-full"
                  />
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
                    {doc.author_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Ngày tạo
                  </p>
                  <p className="font-medium">
                    {new Date(
                      doc.created_at
                    ).toLocaleDateString("vi-VN")}
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
