// app/layout.tsx
import type { ReactNode } from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/context/cart-context"
import { Toaster } from "@/components/ui/toaster"
import { UrgencyNotification } from "@/components/UrgencyNotification"
import { LoadBehaviorAI } from "@/components/LoadBehaviorAI"

import { Header } from "@/components/header/header"
import { Footer } from "@/components/footer" // 👈 AÑADIR

import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TiendaTexas | Viral Products & Trending Finds in Hot Springs, Arkansas, Texas",
  description:
    "The internet’s favorite viral products, delivered fast with secure checkout at TiendaTexas.",
  generator: "Bucaramarketing",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>

            {/* 🔥 HEADER GLOBAL */}
            <header className="max-w-7xl mx-auto px-4 md:px-0">
              <Header />
            </header>

            {/* 📄 CONTENIDO DE CADA PÁGINA */}
            <main className="min-h-[calc(100vh-160px)]">
              {children}
            </main>

            {/* 🔻 FOOTER */}
            <Footer />

            {/* UI GLOBAL */}
            <Toaster />
            <UrgencyNotification />

          </CartProvider>
        </ThemeProvider>

        {/* 🤖 IA + TRACKING */}
        <LoadBehaviorAI />

        {/* 📊 ANALYTICS */}
        <Analytics />
      </body>
    </html>
  )
}
