// Store management for cart, products, and analytics
export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
}

export interface CartItem extends Product {
  quantity: number
}

export interface AnalyticsEvent {
  type: "page_view" | "product_view" | "add_to_cart" | "checkout" | "click"
  timestamp: number
  country?: string
  data?: any
}

export interface Stat {
  value: string
  label: string
}

export interface HeroContent {
  title: string
  description: string
  stats: Stat[]
}

export interface Feature {
  icon: string
  title: string
  description: string
}

export interface Testimonial {
  stars: number
  text: string
  name: string
  role: string
}

export interface FooterLink {
  title: string
  links: string[]
}

export interface SiteContent {
  hero: HeroContent
  features: Feature[]
  testimonials: Testimonial[]
  footer: FooterLink[]
}

// Products data
export const defaultProducts: Product[] = [
  {
    id: "1",
    name: "Labubu Monster Bundle",
    description: "Get 1 adorable Labubu monster collectible + 2 stylish water bottles for only $40! Perfect for collectors and hydration lovers.",
    price: 40,
    image: "/1.webp",
    category: "Collectibles",
  },
]

// Default site content
export const defaultSiteContent: SiteContent = {
  hero: {
    title: "Premium Tech Products for Modern Life",
    description: "Discover our curated collection of high-quality electronics and accessories. Everything you need to work smarter and live better.",
    stats: [
      { value: "500+", label: "Products" },
      { value: "50K+", label: "Customers" },
      { value: "4.9", label: "Rating" },
    ],
  },
  features: [
    {
      icon: "Zap",
      title: "Fast Shipping",
      description: "Free express delivery on all orders over $100",
    },
    {
      icon: "Shield",
      title: "Secure Payment",
      description: "100% secure transactions with encryption",
    },
    {
      icon: "Package",
      title: "Easy Returns",
      description: "30-day hassle-free return policy",
    },
  ],
  testimonials: [
    {
      stars: 5,
      text: "Amazing quality and fast shipping! The products exceeded my expectations. Highly recommended!",
      name: "Customer 1",
      role: "Verified Buyer",
    },
    {
      stars: 5,
      text: "Amazing quality and fast shipping! The products exceeded my expectations. Highly recommended!",
      name: "Customer 2",
      role: "Verified Buyer",
    },
    {
      stars: 5,
      text: "Amazing quality and fast shipping! The products exceeded my expectations. Highly recommended!",
      name: "Customer 3",
      role: "Verified Buyer",
    },
  ],
  footer: [
    {
      title: "Shop",
      links: ["Electronics", "Accessories", "New Arrivals", "Best Sellers"],
    },
    {
      title: "Support",
      links: ["Contact Us", "Shipping Info", "Returns", "FAQ"],
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "Privacy Policy", "Terms of Service"],
    },
  ],
}

// Cart operations
export const cartStorage = {
  get: (): CartItem[] => {
    if (typeof window === "undefined") return []
    const cart = localStorage.getItem("cart")
    return cart ? JSON.parse(cart) : []
  },
  set: (cart: CartItem[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem("cart", JSON.stringify(cart))
  },
  add: (product: Product) => {
    const cart = cartStorage.get()
    const existingItemIndex = cart.findIndex((item) => item.id === product.id)

    let newCart: CartItem[]

    if (existingItemIndex !== -1) {
      newCart = [...cart]
      newCart[existingItemIndex].quantity += 1
    } else {
      newCart = [...cart, { ...product, quantity: 1 }]
    }

    cartStorage.set(newCart)
    return newCart
  },
  remove: (productId: string) => {
    const newCart = cartStorage.get().filter((item) => item.id !== productId)
    cartStorage.set(newCart)
    return newCart
  },
  updateQuantity: (productId: string, quantity: number) => {
    const cart = cartStorage.get()
    const itemIndex = cart.findIndex((item) => item.id === productId)

    let newCart: CartItem[]

    if (itemIndex !== -1) {
      newCart = [...cart]
      newCart[itemIndex].quantity = quantity
      if (newCart[itemIndex].quantity <= 0) {
        return cartStorage.remove(productId)
      }
    } else {
      newCart = cart
    }

    cartStorage.set(newCart)
    return newCart
  },
  clear: () => {
    cartStorage.set([])
    return []
  },
}

// Mock countries for demo
const mockCountries = ["United States", "Colombia", "Mexico", "Spain", "Argentina", "Brazil", "Canada", "France", "Germany", "Italy"]

// Analytics operations
export const analyticsStorage = {
  track: (event: Omit<AnalyticsEvent, "timestamp" | "country">) => {
    if (typeof window === "undefined") return

    const events = analyticsStorage.getAll()
    const newEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
      country: mockCountries[Math.floor(Math.random() * mockCountries.length)],
    }

    events.push(newEvent)
    localStorage.setItem("analytics", JSON.stringify(events))
  },
  getAll: (): AnalyticsEvent[] => {
    if (typeof window === "undefined") return []
    const events = localStorage.getItem("analytics")
    return events ? JSON.parse(events) : []
  },
  clear: () => {
    if (typeof window === "undefined") return
    localStorage.setItem("analytics", JSON.stringify([]))
  },
}

// Products operations
export const productsStorage = {
  get: (): Product[] => {
    return defaultProducts
  },
  set: (products: Product[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem("products", JSON.stringify(products))
  },
  add: (product: Product) => {
    const products = productsStorage.get()
    products.push(product)
    productsStorage.set(products)
    return products
  },
  update: (product: Product) => {
    const products = productsStorage.get()
    const index = products.findIndex((p) => p.id === product.id)
    if (index !== -1) {
      products[index] = product
      productsStorage.set(products)
    }
    return products
  },
  delete: (productId: string) => {
    const products = productsStorage.get().filter((p) => p.id !== productId)
    productsStorage.set(products)
    return products
  },
}

// Content operations
export const contentStorage = {
  get: (): SiteContent => {
    if (typeof window === "undefined") return defaultSiteContent
    const content = localStorage.getItem("siteContent")
    return content ? JSON.parse(content) : defaultSiteContent
  },
  set: (content: SiteContent) => {
    if (typeof window === "undefined") return
    localStorage.setItem("siteContent", JSON.stringify(content))
  },
  update: (content: Partial<SiteContent>) => {
    const current = contentStorage.get()
    const updated = { ...current, ...content }
    contentStorage.set(updated)
    return updated
  },
}
