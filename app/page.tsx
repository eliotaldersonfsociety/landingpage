import dynamic from 'next/dynamic'
import { SocialNotificationsWrapper } from "@/components/social-notifications-wrapper"
import { Hero } from "@/components/hero"
import AlternatingContents from "@/components/alternativecontent/page"
import { OrderProcess } from "@/components/order-process"
import { ProductsWrapper } from "@/components/products-wrapper"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"
import { FAQs } from "@/components/faqs/faqs"
import { DeliveryInfo } from "@/components/delivery-info"
import { defaultProducts, type Product } from "@/lib/store"

const ResultsCarouselClient = dynamic(() => import('@/components/result-carrousel/results-carousel.client'))
const AITestimonials = dynamic(() => import('@/components/ai-testimonials'))

export default function HomePage() {

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-0 text-center">
      <SocialNotificationsWrapper />
      <Hero />
      <OrderProcess />
      <div className="flex items-center justify-center gap-4 font-sans text-center pt-4">
        <span className="text-red-600 font-bold text-xs line-through">
          was 80$
        </span>

        <span className="bg-orange-500 text-white font-extrabold text-sm px-4 py-1 rounded-lg shadow-md">
          now 40$
        </span>

        <span className="hidden md:inline text-green-600 font-semibold text-2xl">
          50% discount – Don't miss the opportunity!
        </span>
      </div>
      <AlternatingContents />
      <ProductsWrapper products={defaultProducts.slice(0, 1)} />
      <ResultsCarouselClient />
      <AITestimonials />
      <div className="md:grid md:grid-cols-2 md:gap-8">
        <DeliveryInfo />
        <FAQs />
      </div>
      <OrderProcess />
      <Footer />
    </div>
  )
}
