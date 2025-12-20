import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/store"

interface ProductsProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

export function Products({ products, onAddToCart }: ProductsProps) {
  return (
    <section id="products" className="py-1">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
            FEATURED <span className="text-[#FF8A00] font-black">PRODUCTS</span>
          </h2>

          <p className="text-muted-foreground text-pretty">
            Discover our exclusive Labubu monster collectibles from Pop Mart, perfect for building your adorable collection.
          </p>

        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  )
}