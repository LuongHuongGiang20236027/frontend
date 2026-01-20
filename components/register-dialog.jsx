"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 🔹 Dialog đăng ký
export function RegisterDialog({ open, onOpenChange }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("")
  const [gender, setGender] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [loading, setLoading] = useState(false)

  // 🔹 Xử lý đăng ký
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!")
      return
    }

    if (!role) {
      alert("Vui lòng chọn vai trò!")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          role,
          gender,
          birth_date: birthDate,
        }),
      })


      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Đăng ký thất bại")
      } else {
        alert("Đăng ký thành công!")

        // 🔹 Lưu vào localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(data.user))
          localStorage.setItem("token", data.token)
          // 🔹 Gửi event để Header và ProfilePage cập nhật user
          window.dispatchEvent(
            new CustomEvent("user-login", {
              detail: data.user,
            })
          )

        }

        // Đóng dialog và reset form
        onOpenChange(false)
        setName("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setRole("")
        setGender("")
        setBirthDate("")
      }
    } catch (err) {
      console.error(err)
      alert("Lỗi kết nối server")
    }

    setLoading(false)
  }

  // mở dialog từ bên ngoài
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.openRegisterDialog = () => onOpenChange(true)
    }
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Đăng ký</DialogTitle>
          <DialogDescription>Tạo tài khoản mới để bắt đầu học tập</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên</Label>
            <Input
              id="name"
              type="text"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Vai trò *</Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Học sinh</SelectItem>
                <SelectItem value="teacher">Giáo viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Mật khẩu</Label>
            <Input
              id="reg-password"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Giới tính (tuỳ chọn)</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Nam</SelectItem>
                <SelectItem value="female">Nữ</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Ngày sinh (tuỳ chọn)</Label>
            <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>

          <div className="text-center text-sm pt-2">
            Đã có tài khoản?{" "}
            <button
              type="button"
              className="text-secondary font-medium hover:underline"
              onClick={() => {
                onOpenChange(false)           // đóng RegisterDialog
                if (typeof window.openLoginDialog === "function") {
                  window.openLoginDialog()    // mở LoginDialog
                }
              }}
            >
              Đăng nhập
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
