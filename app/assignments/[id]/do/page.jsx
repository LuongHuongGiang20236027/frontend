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
  const [attemptInfo, setAttemptInfo] = useState(null)

  const [remainingSeconds, setRemainingSeconds] = useState(null)
  const [timeUp, setTimeUp] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitLock = useRef(false)

  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const formatDateVN = date => {
    if (!date) return "—"
    const d = new Date(date)
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`
  }

  const formatTimeVN = date => {
    if (!date) return "—"
    const d = new Date(date)
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`
  }

  // =============================
  // SUBMIT
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
        submit_reason: reason
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

      // 👉 Redirect sang trang kết quả chi tiết
      const attemptId = data.attempt.id
      router.push(
        `/assignments/${assignment.id}/result/${attemptId}`
      )
    } catch (err) {
      console.error(err)
      submitLock.current = false
      setIsSubmitting(false)
      alert(err.message || "Có lỗi khi nộp bài")
    }
  }, [assignment, userAnswers, router])


  // =============================
  // LOAD ASSIGNMENT + START ATTEMPT
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

        // TIMER
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
    if (timeUp || isSubmitted) return

    setTimeUp(true)
    submitAssignment("timeup")
  }, [remainingSeconds, timeUp, isSubmitted, submitAssignment])

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

  // =============================
  // UI STATES
  // =============================
  if (loading) return <div className="text-center mt-20">Đang tải bài tập...</div>
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>
  if (!assignment) return null

  const questions = assignment.questions || []



  // =============================
  // DO ASSIGNMENT SCREEN
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

          <AssignmentDetail
            questions={questions}
            currentQuestion={currentQuestion}
            userAnswers={userAnswers}
            onAnswerChange={(qid, aid, multi) => {
              if (multi) {
                const current = userAnswers[qid] || []
                const newAnswers = current.includes(aid)
                  ? current.filter(id => id !== aid)
                  : [...current, aid]

                setUserAnswers(prev => ({
                  ...prev,
                  [qid]: newAnswers
                }))
              } else {
                setUserAnswers(prev => ({
                  ...prev,
                  [qid]: [aid]
                }))
              }
            }}
            onNext={() =>
              setCurrentQuestion(q =>
                Math.min(q + 1, questions.length - 1)
              )
            }
            onPrevious={() =>
              setCurrentQuestion(q => Math.max(q - 1, 0))
            }
            onSubmit={() => submitAssignment("manual")}
            answeredCount={answeredCount}
            isSubmitting={isSubmitting}
          />
        </div>
      </main>
    </div>
  )
}
