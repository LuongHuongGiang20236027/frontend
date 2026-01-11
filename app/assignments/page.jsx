"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen } from "lucide-react"
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
import { API_BASE_URL } from "@/config"


export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments`)

      if (!res.ok) throw new Error("Fetch assignments failed")

      const data = await res.json()
      setAssignments(data.assignments || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ CHECK LOGIN KHI LÀM BÀI
  const handleDoAssignment = (assignmentId) => {
    const user = localStorage.getItem("user")

    if (!user) {
      alert("Vui lòng đăng nhập để làm bài tập")
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
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Tất cả bài tập</h1>
            </div>
            {!isLoading && (
              <p className="text-lg text-muted-foreground">
                Khám phá và thử sức với {assignments.length} bài tập đa dạng
              </p>
            )}
          </div>

          {isLoading ? (
            <p>Đang tải dữ liệu...</p>
          ) : assignments.length === 0 ? (
            <p className="text-muted-foreground">Chưa có bài tập nào</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {assignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="group overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={`${API_BASE_URL}${assignment.thumbnail}`}
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

                    {/* ✅ LÀM BÀI: CHECK LOGIN */}
                    <Button
                      className="flex-1"
                      onClick={() => handleDoAssignment(assignment.id)}
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
