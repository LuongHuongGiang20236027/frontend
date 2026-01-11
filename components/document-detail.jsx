"use client"

import { useState } from "react"
import { Heart, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { API_BASE_URL } from "@/config"

export function DocumentDetail({ document }) {
  const [liked, setLiked] = useState(!!document.isLiked)
  const [likesCount, setLikesCount] = useState(
    Number(document.like_count) || 0
  )

  const handleLike = async () => {
    const isLiked = liked

    // ✅ optimistic UI (GIỐNG MyDocumentsPage)
    setLiked(!isLiked)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))

    try {
      // Like
      const res = await fetch(`${API_BASE_URL}/api/documents/like`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: document.id }),
      })

      if (res.status === 401) {
        alert("Vui lòng đăng nhập để thích tài liệu")

        // rollback UI
        setLiked(isLiked)
        setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1))
      }
    } catch (err) {
      console.error("Like failed", err)

      // rollback UI
      setLiked(isLiked)
      setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1))
    }
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Thumbnail */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <img
            src={`${API_BASE_URL}${document.thumbnail}`} alt={document.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-4xl font-bold">{document.title}</h1>
            <p className="mt-2 text-lg text-white/90">
              {document.description}
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
                  {document.description ||
                    "Tài liệu này cung cấp những kiến thức quan trọng và hữu ích."}
                </p>

                <div className="flex items-center gap-4 pt-4">
                  <Button
                    variant={liked ? "default" : "outline"}
                    onClick={handleLike}
                    className="flex-1"
                  >
                    <Heart
                      className={`mr-2 h-4 w-4 ${liked ? "fill-current" : ""
                        }`}
                    />
                    {liked ? "Đã thích" : "Thích"} ({likesCount})
                  </Button>

                  <Button className="flex-1" onClick={() => {
                    // Download
                    window.open(`${API_BASE_URL}/api/documents/${document.id}/download`, "_blank");
                  }}>
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
                <div className="aspect-[4/3] rounded-lg border overflow-hidden">
                  <iframe
                    src={`${API_BASE_URL}${document.file_url}#toolbar=0`}
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
                  <p className="text-sm text-muted-foreground">Người tạo</p>
                  <p className="font-medium">{document.author_name}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">
                    {new Date(document.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Lượt thích</p>
                  <p className="font-medium">{likesCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
