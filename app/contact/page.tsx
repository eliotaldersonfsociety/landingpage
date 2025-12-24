import { Contact } from "@/components/contact"
import { Header } from "@/components/header/header"
import { Footer } from "@/components/footer"

export default function ContactPage() {
  return (
    <div className="min-h-screen mx-auto">
      <Header />
      <Contact />
      <Footer />
    </div>
  )
}