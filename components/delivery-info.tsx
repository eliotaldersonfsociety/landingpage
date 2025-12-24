import Image from "next/image"

export function DeliveryInfo() {
  return (
    <section id="delivery-info" className="py-4">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance mb-8">
          FAST DELIVERY THROUGHOUT <span className="text-[#FF8A00] font-black">USA - ARKANSAS</span>
        </h2>
        <div className="relative w-full max-w-lg mx-auto h-64 rounded-lg overflow-hidden shadow-lg">
          {/* I'll use an example image, you can change it for a more suitable one */}
          <Image
            src="/8.webp" // Replace with a delivery image or USA map if you have
            alt="Fast Delivery in USA"
            fill
            className="object-contain"
          />
        </div>
        <p className="mt-4 text-lg text-muted-foreground">
          Receive your products at your doorstep.
        </p>
      </div>
    </section>
  )
}
