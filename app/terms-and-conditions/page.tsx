import { TermsAndConditions } from "@/components/terms-and-conditions"
import { Header } from "@/components/header/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 text-center">
      <Header />
      <TermsAndConditions />
      <Footer />
    </div>
  )
}