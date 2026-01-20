"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const calcTotalScore = (questions = []) =>
  questions.reduce((sum, q) => sum + Number(q.score || 0), 0)

export default function DoAssignmentPage() {
  const router = useRouter()
  const params = useParams()
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)

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

        const mappedAssignment = {
          ...data.assignment,
          questions: data.assignment.questions.map(q => ({
            ...q,
            score: Number(q.score || 0),
            question_text: q.content,
            question_type: q.type,
            options: q.answers.map(a => ({
              id: a.id,
              option_text: a.content
            }))
          }))
        }

        setAssignment({
          ...mappedAssignment,
          total_score:
            mappedAssignment.total_score ||
            calcTotalScore(mappedAssignment.questions),
        })
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignment()
  }, [params?.id, router])

  if (loading) return <div className="text-center mt-20">Đang tải bài tập...</div>
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>
  if (!assignment) return null

  const questions = assignment.questions || []

  const handleAnswerChange = (questionId, answerId, isMultiple) => {
    if (isMultiple) {
      const current = userAnswers[questionId] || []
      const newAnswers = current.includes(answerId)
        ? current.filter(id => id !== answerId)
        : [...current, answerId]
      setUserAnswers({ ...userAnswers, [questionId]: newAnswers })
    } else {
      setUserAnswers({ ...userAnswers, [questionId]: [answerId] })
    }
  }

  const handleSubmit = async () => {
    try {
      const answersPayload = questions.map(q => ({
        question_id: q.id,
        answer_id: userAnswers[q.id] || []
      }))

      const res = await fetch(`${API_URL}/api/assignments/submit`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignment_id: assignment.id,
          answers: answersPayload,
        }),
      })

      const data = await res.json()

      // 🔥 CHỐNG BE ĐỔI FORMAT
      setScore(
        Number(data.score ?? data.submission?.score ?? 0)
      )

      setAssignment(prev => ({
        ...prev,
        total_score: Number(
          data.total_score ??
          prev.total_score ??
          calcTotalScore(prev.questions)
        )
      }))

      setIsSubmitted(true)
    } catch (err) {
      console.error(err)
      alert("Có lỗi khi nộp bài")
    }
  }

  if (isSubmitted) {
    const realTotal = assignment.total_score
    const percentage = realTotal
      ? ((score / realTotal) * 100).toFixed(0)
      : 0

    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                {Number.parseInt(percentage) >= 70 ? (
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                ) : (
                  <XCircle className="h-12 w-12 text-destructive" />
                )}
              </div>
              <CardTitle className="text-3xl">Hoàn thành bài tập!</CardTitle>
              <CardDescription>Kết quả của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="text-5xl font-bold text-primary">
                {score}/{realTotal}
              </div>
              <p className="mt-2 text-lg text-muted-foreground">
                {percentage}% điểm
              </p>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button variant="outline" onClick={() => router.push("/assignments")} className="flex-1">
                Danh sách bài tập
              </Button>
              <Button
                onClick={() => {
                  setIsSubmitted(false)
                  setCurrentQuestion(0)
                  setUserAnswers({})
                  setScore(0)
                }}
                className="flex-1"
              >
                Làm lại
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const isMultiple = question.question_type === "multiple"
  const userAnswer = userAnswers[question.id] || []

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{question.question_text}</CardTitle>
              <CardDescription>
                {isMultiple ? "Chọn tất cả đáp án đúng" : "Chọn một đáp án"} • {question.score} điểm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isMultiple ? (
                <div className="space-y-3">
                  {question.options.map(option => (
                    <div key={option.id} className="flex items-center space-x-3 border p-4 rounded-lg">
                      <Checkbox
                        checked={userAnswer.includes(option.id)}
                        onCheckedChange={() =>
                          handleAnswerChange(question.id, option.id, true)
                        }
                      />
                      <Label className="flex-1 cursor-pointer">
                        {option.option_text}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <RadioGroup
                  value={userAnswer[0]?.toString()}
                  onValueChange={val =>
                    handleAnswerChange(question.id, Number(val), false)
                  }
                >
                  <div className="space-y-3">
                    {question.options.map(option => (
                      <div key={option.id} className="flex items-center space-x-3 border p-4 rounded-lg">
                        <RadioGroupItem value={option.id.toString()} />
                        <Label className="flex-1 cursor-pointer">
                          {option.option_text}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(q => q - 1)}
                disabled={currentQuestion === 0}
              >
                Câu trước
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(userAnswers).length !== questions.length}
                >
                  Nộp bài
                </Button>
              ) : (
                <Button onClick={() => setCurrentQuestion(q => q + 1)}>
                  Câu tiếp theo
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
