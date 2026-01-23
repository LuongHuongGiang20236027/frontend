"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

const API_BASE = process.env.NEXT_PUBLIC_API_URL

// 🔹 Format chuẩn VN
const formatDateVN = (date) => {
  if (!date) return "—"
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const formatTimeVN = (date) => {
  if (!date) return "—"
  const d = new Date(date)
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")
  const s = String(d.getSeconds()).padStart(2, "0")
  return `${h}:${m}:${s}`
}

export default function AssignmentResultPage() {
  const router = useRouter()
  const params = useParams()
  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id || !params?.attemptId) return

    const fetchResult = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          alert("Vui lòng đăng nhập để xem kết quả")
          router.push("/login")
          return
        }

        const res = await fetch(
          `${API_BASE}/api/assignments/${params.id}/result/${params.attemptId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!res.ok) throw new Error("Không tìm thấy kết quả")

        const data = await res.json()
        setAttempt(data.attempt)
      } catch (err) {
        console.error(err)
        setAttempt(null)
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [params?.id, params?.attemptId, router])

  if (loading) return <div className="text-center mt-20">Đang tải...</div>

  if (!attempt) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">
              Không tìm thấy kết quả
            </h3>
            <p className="text-muted-foreground mb-6">
              Bạn chưa làm bài tập này
            </p>
            <Button
              onClick={() =>
                router.push(`/assignments/${params.id}`)
              }
            >
              Làm bài tập
            </Button>
          </Card>
        </main>
      </div>
    )
  }

  const percentage = (
    (attempt.score / attempt.total_score) *
    100
  ).toFixed(0)

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              {Number(percentage) >= 70 ? (
                <CheckCircle2 className="h-12 w-12 text-primary" />
              ) : (
                <XCircle className="h-12 w-12 text-destructive" />
              )}
            </div>
            <CardTitle>Kết quả bài tập</CardTitle>
            <CardDescription>
              {attempt.assignment_title}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-center">
            <div className="text-4xl font-bold text-primary">
              {attempt.score}/{attempt.total_score}
            </div>

            <p className="text-lg text-muted-foreground">
              {percentage}% điểm
            </p>

            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                🗓 Ngày làm: {formatDateVN(attempt.started_at)}
              </p>
              <p>
                ⏰ Bắt đầu: {formatTimeVN(attempt.started_at)}
              </p>
              <p>
                🏁 Nộp bài: {formatTimeVN(attempt.submitted_at)}
              </p>
              {attempt.duration && (
                <p className="font-medium text-primary">
                  ⏳ Thời gian làm:{" "}
                  {attempt.duration.minutes} phút{" "}
                  {attempt.duration.seconds} giây
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {attempt.questions.map((q, idx) => {
          const userAnswerIds = q.user_answer_ids || []
          const correctAnswerIds = q.answers
            .filter(a => a.is_correct)
            .map(a => a.id)

          const isCorrect =
            userAnswerIds.length === correctAnswerIds.length &&
            userAnswerIds.every(id =>
              correctAnswerIds.includes(id)
            )

          return (
            <Card key={q.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="h-6 w-6 text-primary mt-1" />
                  ) : (
                    <XCircle className="h-6 w-6 text-destructive mt-1" />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-xl">
                      Câu {idx + 1}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {q.content}
                    </CardDescription>
                    <p className="mt-2 text-sm font-medium">
                      {isCorrect ? (
                        <span className="text-primary">
                          +{q.score} điểm
                        </span>
                      ) : (
                        <span className="text-destructive">
                          0 điểm
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                {q.answers.map(opt => {
                  const isUser = userAnswerIds.includes(opt.id)
                  const isRight = opt.is_correct

                  let bg = "bg-muted/50"
                  if (isRight)
                    bg = "bg-primary/10 border-primary"
                  else if (isUser && !isRight)
                    bg = "bg-destructive/10 border-destructive"

                  return (
                    <div
                      key={opt.id}
                      className={`rounded-lg border-2 p-3 ${bg}`}
                    >
                      <div className="flex justify-between">
                        <span>{opt.content}</span>
                        <div className="flex gap-2">
                          {isUser && (
                            <span className="text-xs text-muted-foreground">
                              Bạn đã chọn
                            </span>
                          )}
                          {isRight && (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </main>
    </div>
  )
}
