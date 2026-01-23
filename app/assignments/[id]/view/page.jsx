"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { BookOpen, Clock, FileText } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const formatDateTime = value => {
  if (!value) return "Không giới hạn"
  const d = new Date(value)
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  })
}

export default function ViewAssignmentPage() {
  const router = useRouter()
  const params = useParams()

  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!params?.id) return

    const fetchAssignment = async () => {
      try {
        const res = await fetch(`${API_URL}/api/assignments/${params.id}`)
        if (!res.ok) {
          if (res.status === 404) router.replace("/404")
          throw new Error("Bài tập không tìm thấy")
        }

        const data = await res.json()

        const mapped = {
          ...data.assignment,
          questions: data.assignment.questions.map(q => ({
            id: q.id,
            question_text: q.content,
            question_type: q.type,
            score: q.score,
            options: q.answers.map(a => ({
              id: a.id,
              option_text: a.content
            }))
          }))
        }

        setAssignment(mapped)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignment()
  }, [params?.id, router])

  const handleDoAssignment = id => {
    const user = localStorage.getItem("user")
    if (!user) {
      alert("Vui lòng đăng nhập để làm bài")
      return
    }

    if (assignment.start_time && new Date() < new Date(assignment.start_time)) {
      alert("Bài tập chưa mở")
      return
    }

    if (assignment.end_time && new Date() > new Date(assignment.end_time)) {
      alert("Bài tập đã đóng")
      return
    }

    router.push(`/assignments/${id}/do`)
  }

  if (loading) return <div className="text-center mt-20">Đang tải...</div>
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>
  if (!assignment) return null

  const user = JSON.parse(localStorage.getItem("user") || "null")
  const userRole = user?.role || "guest"

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Thumbnail */}
          <div className="relative mb-8 overflow-hidden rounded-2xl">
            <img
              src={assignment.thumbnail || "/placeholder.svg"}
              alt={assignment.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl font-bold">{assignment.title}</h1>
              <p className="mt-2 text-lg text-white/90">
                {assignment.description}
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Thông tin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Số câu:</span>
                  <span>{assignment.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tổng điểm:</span>
                  <span className="text-primary">
                    {assignment.total_score}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mở:</span>
                  <span>{formatDateTime(assignment.start_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Đóng:</span>
                  <span>{formatDateTime(assignment.end_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Giới hạn:</span>
                  <span>
                    {assignment.time_limit
                      ? `${assignment.time_limit} phút`
                      : "Không"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Hướng dẫn
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Đọc kỹ câu hỏi</p>
                <p>• Một số câu có nhiều đáp án</p>
                <p>• Kiểm tra trước khi nộp</p>
              </CardContent>
            </Card>
          </div>

          {/* Questions Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Danh sách câu hỏi
              </CardTitle>
              <CardDescription>Chỉ để xem trước</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignment.questions.map((q, idx) => (
                <div key={q.id} className="rounded-lg border p-4">
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {idx + 1}. {q.question_text}
                    </span>
                    <Badge>
                      {q.question_type === "single"
                        ? "1 đáp án"
                        : "Nhiều đáp án"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {userRole === "student" && (
            <Card className="mt-6">
              <CardContent className="flex justify-between items-center p-6">
                <div>
                  <p className="font-semibold">Sẵn sàng?</p>
                  <p className="text-sm text-muted-foreground">
                    Nhấn để bắt đầu làm bài
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={() => handleDoAssignment(assignment.id)}
                >
                  Làm bài
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
