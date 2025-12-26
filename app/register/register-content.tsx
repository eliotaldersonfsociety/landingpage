"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { useActionState } from 'react'
import { registerAction } from "@/lib/actions/register"
import { useToast } from "@/hooks/use-toast"
import { Dumbbell } from "lucide-react"
import { NavigationMenu } from "@/components/ui/navigation-menu"

export default function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || "/dashboard"
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [department, setDepartment] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const { toast } = useToast()
  const [state, formAction, isPending] = useActionState(registerAction, { success: false, error: undefined })

  useEffect(() => {
    if (state.success) {
      router.push(redirect)
    }
  }, [state.success, router, redirect])

  useEffect(() => {
    if (state.error) {
      toast({
        title: 'Error',
        description: state.error
      })
    }
  }, [state.error, toast])

  useEffect(() => {
    const tokenCookie = document.cookie
      .split(";")
      .find(c => c.trim().startsWith("authToken="))
    if (tokenCookie) {
      router.push('/dashboard')
    }
  }, [router])

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 text-center">

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md space-y-8">

          <div className="flex justify-center">
            <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEH0lEQVR4nNWaW4hWVRTHfzoyjppTeYVEH4LSEPJBFFEileohCNTSeYtKTCzFa4QmaoaKD41PCQ5oCUov0YsPYgZ2MyXwSpEVQjrjZcpLJpapM0cWrA2bzd77nOM53/ed/rDgzHfW9ex91lp7nYE4hgLrgcvA+9QfG9X2OmDIgyqZA1wBEqXN1B9bLPt/ArPyKngb6LWUHAH6UX/0A45afvQAi7IKv6QCiUXP0Dg86/givr2YJjQIuOAI/kzj8YvjUycwMCawyBEQ+qSAAyOAiUrDC+jZ7fFrYUzgoEegPafRAcAy4KRH1wlgKdCSU2e7R9eBmIC7rYS+A/pkNDgTOO/R4dI5YEZGnX012SSe7RXEfwHDe4FHUwyu8iSJGAnvihSdI4E9AfnbeVfE0E3gc2ArsAR43pL7IEcALm2w9LygusXGPuBORK4rFsjejMalUI62ak5SkExtGANcyygjKxXEZKcQ+qhXa43hjz21rCQ6JqnO2Rn4ey3+ID5MUbJD+R4CfishCEO/qk7Bxym87VmzxM7IljLN264SgzC0y6o/1wM84lsTOfAacMlR8qbem1GDIAxNVxtLnN/Fl9fzBNDHKljSBryqGeSwrlZfLWy1CuS42jAN4z71wbQkLWl1TW5OA74EfgfmBpZwfg2DSJR8T158adNielB99Qb0rUfhOT1QPWk9jVitKYu6gP5q82lgk1Zyl+8bXyCHMzyhhXUIIlFaoDbfiPBI++Rt9rYD9xzmbl2JppLTbZZ03KS2u5174uNH6nMQT2mePg1cBdbq73PrGESi9LLaXqu+nNI6N44C+KIBgeynZIwJdLbS8P1TgsO3NKkkDvVYPV0pWBdwQFr7x4GvCgTxPTBWR0+Jh8zWLgzJ1WcDRsxelZdyJfBvjgBkJZdr8TPvZuKhszkOdlFMizjzjsM7zhnfxNKmqU0G70b4p5YRyBPAjUgT6TrUpO9OyKnV1ioYjNWslAQOdK6NB4YY+ilgqFubyYeV2nSEFArkR2Ae0Kr8IvtHgPcMMJ6SMSTjtimLfgCGUSO01rjzTaxVSxt2FMZjNW4cLwKjqOM8Ns/oJyv1AM9RZ2yrQSDbaAAeyTG6yUJ/FfmYUxTrSwxE2qCGQdLj3RKCuFdwWl8Kvi4hkENUAMtLCEQ+QzQcsaYyK02hAhjpaQrlE94aj8Ohew1/P9CxjXHorjXGGewJxMx2W5wk0UxFcEQd6tC/m/Vk5wbynuV0h3VCrAwG6HBZWhfBp5H3Qe6hvDvTRjqNwmfAhMghKdF7E5S3sripjd8s3Ton9PPAdb3u0H8NEZ6/qTCO6lN/JcLTVsV3w4X5ptGp4x1fS9OlPG9RYfS3TpCd1tm8Va/NRP1YlVJuCKNSjsPH9JT5v0AzsFjfA0kAQnIt26kmK3EfWBIDtSW3Zq4AAAAASUVORK5CYII="
                alt="Bull logo"
                className="h-10 w-10 invert"
              />
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold dark:text-white text-orange-500 hover:text-orange-600">
                CREATE <span className="text-orange-500">ACCOUNT</span>
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Sign up to get started
              </p>
            </div>

            <form action={formAction} className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="name" className="dark:text-white text-orange-500 hover:text-orange-600">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="dark:border-white/20 dark:bg-white/5 dark:text-white border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-white text-purple-600">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="dark:border-white/20 dark:bg-white/5 dark:text-white border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-white text-purple-600">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dark:border-white/20 dark:bg-white/5 dark:text-white border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="dark:text-white text-purple-600">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Your address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="dark:border-white/20 dark:bg-white/5 dark:text-white border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="dark:text-white text-purple-600">
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Your city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="dark:border-white/20 dark:bg-white/5 dark:text-white border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="dark:text-white text-purple-600">
                  Department
                </Label>
                <Input
                  id="department"
                  name="department"
                  type="text"
                  placeholder="Your department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="dark:border-white/20 dark:bg-white/5 dark:text-white border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappNumber" className="dark:text-white text-purple-600">
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsappNumber"
                  name="whatsappNumber"
                  type="text"
                  placeholder="Your WhatsApp number"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="dark:border-white/20 dark:bg-white/5 dark:text-white border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 text-white hover:bg-orange-600"
                disabled={isPending}
              >
                {isPending ? 'Registering...' : 'Sign up'}
              </Button>

              {state.error && <p className="text-red-500 text-center">{state.error}</p>}

              <p className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link
                  href={`/login?redirect=${encodeURIComponent(redirect)}`}
                  className="font-medium text-orange-500 hover:text-orange-600"
                >
                  Sign in
                </Link>
              </p>

            </form>
          </div>
        </div>
      </div>


      <NavigationMenu />
    </div>
  )
}