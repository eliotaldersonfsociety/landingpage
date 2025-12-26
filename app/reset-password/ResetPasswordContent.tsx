"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { resetPassword, validateResetToken } from "@/lib/actions/reset-password"
import Image from "next/image"

export default function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (token) {
      validateToken()
    } else {
      setTokenValid(false)
      setError("No reset token provided")
    }
  }, [token])

  const validateToken = async () => {
    const result = await validateResetToken(token!)
    setTokenValid(result.valid)
    if (result.valid) {
      setEmail(result.email || "")
    } else if (result.expired) {
      setError("Reset token has expired. Please request a new one.")
    } else {
      setError("Invalid reset token")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('token', token!)
    formData.append('password', password)

    const result = await resetPassword(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setMessage(result.message || "Password reset successfully!")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    }

    setLoading(false)
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-black">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 pt-16">
          <div className="text-white">Validating token...</div>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-black">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 pt-16">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="text-red-400">{error}</div>
            <Link
              href="/forgot-password"
              className="text-purple-400 hover:text-purple-300"
            >
              Request a new password reset
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 text-center">

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl overflow-hidden">
              <Image
                src="/icon.png"
                alt="Logo"
                width={64}
                height={64}
                className="object-cover dark:invert"
              />
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white">Reset password</h1>
              <p className="mt-2 text-sm text-gray-400">
                Enter your new password for {email}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-white/20 bg-white/5 text-white placeholder:text-gray-500"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500">Must be at least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-white/20 bg-white/5 text-white placeholder:text-gray-500"
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              {message && (
                <div className="text-green-400 text-sm text-center">
                  {message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-orange-500 text-white hover:bg-orange-600"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset password"}
              </Button>

              <p className="text-center text-sm text-gray-400">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-medium text-orange-500 hover:text-orange-600"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

    </div>
  )
}