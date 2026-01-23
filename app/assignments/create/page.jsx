"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Plus, Trash2, X } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Header } from "@/components/header"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function CreateAssignmentPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: null,

    start_time: "",
    end_time: "",
    time_limit: "",
    max_attempts: 1,
  })

  const [questions, setQuestions] = useState([
    {
      id: 1,
      question_text: "",
      question_type: "single",
      score: 10,
      options: [
        { id: 1, option_text: "", is_correct: false },
        { id: 2, option_text: "", is_correct: false },
      ],
    },
  ])

  // 🔐 CHECK LOGIN
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) router.push("/login")
  }, [router])

  // Guard nếu quên set env trên Vercel
  useEffect(() => {
    if (!API_URL) {
      console.error("❌ NEXT_PUBLIC_API_URL chưa được set trên Vercel")
      alert("Lỗi cấu hình hệ thống. Liên hệ admin.")
    }
  }, [])

  const totalScore = questions.reduce(
    (sum, q) => sum + (Number(q.score) || 0),
    0
  )

  // =========================
  // QUESTION HELPERS
  // =========================

  const addQuestion = () => {
    const newId =
      questions.length > 0
        ? Math.max(...questions.map((q) => q.id)) + 1
        : 1

    setQuestions([
      ...questions,
      {
        id: newId,
        question_text: "",
        question_type: "single",
        score: 10,
        options: [
          { id: 1, option_text: "", is_correct: false },
          { id: 2, option_text: "", is_correct: false },
        ],
      },
    ])
  }

  const removeQuestion = (questionId) => {
    if (questions.length > 1) {
      setQuestions(
        questions.filter((q) => q.id !== questionId)
      )
    }
  }

  const updateQuestion = (id, field, value) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      )
    )
  }

  const addOption = (questionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptionId =
            q.options.length > 0
              ? Math.max(...q.options.map((o) => o.id)) + 1
              : 1

          return {
            ...q,
            options: [
              ...q.options,
              {
                id: newOptionId,
                option_text: "",
                is_correct: false,
              },
            ],
          }
        }
        return q
      })
    )
  }

  const removeOption = (questionId, optionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options.length > 2) {
          return {
            ...q,
            options: q.options.filter(
              (o) => o.id !== optionId
            ),
          }
        }
        return q
      })
    )
  }

  const updateOption = (
    questionId,
    optionId,
    field,
    value
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((o) =>
              o.id === optionId
                ? { ...o, [field]: value }
                : o
            ),
          }
        }
        return q
      })
    )
  }

  const toggleCorrectAnswer = (
    questionId,
    optionId
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          if (q.question_type === "single") {
            return {
              ...q,
              options: q.options.map((o) => ({
                ...o,
                is_correct: o.id === optionId,
              })),
            }
          } else {
            return {
              ...q,
              options: q.options.map((o) =>
                o.id === optionId
                  ? {
                    ...o,
                    is_correct: !o.is_correct,
                  }
                  : o
              ),
            }
          }
        }
        return q
      })
    )
  }

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Optional: check size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh không được vượt quá 5MB")
      return
    }

    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }))
  }

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (
      formData.start_time &&
      formData.end_time &&
      new Date(formData.start_time) >=
      new Date(formData.end_time)
    ) {
      alert("Thời gian kết thúc phải sau thời gian bắt đầu")
      return
    }


    if (!API_URL) {
      alert("Chưa cấu hình API_URL trên hệ thống")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    if (!formData.title.trim()) {
      alert("Vui lòng nhập tiêu đề bài tập")
      return
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]

      if (!q.question_text.trim()) {
        alert(`Câu hỏi ${i + 1} chưa có nội dung`)
        return
      }

      if (!q.options.some((o) => o.is_correct)) {
        alert(`Câu hỏi ${i + 1} chưa có đáp án đúng`)
        return
      }

      for (const o of q.options) {
        if (!o.option_text.trim()) {
          alert(`Câu hỏi ${i + 1} có đáp án trống`)
          return
        }
      }
    }

    try {
      const fd = new FormData()

      fd.append("title", formData.title)
      fd.append("description", formData.description || "")
      fd.append("total_score", totalScore.toString())
      if (formData.start_time) {
        fd.append(
          "start_time",
          new Date(formData.start_time).toISOString()
        )
      }

      if (formData.end_time) {
        fd.append(
          "end_time",
          new Date(formData.end_time).toISOString()
        )
      }

      if (formData.time_limit) {
        fd.append(
          "time_limit",
          Number(formData.time_limit).toString()
        )
      }

      fd.append("max_attempts", formData.max_attempts.toString())


      fd.append(
        "questions",
        JSON.stringify(
          questions.map((q) => ({
            content: q.question_text,
            type: q.question_type,
            score: q.score,
            answers: q.options.map((o) => ({
              content: o.option_text,
              is_correct: o.is_correct,
            })),
          }))
        )
      )

      if (formData.thumbnail) {
        fd.append("thumbnail", formData.thumbnail)
      }

      const res = await fetch(
        `${API_URL}/api/assignments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fd, // ❗ KHÔNG set Content-Type
        }
      )

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Tạo bài tập thất bại")
        return
      }

      alert("🎉 Tạo bài tập thành công")
      router.push("/assignments/my-assignments")
    } catch (err) {
      console.error(err)
      alert("❌ Lỗi kết nối server")
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-4xl font-bold">
                  Tạo bài tập mới
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Xây dựng bài tập tùy chỉnh cho học sinh
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Thông tin bài tập */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin bài tập</CardTitle>
                  <CardDescription>
                    Tổng điểm: {totalScore}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Tiêu đề{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Nhập tiêu đề bài tập"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      placeholder="Mô tả ngắn gọn về bài tập"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Thời gian bắt đầu</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          start_time: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">Thời gian kết thúc</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          end_time: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time_limit">
                      Giới hạn thời gian (phút)
                    </Label>
                    <Input
                      id="time_limit"
                      type="number"
                      min="1"
                      step="1"
                      className="pointer-events-auto"
                      placeholder="VD: 30"
                      value={formData.time_limit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          time_limit: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_attempts">
                      Số lần làm tối đa
                    </Label>
                    <Input
                      id="max_attempts"
                      type="number"
                      min="1"
                      step="1"
                      className="pointer-events-auto"
                      value={formData.max_attempts}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_attempts: Number(e.target.value || 1),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ảnh bìa</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileChange(e, "thumbnail")
                      }
                    />
                    {formData.thumbnail && (
                      <p className="text-sm text-muted-foreground">
                        Đã chọn: {formData.thumbnail.name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Danh sách câu hỏi */}
              {questions.map((question, qIndex) => (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        Câu hỏi {qIndex + 1}
                      </CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeQuestion(question.id)
                        }
                        disabled={questions.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nội dung câu hỏi</Label>
                      <Textarea
                        placeholder="Nhập nội dung câu hỏi"
                        value={question.question_text}
                        onChange={(e) =>
                          updateQuestion(
                            question.id,
                            "question_text",
                            e.target.value
                          )
                        }
                        rows={2}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Loại câu hỏi</Label>
                        <RadioGroup
                          value={question.question_type}
                          onValueChange={(value) =>
                            updateQuestion(
                              question.id,
                              "question_type",
                              value
                            )
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="single"
                              id={`single-${question.id}`}
                            />
                            <Label
                              htmlFor={`single-${question.id}`}
                            >
                              Chọn 1 đáp án
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="multiple"
                              id={`multiple-${question.id}`}
                            />
                            <Label
                              htmlFor={`multiple-${question.id}`}
                            >
                              Chọn nhiều đáp án
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Điểm</Label>
                        <Input
                          type="number"
                          min="1"
                          value={question.score}
                          onChange={(e) =>
                            updateQuestion(
                              question.id,
                              "score",
                              Number.parseInt(
                                e.target.value || "0"
                              )
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Các đáp án</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            addOption(question.id)
                          }
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          Thêm đáp án
                        </Button>
                      </div>

                      {question.question_type ===
                        "single" ? (
                        <RadioGroup
                          value={
                            question.options
                              .find((o) => o.is_correct)
                              ?.id?.toString() || ""
                          }
                          onValueChange={(value) =>
                            toggleCorrectAnswer(
                              question.id,
                              Number(value)
                            )
                          }
                        >
                          {question.options.map(
                            (option, oIndex) => (
                              <div
                                key={option.id}
                                className="flex items-center gap-3"
                              >
                                <RadioGroupItem
                                  value={option.id.toString()}
                                  id={`opt-${question.id}-${option.id}`}
                                />
                                <Input
                                  placeholder={`Đáp án ${oIndex + 1
                                    }`}
                                  value={option.option_text}
                                  onChange={(e) =>
                                    updateOption(
                                      question.id,
                                      option.id,
                                      "option_text",
                                      e.target.value
                                    )
                                  }
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeOption(
                                      question.id,
                                      option.id
                                    )
                                  }
                                  disabled={
                                    question.options.length ===
                                    2
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          )}
                        </RadioGroup>
                      ) : (
                        question.options.map(
                          (option, oIndex) => (
                            <div
                              key={option.id}
                              className="flex items-center gap-3"
                            >
                              <Checkbox
                                checked={option.is_correct}
                                onCheckedChange={() =>
                                  toggleCorrectAnswer(
                                    question.id,
                                    option.id
                                  )
                                }
                              />
                              <Input
                                placeholder={`Đáp án ${oIndex + 1
                                  }`}
                                value={option.option_text}
                                onChange={(e) =>
                                  updateOption(
                                    question.id,
                                    option.id,
                                    "option_text",
                                    e.target.value
                                  )
                                }
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeOption(
                                    question.id,
                                    option.id
                                  )
                                }
                                disabled={
                                  question.options.length ===
                                  2
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addQuestion}
                className="w-full bg-transparent"
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm câu hỏi
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button type="submit" className="flex-1">
                  Tạo bài tập
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
