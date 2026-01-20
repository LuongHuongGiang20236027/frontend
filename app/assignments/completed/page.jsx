"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, CheckCircle2 } from "lucide-react"
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL

const getAuthHeader = () => {
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function CompletedAssignmentsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/assignments/my-submissions`,
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
          }
        )

        if (res.status === 401) {
          router.push("/login")
          return
        }

        if (!res.ok) throw new Error("Không thể tải bài đã làm")

        const data = await res.json()
        setSubmissions(data.submissions || [])
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [router])

  if (loading) {
    return <div className="text-center mt-20">Đang tải dữ liệu...</div>
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Bài tập đã làm</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              {submissions.length} bài tập đã hoàn thành
            </p>
          </div>

          {submissions.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Chưa hoàn thành bài tập nào
              </h3>
              <p className="text-muted-foreground mb-6">
                Bắt đầu làm bài để xem kết quả tại đây
              </p>
              <Button asChild>
                <Link href="/assignments">Khám phá bài tập</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {submissions.map((s) => {
                const percentage = (
                  (s.score / s.total_score) *
                  100
                ).toFixed(0)
                const isPassed = Number(percentage) >= 70

                return (
                  <Card
                    key={s.id}
                    className="group overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={`${API_BASE}${s.thumbnail}`}
                        alt={s.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    </div>

                    <CardHeader>
                      <CardTitle className="line-clamp-1">
                        {s.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {s.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Điểm số:
                          </span>
                          <span
                            className={`text-lg font-bold ${isPassed
                                ? "text-primary"
                                : "text-destructive"
                              }`}
                          >
                            {s.score}/{s.total_score}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Tỷ lệ đúng:
                          </span>
                          <span className="text-sm font-medium">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button
                        className="w-full"
                        variant="secondary"
                        asChild
                      >
                        <Link
                          href={`/assignments/${s.assignment_id}/result/${s.id}`}
                        >
                          Xem kết quả
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
