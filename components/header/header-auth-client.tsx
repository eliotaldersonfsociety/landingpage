// components/header/header-auth-client.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, LogOut, LayoutDashboard, Menu } from "lucide-react"
import { jwtDecode } from "jwt-decode"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { logoutAction } from "@/lib/actions/logout"

type JwtPayload = {
  email?: string
  name?: string
  username?: string
}

export function HeaderAuthClient() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInitial, setUserInitial] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const tokenCookie = document.cookie
      .split(";")
      .find(c => c.trim().startsWith("authToken="))

    if (!tokenCookie) return

    try {
      const token = tokenCookie.split("=")[1]
      const decoded = jwtDecode<JwtPayload>(token)
      const name = decoded.name || decoded.email || decoded.username
      if (name) {
        setUserInitial(name.charAt(0).toUpperCase())
        setIsLoggedIn(true)
      }
    } catch {}
  }, [])

  const handleLogout = async () => {
    await logoutAction()
    router.push("/")
  }

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:flex gap-2">
        {isLoggedIn ? (
          <>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </>
        ) : (
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>

      {/* MOBILE */}
      {isLoggedIn ? (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="bg-green-500 text-white rounded-full font-bold" asChild>
            <Link href="/dashboard" title="Dashboard" className="flex items-center justify-center">
              {userInitial}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div suppressHydrationWarning>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                <Link href="/" className="flex items-center gap-2">
                  Home
                </Link>
                <Link href="#products" className="flex items-center gap-2">
                  Products
                </Link>
                <Link href="/login" className="flex items-center gap-2">
                  Login
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </>
  )
}
