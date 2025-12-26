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

import { Header } from "@/components/header/header" // 👈 AÑADIR

import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TiendaTexas | Viral Products & Trending Finds in Hot Springs, Arkansas, Texas",
  description:
    "The internet’s favorite viral products, delivered fast with secure checkout at TiendaTexas.",
  generator: "Bucaramarketing",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.png", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
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
            <div className="max-w-7xl mx-auto px-4 md:px-0 text-center"><Header /></div>
            

            {/* PÁGINAS */}
            {children}

            {/* UI global */}
            <Toaster />
            <UrgencyNotification />
          </CartProvider>
        </ThemeProvider>

        {/* 🔥 IA + tracking */}
        <LoadBehaviorAI />

        {/* Analytics */}
        <Analytics />
      </body>
    </html>
  )
}
