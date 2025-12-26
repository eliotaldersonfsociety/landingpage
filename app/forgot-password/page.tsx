"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { requestPasswordReset } from "@/lib/actions/forgot-password"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    const formData = new FormData()
    formData.append('email', email)

    const result = await requestPasswordReset(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setMessage(result.message || "Password reset link sent to your email!")
    }

    setLoading(false)
  }

  return (
    
    <div>
  

      <div className="flex min-h-[calc(100vh-1rem)] items-center justify-center px-4">
        <div className="w-full max-w-md space-y-1">
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
              <h1 className="text-3xl font-bold text-white">FORGOT <span className="text-orange-500">PASSWORD</span></h1>
              <p className="mt-2 text-sm text-gray-400">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                <div className="text-green-400 text-sm text-center whitespace-pre-line">
                  {message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-orange-500 text-white hover:bg-orange-700"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send reset link"}
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