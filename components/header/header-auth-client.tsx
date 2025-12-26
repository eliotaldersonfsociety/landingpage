"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { logoutAction } from "@/lib/actions/logout"

export function HeaderAuthClient({
  isLoggedIn,
}: {
  isLoggedIn: boolean
}) {
  const router = useRouter()

  const handleLogout = async () => {
    await logoutAction()
    router.refresh() // 🔥 CLAVE
  }

  return (
    <div className="flex items-center gap-0.1">

      {/* 👤 USER */}
      {isLoggedIn ? (
        <Link href="/dashboard">
          <div className="h-5 w-5 rounded-full bg-green-500 text-white font-light flex items-center justify-center">
            U
          </div>
        </Link>
      ) : (
        <Link href="/login">
        <Button size="icon" variant="ghost" aria-label="Go to dashboard">
          <User className="h-5 w-5" />
        </Button>
        </Link>
      )}

      {/* 🚪 LOGOUT */}
      {isLoggedIn && (
        <Button size="icon" variant="ghost" aria-label="Log out" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      )}

      {/* ☰ HAMBURGUESA */}
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-4 mt-6">
            <Link href="/">Home</Link>
            <Link href="#products">Products</Link>

            {!isLoggedIn ? (
              <Link href="/login">Login</Link>
            ) : (
              <button
                onClick={handleLogout}
                className="text-left text-red-500"
              >
                Logout
              </button>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
