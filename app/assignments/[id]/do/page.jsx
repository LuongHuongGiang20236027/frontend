"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

// 🔹 API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL

// 🔹 Helper lấy JWT token
const getToken = () => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

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

  // 🔹 Load assignment
  useEffect(() => {
    if (!params?.id || !API_URL) return

    const fetchAssignment = async () => {
      try {
        const token = getToken()

        if (!token) {
          router.push("/login")
          return
        }

        const res = await fetch(
          `${API_URL}/api/assignments/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!res.ok) {
          if (res.status === 404) router.replace("/404")
          throw new Error("Bài tập không tìm thấy")
        }

        const data = await res.json()

        // 🔹 Map lại format cho FE
        const mappedAssignment = {
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

        setAssignment(mappedAssignment)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignment()
  }, [params?.id, router])

  // 🔹 Đếm số câu đã trả lời thật sự
  const answeredCount = useMemo(() => {
    return Object.values(userAnswers).filter(arr => arr.length > 0).length
  }, [userAnswers])

  if (loading) return <div className="text-center mt-20">Đang tải bài tập...</div>
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>
  if (!assignment) return null

  const questions = assignment.questions || []
  const question = questions[currentQuestion]
  const isMultiple = question.question_type === "multiple"
  const userAnswer = userAnswers[question.id] || []

  // 🔹 Chọn đáp án
  const handleAnswerChange = (questionId, answerId, isMultiple) => {
    if (isMultiple) {
      const current = userAnswers[questionId] || []
      const newAnswers = current.includes(answerId)
        ? current.filter(id => id !== answerId)
        : [...current, answerId]

      setUserAnswers(prev => ({
        ...prev,
        [questionId]: newAnswers
      }))
    } else {
      setUserAnswers(prev => ({
        ...prev,
        [questionId]: [answerId]
      }))
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(q => q + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(q => q - 1)
    }
  }

  // 🔹 Submit bài
  const handleSubmit = async () => {
    try {
      const token = getToken()

      if (!token) {


        router.push("/login")
        return
      }

      // 🔹 Đúng format backend hay dùng
      const answersPayload = questions.map(q => ({
        question_id: q.id,
        answer_id
          : userAnswers[q.id] || []
      }))

      console.log("SUBMIT PAYLOAD:", {
        assignment_id: assignment.id,
        answers: answersPayload
      })

      const res = await fetch(
        `${API_URL}/api/assignments/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            assignment_id: assignment.id,
            answers: answersPayload
          })
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Nộp bài thất bại")
      }

      setScore(Number(data.score || 0))
      setIsSubmitted(true)
    } catch (err) {
      console.error(err)


    }
  }

  // 🔹 Màn hình kết quả
  if (isSubmitted) {
    const percentage = assignment.total_score
      ? ((score / assignment.total_score) * 100).toFixed(0)
      : 0

    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                {Number(percentage) >= 70 ? (
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
                {score}/{assignment.total_score}
              </div>
              <p className="mt-2 text-lg text-muted-foreground">
                {percentage}% điểm
              </p>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/assignments")}
                className="flex-1"
              >
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

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Câu {currentQuestion + 1} / {questions.length}
              </p>
              <div className="mt-2 h-2 w-64 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`
                  }}
                />
              </div>
            </div>

            <div className="text-sm font-medium text-primary">
              {answeredCount} / {questions.length} đã trả lời
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-balance">
                {question.question_text}
              </CardTitle>
              <CardDescription>
                {isMultiple
                  ? "Chọn tất cả đáp án đúng"
                  : "Chọn một đáp án"}{" "}
                • {question.score} điểm
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isMultiple ? (
                <div className="space-y-3">
                  {question.options.map(option => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`option-${option.id}`}
                        checked={userAnswer.includes(option.id)}
                        onCheckedChange={() =>
                          handleAnswerChange(
                            question.id,
                            option.id,
                            true
                          )
                        }
                      />
                      <Label
                        htmlFor={`option-${option.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option.option_text}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <RadioGroup
                  value={userAnswer[0]?.toString()}
                  onValueChange={val =>
                    handleAnswerChange(
                      question.id,
                      Number(val),
                      false
                    )
                  }
                >
                  <div className="space-y-3">
                    {question.options.map(option => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                      >
                        <RadioGroupItem
                          value={option.id.toString()}
                          id={`option-${option.id}`}
                        />
                        <Label
                          htmlFor={`option-${option.id}`}
                          className="flex-1 cursor-pointer"
                        >
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
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Câu trước
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={answeredCount !== questions.length}
                >
                  Nộp bài
                </Button>
              ) : (
                <Button onClick={handleNext}>
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
