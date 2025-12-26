import { PrivacyPolicy } from "@/components/privacy-policy"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 text-center">
      <PrivacyPolicy />
      <Footer />
    </div>
  )
}