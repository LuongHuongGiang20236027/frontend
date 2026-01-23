"use client"
import { AssignmentDetail } from "@/components/assignment-detail"

import { useEffect, useState, useMemo, useCallback, useRef } from "react"
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

const API_URL = process.env.NEXT_PUBLIC_API_URL

const getToken = () => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

const shuffleArray = arr => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function DoAssignmentPage() {
  const router = useRouter()
  const params = useParams()

  const [remainingSeconds, setRemainingSeconds] = useState(null)
  const [timeUp, setTimeUp] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitLock = useRef(false)
  const autoSubmitRef = useRef(false)

  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  // =============================
  // SUBMIT CHUẨN
  // =============================
  const submitAssignment = useCallback(async (reason = "manual") => {
    if (submitLock.current) return
    submitLock.current = true
    setIsSubmitting(true)

    try {
      const token = getToken()
      if (!token || !assignment) return

      const questions = assignment.questions || []
      const answersPayload = questions.map(q => ({
        question_id: q.id,
        answer_id: userAnswers[q.id] || []
      }))

      const payload = {
        assignment_id: assignment.id,
        answers: answersPayload,
        submitted_at: new Date().toISOString(),
        submit_reason: reason // manual | timeup | fullscreen | unload
      }

      const res = await fetch(`${API_URL}/api/assignments/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Nộp bài thất bại")

      setScore(Number(data.score || 0))
      setIsSubmitted(true)

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => { })
      }
    } catch (err) {
      console.error(err)
      submitLock.current = false
      setIsSubmitting(false)
      alert(err.message || "Có lỗi khi nộp bài")
    }
  }, [assignment, userAnswers])

  // =============================
  // LOAD ASSIGNMENT
  // =============================
  useEffect(() => {
    if (!params?.id || !API_URL) return

    const fetchAssignment = async () => {
      try {
        const token = getToken()
        if (!token) {
          router.push("/login")
          return
        }

        const res = await fetch(`${API_URL}/api/assignments/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) {
          if (res.status === 404) router.replace("/404")
          throw new Error("Bài tập không tìm thấy")
        }

        const data = await res.json()

        const mappedAssignment = {
          ...data.assignment,
          questions: shuffleArray(
            data.assignment.questions.map(q => ({
              id: q.id,
              question_text: q.content,
              question_type: q.type,
              score: q.score,
              options: shuffleArray(
                q.answers.map(a => ({
                  id: a.id,
                  option_text: a.content
                }))
              )
            }))
          )
        }

        setAssignment(mappedAssignment)

        // START ATTEMPT
        const startRes = await fetch(`${API_URL}/api/assignments/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            assignment_id: data.assignment.id
          })
        })

        const startData = await startRes.json()
        if (!startRes.ok) {
          throw new Error(startData.error || "Không thể bắt đầu bài làm")
        }

        if (data.assignment.time_limit) {
          const startedAt = new Date(startData.attempt.started_at).getTime()
          const limitMs = data.assignment.time_limit * 60 * 1000

          const remain = Math.max(
            Math.floor((startedAt + limitMs - Date.now()) / 1000),
            0
          )

          setRemainingSeconds(remain)
        }
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignment()
  }, [params?.id, router])

  // =============================
  // TIMER
  // =============================
  useEffect(() => {
    if (remainingSeconds === null) return
    if (isSubmitted || timeUp) return

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [remainingSeconds, isSubmitted, timeUp])

  // =============================
  // HẾT GIỜ → AUTO SUBMIT
  // =============================
  useEffect(() => {
    if (remainingSeconds !== 0) return
    if (timeUp || isSubmitted || autoSubmitRef.current) return

    autoSubmitRef.current = true
    setTimeUp(true)

    console.log("⏰ HẾT GIỜ → AUTO SUBMIT")
    submitAssignment("timeup")
  }, [remainingSeconds, timeUp, isSubmitted, submitAssignment])

  // =============================
  // ĐÓNG TAB / RELOAD
  // =============================
  useEffect(() => {
    const handler = () => {
      if (submitLock.current || isSubmitted || !assignment) return
      submitLock.current = true

      try {
        const token = getToken()
        if (!token) return

        const questions = assignment.questions || []
        const answersPayload = questions.map(q => ({
          question_id: q.id,
          answer_id: userAnswers[q.id] || []
        }))

        const payload = JSON.stringify({
          assignment_id: assignment.id,
          answers: answersPayload,
          submitted_at: new Date().toISOString(),
          submit_reason: "unload"
        })

        navigator.sendBeacon(
          `${API_URL}/api/assignments/submit`,
          new Blob([payload], { type: "application/json" })
        )
      } catch { }
    }

    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [assignment, userAnswers, isSubmitted])

  // =============================
  // FULLSCREEN → ESC = AUTO SUBMIT
  // =============================
  useEffect(() => {
    if (!document.fullscreenElement && !isSubmitted) {
      document.documentElement.requestFullscreen().catch(() => { })
    }

    const onFullScreenChange = () => {
      if (
        !document.fullscreenElement &&
        !timeUp &&
        !isSubmitted &&
        !autoSubmitRef.current
      ) {
        autoSubmitRef.current = true
        alert("⚠ Bạn đã thoát fullscreen. Bài sẽ được tự động nộp!")
        submitAssignment("fullscreen")
      }
    }

    document.addEventListener("fullscreenchange", onFullScreenChange)
    return () =>
      document.removeEventListener("fullscreenchange", onFullScreenChange)
  }, [timeUp, isSubmitted, submitAssignment])

  // =============================
  // HELPERS
  // =============================
  const formatTime = seconds => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

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

  // =============================
  // CHỌN ĐÁP ÁN
  // =============================
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

  // =============================
  // MÀN HÌNH KẾT QUẢ
  // =============================
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
              {timeUp && (
                <p className="text-sm text-muted-foreground animate-pulse">
                  ⏳ Bài đã được tự động nộp khi hết giờ
                </p>
              )}
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/assignments")}
                className="flex-1"
              >
                Danh sách bài tập
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
  }

  // =============================
  // MÀN HÌNH LÀM BÀI
  // =============================
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

            {remainingSeconds !== null && (
              <div
                className={`text-lg font-bold ${remainingSeconds <= 60
                  ? "text-destructive animate-pulse"
                  : "text-primary"
                  }`}
              >
                ⏳ {formatTime(remainingSeconds)}
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {question.question_text}
              </CardTitle>
              <CardDescription>
                {isMultiple
                  ? "Chọn tất cả đáp án đúng"
                  : "Chọn một đáp án"} • {question.score} điểm
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isMultiple ? (
                <div className="space-y-3">
                  {question.options.map(option => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50"
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
                        className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50"
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

            <CardFooter className="flex justify-end">
              {currentQuestion === questions.length - 1 && (
                <Button
                  onClick={() => submitAssignment("manual")}
                  disabled={
                    answeredCount !== questions.length ||
                    isSubmitting
                  }
                >
                  Nộp bài
                </Button>
              )}

              {currentQuestion !== questions.length - 1 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                  >
                    Câu trước
                  </Button>
                  <Button onClick={handleNext}>
                    Câu tiếp theo
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
