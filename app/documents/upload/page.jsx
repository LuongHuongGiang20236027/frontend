"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, ArrowLeft, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/header"
import { API_BASE_URL } from "@/config"

export default function UploadDocumentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null,
    thumbnail: null,
  })
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, [field]: file }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.file) {
      alert("Vui lòng nhập tiêu đề và chọn file PDF")
      return
    }

    setUploading(true)

    try {
      const fd = new FormData()
      fd.append("title", formData.title)
      fd.append("description", formData.description || "")
      fd.append("file", formData.file)

      if (formData.thumbnail) {
        fd.append("thumbnail", formData.thumbnail)
      }

      const res = await fetch(`${API_BASE_URL}/api/documents`, {
        method: "POST",
        credentials: "include",
        body: fd,
      })


      const data = await res.json()

      if (!res.ok || !data.document) {
        alert(data.error || "Upload thất bại")
        return
      }

      alert("✅ Tải lên tài liệu thành công!")
      router.push("/documents/my-documents")

    } catch (err) {
      console.error(err)
      alert("❌ Lỗi kết nối server")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-8">

          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20">
                  <Upload className="h-6 w-6 text-secondary-foreground" />
                </div>
                <h1 className="text-4xl font-bold">Tải lên tài liệu</h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Chỉ giáo viên mới có quyền tải tài liệu
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin tài liệu</CardTitle>
                  <CardDescription>Điền đầy đủ để tài liệu dễ tìm kiếm</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>
                      Tiêu đề <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mô tả</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      File PDF <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, "file")}
                      required
                    />
                    {formData.file && (
                      <p className="text-sm text-muted-foreground">
                        Đã chọn: {formData.file.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Ảnh bìa</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "thumbnail")}
                    />
                    {formData.thumbnail && (
                      <p className="text-sm text-muted-foreground">
                        Đã chọn: {formData.thumbnail.name}
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={uploading} className="flex-1">
                    {uploading ? "Đang tải lên..." : "Tải lên"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
