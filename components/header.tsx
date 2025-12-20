"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Dumbbell,
  Menu,
  LogOut,
  LayoutDashboard,
  User,
} from "lucide-react"
import { jwtDecode } from "jwt-decode"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { CartSidebar } from "@/components/cart-sidebar"
import { useCart } from "@/context/cart-context"
import { logoutAction } from "@/lib/actions/logout"

type JwtPayload = {
  email?: string
  name?: string
  username?: string
}

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userInitial, setUserInitial] = useState<string | null>(null)

  const router = useRouter()
  const cart = useCart()

  // 🔐 Check auth cookie + extract real initial
  useEffect(() => {
    const tokenCookie = document.cookie
      .split(";")
      .find(c => c.trim().startsWith("authToken="))

    if (!tokenCookie) {
      setIsLoggedIn(false)
      setUserInitial(null)
      return
    }

    try {
      const token = tokenCookie.split("=")[1]
      const decoded = jwtDecode<JwtPayload>(token)

      const nameOrEmail =
        decoded.name || decoded.email || decoded.username

      if (nameOrEmail) {
        setUserInitial(nameOrEmail.charAt(0).toUpperCase())
        setIsLoggedIn(true)
      }
    } catch {
      setIsLoggedIn(false)
      setUserInitial(null)
    }
  }, [])

  const handleLogout = async () => {
    await logoutAction()
    setIsLoggedIn(false)
    setUserInitial(null)
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEH0lEQVR4nNWaW4hWVRTHfzoyjppTeYVEH4LSEPJBFFEileohCNTSeYtKTCzFa4QmaoaKD41PCQ5oCUov0YsPYgZ2MyXwSpEVQjrjZcpLJpapM0cWrA2bzd77nOM53/ed/rDgzHfW9ex91lp7nYE4hgLrgcvA+9QfG9X2OmDIgyqZA1wBEqXN1B9bLPt/ArPyKngb6LWUHAH6UX/0A45afvQAi7IKv6QCiUXP0Dg86/givr2YJjQIuOAI/kzj8YvjUycwMCawyBEQ+qSAAyOAiUrDC+jZ7fFrYUzgoEegPafRAcAy4KRH1wlgKdCSU2e7R9eBmIC7rYS+A/pkNDgTOO/R4dI5YEZGnX012SSe7RXEfwHDe4FHUwyu8iSJGAnvihSdI4E9AfnbeVfE0E3gc2ArsAR43pL7IEcALm2w9LygusXGPuBORK4rFsjejMalUI62ak5SkExtGANcyygjKxXEZKcQ+qhXa43hjz21rCQ6JqnO2Rn4ey3+ID5MUbJD+R4CfishCEO/qk7Bxym87VmzxM7IljLN264SgzC0y6o/1wM84lsTOfAacMlR8qbem1GDIAxNVxtLnN/Fl9fzBNDHKljSBryqGeSwrlZfLWy1CuS42jAN4z71wbQkLWl1TW5OA74EfgfmBpZwfg2DSJR8T158adNielB99Qb0rUfhOT1QPWk9jVitKYu6gP5q82lgk1Zyl+8bXyCHMzyhhXUIIlFaoDbfiPBI++Rt9rYD9xzmbl2JppLTbZZ03KS2u5174uNH6nMQT2mePg1cBdbq73PrGESi9LLaXqu+nNI6N44C+KIBgeynZIwJdLbS8P1TgsO3NKkkDvVYPV0pWBdwQFr7x4GvCgTxPTBWR0+Jh8zWLgzJ1WcDRsxelZdyJfBvjgBkJZdr8TPvZuKhszkOdlFMizjzjsM7zhnfxNKmqU0G70b4p5YRyBPAjUgT6TrUpO9OyKnV1ioYjNWslAQOdK6NB4YY+ilgqFubyYeV2nSEFArkR2Ae0Kr8IvtHgPcMMJ6SMSTjtimLfgCGUSO01rjzTaxVSxt2FMZjNW4cLwKjqOM8Ns/oJyv1AM9RZ2yrQSDbaAAeyTG6yUJ/FfmYUxTrSwxE2qCGQdLj3RKCuFdwWl8Kvi4hkENUAMtLCEQ+QzQcsaYyK02hAhjpaQrlE94aj8Ohew1/P9CxjXHorjXGGewJxMx2W5wk0UxFcEQd6tC/m/Vk5wbynuV0h3VCrAwG6HBZWhfBp5H3Qe6hvDvTRjqNwmfAhMghKdF7E5S3sripjd8s3Ton9PPAdb3u0H8NEZ6/qTCO6lN/JcLTVsV3w4X5ptGp4x1fS9OlPG9RYfS3TpCd1tm8Va/NRP1YlVJuCKNSjsPH9JT5v0AzsFjfA0kAQnIt26kmK3EfWBIDtSW3Zq4AAAAASUVORK5CYII="
                alt="Bull logo"
                className="h-6 w-6 invert"
              />
          <span className="font-bold text-xl">TiendaTexas</span>
        </Link>

        {/* NAV LINKS PC */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:underline">
            Home
          </Link>
          <Link href="#products" className="text-sm font-medium hover:underline">
            Products
          </Link>
          <Link href="#features" className="text-sm font-medium hover:underline">
            Features
          </Link>
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2">

          {/* AUTH BUTTONS PC */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <Button variant="ghost" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/login">Iniciar sesión</Link>
              </Button>
            )}

            {isLoggedIn && (
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>

          {/* MOBILE ICONS */}
          <div className="flex items-center gap-1 md:hidden">

            {/* Avatar / User */}
            {isLoggedIn ? (
              <div
                onClick={() => router.push("/dashboard")}
                className="h-9 w-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold cursor-pointer"
              >
                {userInitial}
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/login")}
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Logout MOBILE */}
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* HAMBURGER MENU */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menú</SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-4 mt-6">
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
                <Link href="#products" onClick={() => setIsMenuOpen(false)}>
                  Products
                </Link>
                <Link href="#features" onClick={() => setIsMenuOpen(false)}>
                  Features
                </Link>

                <hr />

                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* THEME + CART */}
          <ThemeToggle />

          <CartSidebar
            cart={cart.cart}
            itemCount={cart.itemCount}
            total={cart.total}
            onUpdateQuantity={cart.updateQuantity}
            onRemove={cart.removeFromCart}
            onClear={cart.clearCart}
            isOpen={cart.isOpen}
            onOpenChange={cart.setIsOpen}
          />
        </div>
      </div>
    </header>
  )
}
