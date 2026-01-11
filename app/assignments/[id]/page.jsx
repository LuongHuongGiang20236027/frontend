"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { AssignmentDetail } from "@/components/assignment-detail"
import { API_BASE_URL } from "@/config"

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
        const res = await fetch(`${API_BASE_URL}/api/assignments/${params.id}/student`)

        if (!res.ok) throw new Error("Không tìm thấy bài tập")
        const data = await res.json()
        setAssignment(data.assignment)
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
