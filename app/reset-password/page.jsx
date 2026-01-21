"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function ResetPasswordPage() {
    const params = useSearchParams()
    const router = useRouter()

    const token = params.get("token")

    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setError("Link không hợp lệ hoặc thiếu token")
        }
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (password.length < 6) {
            setError("Mật khẩu phải ít nhất 6 ký tự")
            return
        }

        if (password !== confirm) {
            setError("Mật khẩu xác nhận không khớp")
            return
        }

        setLoading(true)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Reset mật khẩu thất bại")
            }

            setSuccess(true)

            // 3s sau quay về login
            setTimeout(() => {
                router.push("/")
                if (typeof window !== "undefined" && window.openLoginDialog) {
                    window.openLoginDialog()
                }
            }, 3000)
        } catch (err) {
            console.error(err)
            setError(err.message)
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Đặt lại mật khẩu</CardTitle>
                    <CardDescription>
                        Nhập mật khẩu mới cho tài khoản của bạn
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {success ? (
                        <div className="text-center space-y-3">
                            <p className="text-green-600 font-medium">
                                ✔ Mật khẩu đã được cập nhật thành công
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Đang chuyển về trang đăng nhập...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Mật khẩu mới</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Xác nhận mật khẩu</Label>
                                <Input
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 bg-red-100 px-2 py-1 rounded">
                                    {error}
                                </p>
                            )}

                            <Button className="w-full" disabled={loading}>
                                {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
