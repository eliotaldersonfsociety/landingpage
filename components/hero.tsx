import { Star, Truck, Package, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomerReviews } from "@/components/customer-reviews"
import Image from "next/image"


export function Hero() {
  return (
    <section className="relative overflow-hidden py-4 md:py-32">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center order-2 lg:order-1">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
                <b>BUILD YOUR COLLECTION <span className="text-orange-500">WITH LABUBU MONSTERS</span></b>
            </h1>

            <p className="text-xs text-muted-foreground text-pretty">
              Discover the adorable world of Labubu monsters – cute, collectible figures from Pop Mart designed to bring joy and fun to your life every day.
            </p>
            <div className="flex items-center gap-8 pt-4 justify-center">
              <div className="flex flex-col items-center gap-1">
                <Truck className="h-8 w-8 text-orange-500" />
                <div className="text-sm text-muted-foreground">Fast Delivery</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Package className="h-8 w-8 text-orange-500" />
                <div className="text-sm text-muted-foreground">Premium Products</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="h-8 w-8 text-orange-500" />
                <div className="text-sm text-muted-foreground">100% Secure</div>
              </div>
            </div>
            <Button size="lg" asChild className="p-0 rounded-full shadow-lg overflow-hidden">
              <a
                href="#products"
                className="
                  flex flex-col items-center justify-center w-full h-full leading-tight py-4 px-8
                  text-white font-semibold
                  bg-gradient-to-r from-[#FFB800] to-[#FF8A00]
                  hover:from-[#FFD300] hover:to-[#FF9E00]
                  rounded-full
                "
              >
                <span className="text-lg font-bold tracking-wide">BUY NOW</span>

                <span className="w-full h-px bg-white/50 my-0"></span>

                <span className="text-[11px] opacity-90 tracking-wide flex items-center gap-1">
                  Secure Checkout
                  <Truck className="h-8 w-8 text-white" />
                </span>
              </a>
            </Button>
            <CustomerReviews />
          </div>
          <div className="relative h-[400px] lg:h-[500px] order-1 lg:order-2">
            <div className="absolute rounded-3xl bg-gradient-to-r from-blue-500 to-blue-900 opacity-40" />
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <Image
                src="/1.webp"
                alt="Labubu hero banner"
                fill
                priority
                fetchPriority="high"
                className="object-cover mask-hero"
              />

            </div>

            {/* Pricing overlay */}
            <div className="absolute top-4 right-4 md:top-8 md:right-8 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-lg">
              <div className="text-orange-500 line-through text-base md:text-lg">Was <br />$80</div>
              <div className="text-white font-bold text-xl md:text-2xl">Now <br />$40</div>
            </div>

            {/* Discount badge */}
            <div className="absolute bottom-4 left-4 md:bottom-8 md:right-8 bg-orange-500 text-white rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center shadow-lg">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold">50%</div>
                <div className="text-xs md:text-sm">OFF</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}