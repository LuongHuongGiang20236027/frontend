"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  BookOpen,
  FileText,
  Home,
  User,
  LogOut,
  ChevronDown,
  Menu,
} from "lucide-react"
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
import { getAvatarFallback, getAvatarColor } from "@/utils/avatar"
import { useRouter } from "next/navigation"

export function Header() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const syncUser = () => {
      const tokenUser = localStorage.getItem("user")
      if (tokenUser) setUser(JSON.parse(tokenUser))
      else setUser(null)
    }

    const handleUserLogin = () => syncUser()
    const handleUserLogout = () => syncUser()

    window.addEventListener("user-login", handleUserLogin)
    window.addEventListener("user-logout", handleUserLogout)

    syncUser()

    return () => {
      window.removeEventListener("user-login", handleUserLogin)
      window.removeEventListener("user-logout", handleUserLogout)
    }
  }, [])

  const logout = () => {
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.dispatchEvent(new Event("user-logout"))
    router.push("/")
    setMobileOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">

          {/* LEFT: Mobile menu button + Logo */}
          <div className="flex items-center gap-2">
            {/* MOBILE MENU BUTTON (LEFT) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* LOGO */}
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Smart Edu
              </span>
            </Link>

            {/* DESKTOP MENU */}
            <nav className="hidden md:flex items-center gap-6 ml-6">
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
                      <Link href="/assignments/my-assignments">
                        Bài tập của tôi
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user && (
                    <DropdownMenuItem asChild>
                      <Link href="/assignments/completed">
                        Bài tập đã làm
                      </Link>
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
                      <Link href="/documents/my-documents">
                        Tài liệu của tôi
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user && (
                    <DropdownMenuItem asChild>
                      <Link href="/documents/liked">
                        Tài liệu đã thích
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          {/* RIGHT: Avatar / Auth (ALWAYS TOP-RIGHT) */}
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar || ""} />
                      <AvatarFallback
                        className={`${getAvatarColor(
                          user?.name
                        )} text-white font-semibold`}
                      >
                        {getAvatarFallback(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user?.avatar || ""}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback
                        className={`${getAvatarColor(
                          user?.name
                        )} font-semibold`}
                      >
                        {getAvatarFallback(user?.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                      <p className="text-sm font-medium">
                        {user?.name || "Người dùng"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email || ""}
                      </p>
                      <p className="text-xs text-primary mt-0.5">
                        {user?.role === "teacher"
                          ? "Giáo viên"
                          : "Học sinh"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    Hồ sơ
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 cursor-pointer text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setLoginOpen(true)}
                >
                  Đăng nhập
                </Button>
                <Button onClick={() => setRegisterOpen(true)}>
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE MENU PANEL */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-card px-4 py-4 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 py-2"
            >
              <Home className="h-4 w-4" />
              Trang chủ
            </Link>

            <div className="pt-2">
              <p className="text-xs uppercase text-muted-foreground mb-1">
                Bài tập
              </p>
              <Link
                href="/assignments"
                onClick={() => setMobileOpen(false)}
                className="block py-2 pl-4"
              >
                Tất cả bài tập
              </Link>
              {user?.role === "teacher" && (
                <Link
                  href="/assignments/my-assignments"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 pl-4"
                >
                  Bài tập của tôi
                </Link>
              )}
              {user && (
                <Link
                  href="/assignments/completed"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 pl-4"
                >
                  Bài tập đã làm
                </Link>
              )}
            </div>

            <div className="pt-2">
              <p className="text-xs uppercase text-muted-foreground mb-1">
                Tài liệu
              </p>
              <Link
                href="/documents"
                onClick={() => setMobileOpen(false)}
                className="block py-2 pl-4"
              >
                Tất cả tài liệu
              </Link>
              {user?.role === "teacher" && (
                <Link
                  href="/documents/my-documents"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 pl-4"
                >
                  Tài liệu của tôi
                </Link>
              )}
              {user && (
                <Link
                  href="/documents/liked"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 pl-4"
                >
                  Tài liệu đã thích
                </Link>
              )}
            </div>

            <div className="pt-3 border-t">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 py-2"
                  >
                    <User className="h-4 w-4" />
                    Hồ sơ
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 py-2 text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setLoginOpen(true)
                      setMobileOpen(false)
                    }}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setRegisterOpen(true)
                      setMobileOpen(false)
                    }}
                  >
                    Đăng ký
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <RegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
      />
    </>
  )
}
