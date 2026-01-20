"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Plus, Trash2, Users } from "lucide-react"
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

export default function MyAssignmentsPage() {
  const router = useRouter()

  const [assignments, setAssignments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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

      // 2️⃣ fetch assignments
      await fetchMyAssignments(token)
    } catch (err) {
      console.error(err)
      router.push("/login")
    }
  }

  const fetchMyAssignments = async (token) => {
    try {
      const res = await fetch(
        `${API_URL}/api/assignments/my-assignments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok)
        throw new Error("Failed to fetch assignments")

      const data = await res.json()
      setAssignments(data.assignments || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa bài tập này?")) return

    try {
      const token = localStorage.getItem("token")

      const res = await fetch(
        `${API_URL}/api/assignments/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) throw new Error("Delete failed")

      setAssignments((prev) =>
        prev.filter((a) => a.id !== id)
      )
    } catch (err) {
      console.error(err)

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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-4xl font-bold">
                  Bài tập của tôi
                </h1>
              </div>

              {!isLoading && (
                <p className="text-lg text-muted-foreground">
                  {assignments.length} bài tập đã tạo
                </p>
              )}
            </div>

            <Button asChild>
              <Link href="/assignments/create">
                <Plus className="mr-2 h-4 w-4" />
                Tạo bài tập mới
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <p>Đang tải dữ liệu...</p>
          ) : assignments.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Chưa có bài tập nào
              </h3>
              <p className="text-muted-foreground mb-6">
                Tạo bài tập đầu tiên để học sinh có thể làm bài
              </p>
              <Button asChild>
                <Link href="/assignments/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo bài tập
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {assignments.map((a) => (
                <Card
                  key={a.id}
                  className="group overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={
                        a.thumbnail
                          ? `${API_URL}${a.thumbnail}`
                          : "/placeholder.svg"
                      }
                      alt={a.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {a.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {a.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {a.questions?.length ?? 0} câu
                      </span>
                      <span className="text-muted-foreground">
                        •
                      </span>
                      <span className="font-medium text-primary">
                        {a.total_score} điểm
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      asChild
                    >
                      <Link
                        href={`/assignments/${a.id}/results`}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Kết quả
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        handleDelete(a.id)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
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
