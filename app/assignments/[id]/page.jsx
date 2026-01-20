"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { AssignmentDetail } from "@/components/assignment-detail"

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function AssignmentPage() {
  const params = useParams()
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(
          `${API_BASE}/api/assignments/${params.id}`
        )

        if (!res.ok) throw new Error("Không tìm thấy bài tập")

        const data = await res.json()
        const assignment = data.assignment

        assignment.questions = assignment.questions.map(q => ({
          id: q.id,
          question_text: q.content,
          question_type: q.type,
          score: q.score,
          options: q.answers.map(a => ({
            id: a.id,
            option_text: a.content
          }))
        }))

        setAssignment(assignment)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) fetchAssignment()
  }, [params.id])

  if (loading) return <div className="text-center py-20">Đang tải bài tập...</div>
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>
  if (!assignment) return <div className="text-center py-20">Bài tập không tồn tại</div>

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <AssignmentDetail assignment={assignment} />
      </main>
    </div>
  )
}
