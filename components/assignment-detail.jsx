"use client"
// frontend/components/assignment-detail.jsx
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function AssignmentDetail({ assignment }) {
  const router = useRouter()

  const [isStarted, setIsStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  // ===== JWT AUTH =====
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user")
      const storedToken = localStorage.getItem("token")

      if (storedUser) setUser(JSON.parse(storedUser))
      if (storedToken) setToken(storedToken)
    }
  }, [])

  // =====================

  // Nhấn bắt đầu làm bài
  const handleStart = () => {
    if (!user || !token) {
      alert("Vui lòng đăng nhập để làm bài tập")
      return
    }
    setIsStarted(true)
  }

  // Xử lý thay đổi câu trả lời
  const handleAnswerChange = (questionId, answerId, isMultiple) => {
    if (isMultiple) {
      const current = userAnswers[questionId] || []
      const newAnswers = current.includes(answerId)
        ? current.filter((id) => id !== answerId)
        : [...current, answerId]

      setUserAnswers({ ...userAnswers, [questionId]: newAnswers })
    } else {
      setUserAnswers({ ...userAnswers, [questionId]: [answerId] })
    }
  }

  // Chuyển câu hỏi tiếp theo
  const handleNext = () => {
    if (currentQuestion < assignment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  // Chuyển câu hỏi trước đó
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  // ===== NỘP BÀI + GỬI JWT =====
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const handleSubmit = async () => {
    // 🔐 Check login trước
    if (!token) {
      alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại")
      router.push("/login")
      return
    }

    let totalScore = 0

    assignment.questions.forEach((question) => {
      const userAnswer = userAnswers[question.id] || []
      const correctAnswers = question.options
        .filter((a) => a.is_correct)
        .map((a) => a.id)

      const isCorrect =
        userAnswer.length === correctAnswers.length &&
        userAnswer.every((id) => correctAnswers.includes(id)) &&
        correctAnswers.every((id) => userAnswer.includes(id))

      if (isCorrect) {
        totalScore += question.score
      }
    })

    setScore(totalScore)
    setIsSubmitted(true)

    try {
      const res = await fetch(`${API_URL}/api/assignments/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignment_id: assignment.id,
          answers: userAnswers,
          score: totalScore,
        }),
      })

      // 🚨 JWT hết hạn
      if (res.status === 401) {
        alert("Phiên đăng nhập đã hết hạn")
        router.push("/login")
        return
      }

      // 🚨 Server lỗi
      if (!res.ok) {
        alert("Nộp bài thất bại, vui lòng thử lại")
        return
      }
    } catch (err) {
      console.error("Lỗi gửi bài:", err)
      alert("Không thể kết nối tới server")
    }
  }

  // ==========================

  // Nếu đã nộp bài, hiển thị kết quả
  if (isSubmitted) {
    const percentage = ((score / assignment.total_score) * 100).toFixed(0)

    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

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

          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">
                {score}/{assignment.total_score}
              </div>
              <p className="mt-2 text-lg text-muted-foreground">{percentage}% điểm</p>
            </div>

            <div className="space-y-4 rounded-lg bg-muted/50 p-6">
              <h3 className="font-semibold">Chi tiết kết quả:</h3>
              {assignment.questions.map((question, index) => {
                const userAnswer = userAnswers[question.id] || []
                const correctAnswers = question.options
                  .filter((a) => a.is_correct)
                  .map((a) => a.id)

                const isCorrect =
                  userAnswer.length === correctAnswers.length &&
                  userAnswer.every((id) => correctAnswers.includes(id)) &&
                  correctAnswers.every((id) => userAnswer.includes(id))

                return (
                  <div key={question.id} className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        Câu {index + 1}: {question.question_text}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isCorrect ? `+${question.score} điểm` : "0 điểm"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/assignments")} className="flex-1">
              Danh sách bài tập
            </Button>
            <Button
              onClick={() => {
                setIsStarted(false)
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
      </div>
    )
  }

  // ========== MÀN HÌNH CHƯA BẮT ĐẦU ==========
  if (!isStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        <div className="mx-auto max-w-4xl">
          <div className="relative mb-8 overflow-hidden rounded-2xl">
            <img
              src={assignment.thumbnail || "/placeholder.svg?height=400&width=800"}
              alt={assignment.title}
              className="h-75 w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl font-bold">{assignment.title}</h1>
              <p className="mt-2 text-lg text-white/90">{assignment.description}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin bài tập</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Số câu hỏi:</span>
                  <span className="font-semibold">{assignment.questions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tổng điểm:</span>
                  <span className="font-semibold text-primary">{assignment.total_score}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Người tạo:</span>
                  <span className="font-semibold">{assignment.creator_name}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hướng dẫn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>• Đọc kỹ từng câu hỏi trước khi trả lời</p>
                <p>• Một số câu có thể có nhiều đáp án đúng</p>
                <p>• Bạn có thể quay lại các câu trước đó</p>
                <p>• Kiểm tra lại trước khi nộp bài</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {!user ? "Bạn cần đăng nhập để làm bài tập" : "Sẵn sàng để bắt đầu?"}
                </span>
              </div>
              <Button size="lg" onClick={handleStart}>
                Bắt đầu làm bài
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ========== MÀN HÌNH LÀM BÀI ==========
  const question = assignment.questions[currentQuestion]
  const isMultiple = question.question_type === "multiple"
  const userAnswer = userAnswers[question.id] || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Câu {currentQuestion + 1} / {assignment.questions.length}
            </p>
            <div className="mt-2 h-2 w-64 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((currentQuestion + 1) / assignment.questions.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-sm font-medium text-primary">
            {Object.keys(userAnswers).length} / {assignment.questions.length} đã trả lời
          </div>
        </div>

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
                {question.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50">
                    <Checkbox
                      id={`option-${option.id}`}
                      checked={userAnswer.includes(option.id)}
                      onCheckedChange={() => handleAnswerChange(question.id, option.id, true)}
                    />
                    <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <RadioGroup
                value={userAnswer[0]?.toString()}
                onValueChange={(val) => handleAnswerChange(question.id, Number.parseInt(val), false)}
              >
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50"
                    >
                      <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                      <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                        {option.option_text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
              Câu trước
            </Button>
            {currentQuestion === assignment.questions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={Object.keys(userAnswers).length !== assignment.questions.length}>
                Nộp bài
              </Button>
            ) : (
              <Button onClick={handleNext}>Câu tiếp theo</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
