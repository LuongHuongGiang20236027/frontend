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
  }, [])

  const totalScore = questions.reduce(
    (sum, q) => sum + q.score,
    0
  )

  // =========================
  // QUESTION HELPERS
  // =========================

  const addQuestion = () => {
    const newId = Math.max(...questions.map((q) => q.id)) + 1
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
            Math.max(...q.options.map((o) => o.id)) + 1
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

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault()

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

            {/* Form giữ nguyên */}
          </div>
        </div>
      </main>
    </div>
  )
}
