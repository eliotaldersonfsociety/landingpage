import { PrivacyPolicy } from "@/components/privacy-policy"
import { Header } from "@/components/header/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 text-center">
      <Header />
      <PrivacyPolicy />
      <Footer />
    </div>
  )
}