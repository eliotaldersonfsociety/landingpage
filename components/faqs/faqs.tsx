import Image from "next/image"
import { FAQAccordionClient } from "./faq-accordion-client"

const faqs = [
  {
    question: "📦 How does delivery work?",
    answer:
      "We offer personal delivery in Arkansas. Once your order is confirmed, we coordinate directly with you to deliver your Labubu or thermos safely to your doorstep.",
  },
  {
    question: "🚚 How long does delivery take?",
    answer:
      "Delivery usually takes 24 to 48 hours, depending on your location in Arkansas.",
  },
  {
    question: "📍 Do you deliver outside Arkansas?",
    answer:
      "At the moment, personal delivery is only available in Arkansas.",
  },
  {
    question: "🧃 What type of thermos are included?",
    answer:
      "The combo includes 2 high-quality thermos, ideal for daily use.",
  },
  {
    question: "📲 How do I confirm my order?",
    answer:
      "Place your order securely. We contact you to schedule delivery.",
  },
]

export function FAQs() {
  return (
    <section id="faqs" className="py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center mb-8">
          {/* ICON */}
          <Image
            src="/interrogacion.webp"
            alt="Frequently Asked Questions"
            width={60}
            height={80}
            sizes="60px"
            className="mr-4"
          />

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-left">
            FREQUENTLY <br />
            <span className="text-[#FF8A00] font-black">
              ASKED QUESTIONS
            </span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <FAQAccordionClient faqs={faqs} />
        </div>
      </div>
    </section>
  )
}
