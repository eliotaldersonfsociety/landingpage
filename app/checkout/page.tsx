// app/checkout/page.tsx
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import CheckoutClient from "./checkout-client"

export default async function CheckoutPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("authToken")

  if (!token) {
    redirect("/login?redirect=/checkout")
  }

  return <CheckoutClient />
}
