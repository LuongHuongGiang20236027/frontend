"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Clock, Repeat } from "lucide-react"
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
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// 🔹 Format date time
const formatDateTime = (value) => {
  if (!value) return "Không giới hạn"
  const d = new Date(value)
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchAssignments()
  }, [])

  // 🔹 Lấy tất cả bài tập
  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/assignments`)
      if (!res.ok) throw new Error("Fetch assignments failed")

      const data = await res.json()
      setAssignments(data.assignments || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 Tìm kiếm bài tập
  const searchAssignments = async (q) => {
    try {
      const res = await fetch(
        `${API_URL}/api/assignments/search?q=${encodeURIComponent(q)}`
      )
      const data = await res.json()
      setAssignments(data.assignments || [])
    } catch (err) {
      console.error(err)
    }
  }

  // 🔹 Debounce search giống Documents
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchTerm.trim()) {
        searchAssignments(searchTerm)
      } else {
        fetchAssignments()
      }
    }, 300)

    return () => clearTimeout(t)
  }, [searchTerm])

  // ✅ CHECK LOGIN = JWT
  const handleDoAssignment = (assignmentId) => {
    const token = localStorage.getItem("token")

    if (!token) {
      alert("Vui lòng đăng nhập để làm bài tập")
      router.push("/login")
      return
    }

    const assignment = assignments.find(a => a.id === assignmentId)

    // ⛔ Chặn nếu chưa đến giờ mở bài
    if (
      assignment?.start_time &&
      new Date() < new Date(assignment.start_time)
    ) {
      alert("Bài tập chưa mở")
      return
    }

    // ⛔ Chặn nếu đã hết hạn
    if (
      assignment?.end_time &&
      new Date() > new Date(assignment.end_time)
    ) {
      alert("Bài tập đã hết hạn")
      return
    }

    router.push(`/assignments/${assignmentId}/do`)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-4xl font-bold">Tất cả bài tập</h1>
              </div>

              {/* 🔍 Search box */}
              <input
                type="text"
                placeholder="Tìm bài tập..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {!isLoading && (
              <p className="text-lg text-muted-foreground">
                {assignments.length} bài tập
              </p>
            )}
          </div>

          {isLoading ? (
            <p>Đang tải dữ liệu...</p>
          ) : assignments.length === 0 ? (
            <p className="text-muted-foreground">Không tìm thấy bài tập</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {assignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="group overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={assignment.thumbnail || "/placeholder.svg"}
                      alt={assignment.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {assignment.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {assignment.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {assignment.questions?.length ?? 0} câu hỏi
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-medium text-primary">
                        {assignment.total_score} điểm
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatDateTime(assignment.start_time)} →{" "}
                        {formatDateTime(assignment.end_time)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        ⏱{" "}
                        {assignment.time_limit
                          ? `${assignment.time_limit} phút`
                          : "Không giới hạn"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat className="h-3 w-3" />
                        {assignment.max_attempts || 1} lượt
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Tạo bởi {assignment.author_name}
                    </p>
                  </CardContent>

                  <CardFooter className="gap-2">
                    <Button
                      className="flex-1 bg-transparent"
                      variant="outline"
                      asChild
                    >
                      <Link href={`/assignments/${assignment.id}/view`}>
                        Xem đề
                      </Link>
                    </Button>

                    <Button
                      className="flex-1"
                      onClick={() =>
                        handleDoAssignment(assignment.id)
                      }
                    >
                      Làm bài
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
