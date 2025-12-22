import type { ReactNode } from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/context/cart-context"
import { Toaster } from "@/components/ui/toaster"
import { BehaviorTracker } from "@/components/behavior-tracker"
import { UrgencyNotification } from "@/components/UrgencyNotification"

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
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.png",
        type: "image/svg+xml",
      },
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
      <body
        className={`${geist.className} ${geistMono.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            {children}

            {/* UI global */}
            <Toaster />

            {/* IA comportamiento */}
            <BehaviorTracker />

            {/* Persuasión inteligente */}
            <UrgencyNotification />
          </CartProvider>
        </ThemeProvider>

        {/* Analytics */}
        <Analytics />
      </body>
    </html>
  )
}
