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
        const assignment = data.assignment

        // Map lại question + options (ẩn is_correct)
        assignment.questions = assignment.questions.map(q => ({
          id: q.id,
          question_text: q.content,
          question_type: q.type,
          score: q.score,
          options: q.answers.map(a => ({
            id: a.id,
            option_text: a.content
          }))
        }))

        setAssignment(assignment)
      } catch (err) {
        console.error(err)
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

  const userRole = "student"

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
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl font-bold text-balance">
                {assignment.title}
              </h1>
              <p className="mt-2 text-lg text-white/90">
                {assignment.description}
              </p>
            </div>
          </div>

          {/* Info + hướng dẫn */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Thông tin bài tập
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số câu hỏi:</span>
                  <span className="font-semibold">
                    {assignment.questions.length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng điểm:</span>
                  <span className="font-semibold text-primary">
                    {assignment.total_score}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Người tạo:</span>
                  <span className="font-semibold">
                    {assignment.author_name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày tạo:</span>
                  <span className="font-semibold">
                    {new Date(assignment.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mở:</span>
                  <span className="font-semibold">
                    {formatDateTime(assignment.start_time)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đóng:</span>
                  <span className="font-semibold">
                    {formatDateTime(assignment.end_time)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giới hạn:</span>
                  <span className="font-semibold">
                    {assignment.time_limit
                      ? `${assignment.time_limit} phút`
                      : "Không giới hạn"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Số lần làm tối đa:
                  </span>
                  <span className="font-semibold">
                    {assignment.max_attempts || "Không giới hạn"}
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
              <CardContent className="space-y-3 text-sm">
                <p>• Đọc kỹ từng câu hỏi trước khi trả lời</p>
                <p>• Một số câu có thể có nhiều đáp án đúng</p>
                <p>• Kiểm tra thật kỹ trước khi nộp bài</p>
                {userRole === "student" && (
                  <p className="text-primary font-medium">
                    • Nhấn "Làm bài" để bắt đầu
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Danh sách câu hỏi PREVIEW - FIX UI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Danh sách câu hỏi
              </CardTitle>
              <CardDescription>
                Xem trước nội dung bài tập
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {assignment.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-lg border p-6 bg-muted/30"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {idx + 1}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {q.question_text}
                      </h3>

                      <div className="flex items-center gap-3 text-sm">
                        <Badge
                          variant={
                            q.question_type === "single"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {q.question_type === "single"
                            ? "Chọn 1 đáp án"
                            : "Chọn nhiều đáp án"}
                        </Badge>

                        <span className="text-muted-foreground">•</span>

                        <span className="font-medium text-primary">
                          {q.score} điểm
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-11 space-y-2">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={opt.id}
                        className="flex items-center gap-3 rounded-lg border bg-background p-3"
                      >
                        <span className="text-muted-foreground font-medium">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span className="flex-1">
                          {opt.option_text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {userRole === "student" && (
            <Card className="mt-6">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="font-semibold">
                    Sẵn sàng để bắt đầu?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Làm bài tập và kiểm tra kiến thức của bạn
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={() =>
                    handleDoAssignment(assignment.id)
                  }
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
