"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { API_BASE_URL } from "@/config"

export default function AssignmentResultPage() {
  const router = useRouter()
  const params = useParams()
  const [submission, setSubmission] = useState(null)
  const [assignment, setAssignment] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return

    const fetchResult = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/assignments/${params.id}/student`)

        if (!res.ok) throw new Error("Không tìm thấy bài tập")
        const data = await res.json()
        setAssignment(data.assignment)
        setQuestions(data.assignment.questions)
        setSubmission(data.assignment.submission || null)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [params?.id])

  if (loading) return <div className="text-center mt-20">Đang tải...</div>
  if (!assignment || !submission) return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <h3 className="text-xl font-semibold mb-2">Không tìm thấy kết quả</h3>
          <p className="text-muted-foreground mb-6">Bạn chưa làm bài tập này</p>
          <Button onClick={() => router.push(`/assignments/${params.id}`)}>Làm bài tập</Button>
        </Card>
      </main>
    </div>
  )

  const score = submission.score
  const percentage = ((score / assignment.total_score) * 100).toFixed(0)
  const userAnswers = JSON.parse(submission.answers_json)

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">


        <div className="mx-auto max-w-4xl space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                {Number.parseInt(percentage) >= 70 ? (
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                ) : (
                  <XCircle className="h-12 w-12 text-destructive" />
                )}
              </div>
              <CardTitle className="text-3xl">{assignment.title}</CardTitle>
              <CardDescription>Kết quả làm bài của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="text-5xl font-bold text-primary">{score}/{assignment.total_score}</div>
              <p className="mt-2 text-lg text-muted-foreground">{percentage}% điểm</p>
            </CardContent>
          </Card>

          {questions.map((q, idx) => {
            const userAnswer = userAnswers[q.id] || []
            const correctAnswers = q.options.filter(o => o.is_correct).map(o => o.id)
            const isCorrect = userAnswer.length === correctAnswers.length && userAnswer.every(a => correctAnswers.includes(a))

            return (
              <Card key={q.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    {isCorrect ? <CheckCircle2 className="h-6 w-6 text-primary mt-1" /> : <XCircle className="h-6 w-6 text-destructive mt-1" />}
                    <div className="flex-1">
                      <CardTitle className="text-xl">Câu {idx + 1}</CardTitle>
                      <CardDescription className="mt-2">{q.question_text}</CardDescription>
                      <p className="mt-2 text-sm font-medium">
                        {isCorrect ? <span className="text-primary">+{q.score} điểm</span> : <span className="text-destructive">0 điểm</span>}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {q.options.map(opt => {
                    const isUser = userAnswer.includes(opt.id)
                    const isRight = opt.is_correct
                    let bg = "bg-muted/50"
                    if (isRight) bg = "bg-primary/10 border-primary"
                    else if (isUser && !isRight) bg = "bg-destructive/10 border-destructive"
                    return (
                      <div key={opt.id} className={`rounded-lg border-2 p-3 ${bg}`}>
                        <div className="flex justify-between">
                          <span>{opt.option_text}</span>
                          <div className="flex gap-2">
                            {isUser && <span className="text-xs text-muted-foreground">Bạn đã chọn</span>}
                            {isRight && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )
          })}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/assignments/completed")} className="flex-1">Bài tập đã làm</Button>
            <Button onClick={() => router.push(`/assignments/${params.id}`)} className="flex-1">Làm lại</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
