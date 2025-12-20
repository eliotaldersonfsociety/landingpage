import { Star } from "lucide-react"

export function Testimonials() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-lg text-muted-foreground">Trusted by thousands of satisfied customers</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card p-6 rounded-lg border space-y-4 text-center">
              <div className="flex gap-1 justify-center">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground">
                "Amazing quality and fast shipping! The products exceeded my expectations. Highly recommended!"
              </p>
              <div className="flex items-center gap-3 justify-center">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div>
                  <div className="font-semibold">Customer {i}</div>
                  <div className="text-sm text-muted-foreground">Verified Buyer</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}