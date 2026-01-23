"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Header } from "@/components/header"

const API_BASE = process.env.NEXT_PUBLIC_API_URL

// 🔹 Format ngày giờ VN
function formatDateTime(dateStr) {
  if (!dateStr) return "Chưa nộp"

  const d = new Date(dateStr)

  return (
    d.toLocaleDateString("vi-VN") +
    " " +
    d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })
  )
}

export default function AssignmentResultsPage() {
  const router = useRouter()
  const { id } = useParams()
  const assignmentId = Number(id)

  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!assignmentId) return

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          alert("Vui lòng đăng nhập")
          router.push("/login")
          return
        }

        // 1️⃣ Lấy bài tập
        const aRes = await fetch(
          `${API_BASE}/api/assignments/${assignmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!aRes.ok)
          throw new Error("Không tìm thấy bài tập")

        const aData = await aRes.json()
        setAssignment(aData.assignment)

        // 2️⃣ Lấy submissions
        const sRes = await fetch(
          `${API_BASE}/api/assignments/${assignmentId}/submissions`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!sRes.ok)
          throw new Error("Không lấy được danh sách bài nộp")

        const sData = await sRes.json()
        setSubmissions(sData.submissions)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [assignmentId, router])

  if (loading) {
    return <div className="text-center mt-20">Đang tải dữ liệu...</div>
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">
              Không tìm thấy bài tập
            </h3>
            <Button
              onClick={() => router.push("/assignments")}
            >
              Quay lại danh sách bài tập
            </Button>
          </Card>
        </main>
      </div>
    )
  }

  // ====== THỐNG KÊ ======
  const totalScore = assignment.total_score

  const averageScore =
    submissions.length > 0
      ? (
        submissions.reduce(
          (sum, s) => sum + Number(s.score),
          0
        ) / submissions.length
      ).toFixed(1)
      : 0

  const highestScore =
    submissions.length > 0
      ? Math.max(
        ...submissions.map(s => Number(s.score))
      )
      : 0

  // 🔹 Sort theo điểm DESC, nếu bằng điểm thì ai làm nhanh hơn đứng trên
  const sortedSubmissions = [...submissions].sort(
    (a, b) => {
      if (b.score !== a.score) return b.score - a.score

      const aTime =
        new Date(a.submitted_at) -
        new Date(a.started_at)

      const bTime =
        new Date(b.submitted_at) -
        new Date(b.started_at)

      return aTime - bTime
    }
  )

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {assignment.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            Kết quả làm bài của học sinh
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <StatCard
            title="Số học sinh"
            value={submissions.length}
          />
          <StatCard
            title="Điểm trung bình"
            value={averageScore}
          />
          <StatCard
            title="Điểm cao nhất"
            value={highestScore}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách học sinh</CardTitle>
            <CardDescription>
              {submissions.length} lượt làm bài tập
            </CardDescription>
          </CardHeader>

          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Chưa có học sinh nào làm bài
              </div>
            ) : (
              sortedSubmissions.map((s, index) => {
                const percentage = (
                  (s.score / totalScore) *
                  100
                ).toFixed(0)

                const isPassed = percentage >= 70

                // 🔹 Tính thời gian làm
                let durationText = "—"
                if (s.started_at && s.submitted_at) {
                  const diffMs =
                    new Date(s.submitted_at) -
                    new Date(s.started_at)

                  const totalSeconds = Math.floor(diffMs / 1000)
                  const minutes = Math.floor(totalSeconds / 60)
                  const seconds = totalSeconds % 60

                  durationText = `${minutes}p ${seconds}s`
                }

                return (
                  <div
                    key={s.id}
                    className="flex justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        #{index + 1}. {s.student_name}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Lần nộp #{s.attempt_number}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        🏁 Nộp lúc:{" "}
                        {formatDateTime(s.submitted_at)}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        ⏳ Thời gian làm: {durationText}
                      </p>
                    </div>

                    <div
                      className={
                        isPassed
                          ? "text-primary font-semibold"
                          : "text-destructive font-semibold"
                      }
                    >
                      {s.score}/{totalScore} (
                      {percentage}%)
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function StatCard({ title, value }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
        </div>
      </CardContent>
    </Card>
  )
}
