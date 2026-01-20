"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, FileText, Heart, Sparkles, Users, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Header } from "@/components/header"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// 🔹 Trang chủ
export default function HomePage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [likedDocs, setLikedDocs] = useState(new Set())

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        await Promise.all([fetchAssignments(), fetchDocuments()])
        return
      }

      await Promise.all([
        fetchAssignments(),
        fetchDocuments(),
        fetchLikedDocuments(token),
      ])
    } catch (err) {
      console.error(err)
      await Promise.all([fetchAssignments(), fetchDocuments()])
    } finally {
      setLoading(false)
    }
  }

  // ❤️ fetch liked documents (JWT)
  const fetchLikedDocuments = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/documents/liked`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) return

      const data = await res.json()
      setLikedDocs(new Set((data.documents || []).map((d) => d.id)))
    } catch (err) {
      console.error(err)
    }
  }

  // 📘 fetch assignments
  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/assignments`)
      const data = await res.json()
      setAssignments((data.assignments || []).slice(0, 4))
    } catch (err) {
      console.error("Fetch assignments failed", err)
    }
  }

  // 📄 fetch documents
  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/documents`)
      const data = await res.json()
      setDocuments((data.documents || []).slice(0, 4))
    } catch (err) {
      console.error("Fetch documents failed", err)
    }
  }

  // ❤️ LIKE DOCUMENT (JWT)
  const handleLike = async (docId) => {
    const token = localStorage.getItem("token")

    if (!token) {
      alert("Vui lòng đăng nhập để thích tài liệu")
      router.push("/login")
      return
    }

    const isLiked = likedDocs.has(docId)

    // optimistic UI
    setLikedDocs((prev) => {
      const next = new Set(prev)
      isLiked ? next.delete(docId) : next.add(docId)
      return next
    })

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? {
            ...doc,
            like_count: isLiked
              ? Number(doc.like_count) - 1
              : Number(doc.like_count) + 1,
          }
          : doc
      )
    )

    try {
      const res = await fetch(`${API_URL}/api/documents/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ document_id: docId }),
      })

      if (!res.ok) throw new Error("Like failed")
    } catch (err) {
      console.error(err)

      // rollback
      setLikedDocs((prev) => {
        const next = new Set(prev)
        isLiked ? next.add(docId) : next.delete(docId)
        return next
      })

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId
            ? {
              ...doc,
              like_count: isLiked
                ? Number(doc.like_count) + 1
                : Number(doc.like_count) - 1,
            }
            : doc
        )
      )
    }
  }

  // ✅ LÀM BÀI = CHECK JWT
  const handleDoAssignment = (assignmentId) => {
    const token = localStorage.getItem("token")

    if (!token) {
      alert("Vui lòng đăng nhập để làm bài tập")
      router.push("/login")
      return
    }

    router.push(`/assignments/${assignmentId}/do`)
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-linear-to-br from-primary/10 via-secondary/10 to-accent/10 py-20">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">
                Nền tảng học tập hiện đại
              </span>
            </div>

            <h1 className="mb-6 text-5xl font-bold">
              Học tập thông minh với{" "}
              <span className="bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Smart Edu
              </span>
            </h1>

            <p className="text-xl text-muted-foreground">
              Khám phá hàng trăm bài tập và tài liệu chất lượng cao. Nâng cao kỹ
              năng của bạn với các bài tập tương tác và tài nguyên học tập đa
              dạng.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 grid gap-6 md:grid-cols-3">
            <Feature icon={<Trophy />} title="Bài tập tương tác" />
            <Feature icon={<FileText />} title="Tài liệu phong phú" />
            <Feature icon={<Users />} title="Cộng đồng sôi động" />
          </div>
        </section>

        {/* Assignments */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <SectionHeader
              title="Tất cả bài tập"
              desc="Thử sức với các bài tập của hệ thống"
              href="/assignments"
            />

            {loading ? (
              <p>Đang tải...</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {assignments.map((assignment) => (
                  <Card
                    key={assignment.id}
                    className="group overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={
                          assignment.thumbnail
                            ? `${API_URL}${assignment.thumbnail}`
                            : "/placeholder.svg"
                        }
                        alt={assignment.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <CardHeader>
                      <CardTitle className="line-clamp-1">
                        {assignment.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {assignment.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {assignment.questions?.length ?? 0} câu hỏi
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="font-medium text-primary">
                          {assignment.total_score} điểm
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-muted-foreground">
                        Tạo bởi {assignment.author_name}
                      </p>
                    </CardContent>

                    <CardFooter className="gap-2">
                      <Button
                        className="flex-1 bg-transparent"
                        variant="outline"
                        asChild
                      >
                        <Link
                          href={`/assignments/${assignment.id}/view`}
                        >
                          Xem đề
                        </Link>
                      </Button>

                      <Button
                        className="flex-1"
                        onClick={() =>
                          handleDoAssignment(assignment.id)
                        }
                      >
                        Làm bài
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Documents */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <SectionHeader
              title="Tài liệu mới"
              desc="Khám phá tài liệu học tập chất lượng cao"
              href="/documents"
            />

            {loading ? (
              <p>Đang tải...</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {documents.map((doc) => {
                  const isLiked = likedDocs.has(doc.id)

                  return (
                    <Card
                      key={doc.id}
                      className="group overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative aspect-4/3 overflow-hidden bg-muted">
                        <img
                          src={`${API_URL}${doc.thumbnail}`}
                          alt={doc.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />

                        <button
                          onClick={() => handleLike(doc.id)}
                          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow hover:scale-110 transition"
                        >
                          <Heart
                            className={`h-5 w-5 ${isLiked
                              ? "fill-red-500 text-red-500"
                              : "text-gray-500"
                              }`}
                          />
                        </button>
                      </div>

                      <CardHeader>
                        <CardTitle className="line-clamp-1">
                          {doc.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {doc.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {doc.like_count} lượt thích
                        </p>
                      </CardContent>

                      <CardFooter>
                        <Button
                          variant="secondary"
                          className="w-full"
                          asChild
                        >
                          <Link href={`/documents/${doc.id}`}>
                            Xem
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

/* ====== Helper components ====== */

function Feature({ icon, title }) {
  return (
    <Card className="border-2">
      <CardHeader>
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function SectionHeader({ title, desc, href }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="mt-2 text-muted-foreground">{desc}</p>
      </div>
      <Button variant="outline" asChild>
        <Link href={href}>Xem tất cả</Link>
      </Button>
    </div>
  )
}
