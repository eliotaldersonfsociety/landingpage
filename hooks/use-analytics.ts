"use client"

import { useEffect } from "react"
import { analyticsStorage } from "@/lib/store"

export function useAnalytics() {
  useEffect(() => {
    // Track page view
    analyticsStorage.track({
      type: "page_view",
      data: { path: window.location.pathname },
    })
  }, [])

  const trackEvent = (type: "product_view" | "add_to_cart" | "checkout" | "click", data?: any) => {
    analyticsStorage.track({ type, data })
  }

  return { trackEvent }
}
