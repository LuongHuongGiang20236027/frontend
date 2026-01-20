"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarFallback, getAvatarColor } from "@/utils/avatar"
import { SelectInput } from "@/components/ui/select-input"

// 🔹 API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL

// 🔹 Helper lấy JWT token
const getToken = () => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

// 🔹 Trang hồ sơ người dùng
export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [gender, setGender] = useState("male")

  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // 🔹 Load user bằng JWT
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken()

        if (!token) {
          router.push("/login")
          return
        }

        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          localStorage.removeItem("token")
          router.push("/login")
          return
        }

        const data = await res.json()
        const u = data.user

        setUser(u)
        setName(u.name || "")
        setBirthDate(u.birth_date ? u.birth_date.slice(0, 10) : "")
        setGender(u.gender || "male")
        setAvatarPreview(u.avatar || "")

        // đồng bộ lại localStorage
        localStorage.setItem("user", JSON.stringify(u))
      } catch (err) {
        router.push("/login")
      }
    }

    fetchUser()
  }, [router])

  // nếu chưa load xong user
  if (!user) return null

  // 🔹 xử lý thay đổi avatar
  const handleChangeAvatar = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  // 🔹 xử lý lưu thông tin cá nhân
  const handleSaveProfile = async () => {
    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }

    const formData = new FormData()
    formData.append("name", name)
    formData.append("gender", gender)
    if (birthDate) formData.append("birth_date", birthDate)
    if (avatarFile) formData.append("avatar", avatarFile)

    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        alert("❌ Cập nhật thất bại!")
        return
      }

      const data = await res.json()

      setUser(data.user)
      setAvatarPreview(data.user.avatar || "")
      setAvatarFile(null)

      localStorage.setItem("user", JSON.stringify(data.user))

      // 🔹 dispatch event để Header update
      window.dispatchEvent(
        new CustomEvent("user-login", { detail: data.user })
      )

      alert("✅ Cập nhật thành công!")
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      alert("❌ Lỗi kết nối server")
    }
  }

  // 🔹 xử lý đổi mật khẩu
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("❌ Mật khẩu không khớp")
      return
    }

    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/user/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!res.ok) {
        alert("❌ Mật khẩu hiện tại sai!")
        return
      }

      alert("✅ Đổi mật khẩu thành công!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      console.error(err)
      alert("❌ Lỗi kết nối server")
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Cài đặt</h1>

        <div className="space-y-8">
          {/* --- Thông tin cá nhân --- */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Quản lý thông tin hồ sơ của bạn</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarPreview || ""} />
                  <AvatarFallback
                    className={`${getAvatarColor(user?.name)} text-white text-2xl font-bold`}>
                    {getAvatarFallback(user?.name)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="avatarInput"
                    onChange={handleChangeAvatar}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("avatarInput").click()}
                  >
                    Thay đổi ảnh
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ""} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Ngày sinh</Label>
                  <Input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Giới tính</Label>
                  <SelectInput
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    disabled={!isEditing}>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </SelectInput>
                </div>
              </div>

              <div className="flex gap-4">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
                ) : (
                  <>
                    <Button onClick={handleSaveProfile}>Lưu thay đổi</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Hủy
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* --- Đổi mật khẩu --- */}
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>Bảo mật tài khoản của bạn</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2 relative">
                <Label>Mật khẩu hiện tại</Label>
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <div className="space-y-2 relative">
                <Label>Mật khẩu mới</Label>
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <div className="space-y-2 relative">
                <Label>Xác nhận mật khẩu mới</Label>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <Button onClick={handleChangePassword}>Đổi mật khẩu</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
