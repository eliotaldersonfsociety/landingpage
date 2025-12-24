import { Suspense } from "react"
import ResetPasswordContent from "./ResetPasswordContent"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}