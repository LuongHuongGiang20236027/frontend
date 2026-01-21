"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginDialog({ open, onOpenChange }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  // 🔹 Đăng nhập
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Email hoặc mật khẩu không đúng!")
        setLoading(false)
        return
      }

      // 🔹 Lưu vào localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("token", data.token)

        // 🔹 Gửi event để Header và ProfilePage cập nhật user
        window.dispatchEvent(new CustomEvent("user-login", { detail: data.user }))
      }

      // Đóng dialog và reset form
      onOpenChange(false)
      setEmail("")
      setPassword("")
    } catch (err) {
      console.error(err)
      setError("Lỗi kết nối server")
    }

    setLoading(false)
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      // khởi tạo function mở LoginDialog
      window.openLoginDialog = () => onOpenChange(true)

      // khởi tạo function mở RegisterDialog
      window.openRegisterDialog =
        window.openRegisterDialog || (() => { })
    }
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 space-y-4">
        <DialogHeader>
          <DialogTitle>Đăng nhập</DialogTitle>
          <DialogDescription>
            Nhập email và mật khẩu để tiếp tục
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="demo@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Mật khẩu</Label>
            <Input
              type="password"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-100 px-2 py-1 rounded">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          <div className="text-center text-sm pt-2">
            Chưa có tài khoản?{" "}
            <button
              type="button"
              className="text-secondary font-medium hover:underline"
              onClick={() => {
                onOpenChange(false)
                if (typeof window.openRegisterDialog === "function") {
                  window.openRegisterDialog()
                }
              }}
            >
              Đăng ký
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
