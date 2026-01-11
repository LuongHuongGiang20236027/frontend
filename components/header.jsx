"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BookOpen, FileText, Home, User, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoginDialog } from "@/components/login-dialog"
import { RegisterDialog } from "@/components/register-dialog"
import { API_BASE_URL } from "@/config"

export function Header() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const handleUserLogin = (e) => setUser(e.detail)
    const handleUserLogout = () => setUser(null)

    window.addEventListener("user-login", handleUserLogin)
    window.addEventListener("user-logout", handleUserLogout)

    const tokenUser = localStorage.getItem("user")
    if (tokenUser) setUser(JSON.parse(tokenUser))

    return () => {
      window.removeEventListener("user-login", handleUserLogin)
      window.removeEventListener("user-logout", handleUserLogout)
    }
  }, [])

  const logout = () => {
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST", credentials: "include" })
      .catch(console.error)

    window.dispatchEvent(new Event("user-logout"))
  }

  const getUserInitial = () => user?.name?.charAt(0).toUpperCase() || "U"

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Smart Edu</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="h-4 w-4" />
                Trang chủ
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none">
                  <BookOpen className="h-4 w-4" />
                  Bài tập
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem asChild>
                    <Link href="/assignments">Tất cả bài tập</Link>
                  </DropdownMenuItem>
                  {user?.role === "teacher" && (
                    <DropdownMenuItem asChild>
                      <Link href="/assignments/my-assignments">Bài tập của tôi</Link>
                    </DropdownMenuItem>
                  )}
                  {user?.role === "student" && (
                    <DropdownMenuItem asChild>
                      <Link href="/assignments/completed">Bài tập đã làm</Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none">
                  <FileText className="h-4 w-4" />
                  Tài liệu
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start">
                  <DropdownMenuItem asChild>
                    <Link href="/documents">Tất cả tài liệu</Link>
                  </DropdownMenuItem>

                  {user?.role === "teacher" && (
                    <DropdownMenuItem asChild>
                      <Link href="/documents/my-documents">Tài liệu của tôi</Link>
                    </DropdownMenuItem>
                  )}

                  {/* ✅ CHỈ hiện khi đã đăng nhập */}
                  {user && (
                    <DropdownMenuItem asChild>
                      <Link href="/documents/liked">Tài liệu đã thích</Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {getUserInitial()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {getUserInitial()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user?.name || "Người dùng"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                      <p className="text-xs text-primary mt-0.5">
                        {user?.role === "teacher" ? "Giáo viên" : "Học sinh"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/profile")}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    Hồ sơ
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="flex items-center gap-2 cursor-pointer text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setLoginOpen(true)}>Đăng nhập</Button>
                <Button onClick={() => setRegisterOpen(true)}>Đăng ký</Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <RegisterDialog open={registerOpen} onOpenChange={setRegisterOpen} />
    </>
  )
}
