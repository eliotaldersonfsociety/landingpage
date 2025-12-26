import Link from "next/link"
import { cookies } from "next/headers"
import { HeaderAuthClient } from "./header-auth-client"
import { HeaderCartClient } from "./header-cart-client"

export async function Header() {
  // 🔥 NEXT 16 → cookies() ES ASYNC
  const cookieStore = await cookies()
  const token = cookieStore.get("authToken")

  return (
    <header className="sticky top-0 z-[9999] w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <img
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEH0lEQVR4nNWaW4hWVRTHfzoyjppTeYVEH4LSEPJBFFEileohCNTSeYtKTCzFa4QmaoaKD41PCQ5oCUov0YsPYgZ2MyXwSpEVQjrjZcpLJpapM0cWrA2bzd77nOM53/ed/rDgzHfW9ex91lp7nYE4hgLrgcvA+9QfG9X2OmDIgyqZA1wBEqXN1B9bLPt/ArPyKngb6LWUHAH6UX/0A45afvQAi7IKv6QCiUXP0Dg86/givr2YJjQIuOAI/kzj8YvjUycwMCawyBEQ+qSAAyOAiUrDC+jZ7fFrYUzgoEegPafRAcAy4KRH1wlgKdCSU2e7R9eBmIC7rYS+A/pkNDgTOO/R4dI5YEZGnX012SSe7RXEfwHDe4FHUwyu8iSJGAnvihSdI4E9AfnbeVfE0E3gc2ArsAR43pL7IEcALm2w9LygusXGPuBORK4rFsjejMalUI62ak5SkExtGANcyygjKxXEZKcQ+qhXa43hjz21rCQ6JqnO2Rn4ey3+ID5MUbJD+R4CfishCEO/qk7Bxym87VmzxM7IljLN264SgzC0y6o/1wM84lsTOfAacMlR8qbem1GDIAxNVxtLnN/Fl9fzBNDHKljSBryqGeSwrlZfLWy1CuS42jAN4z71wbQkLWl1TW5OA74EfgfmBpZwfg2DSJR8T158adNielB99Qb0rUfhOT1QPWk9jVitKYu6gP5q82lgk1Zyl+8bXyCHMzyhhXUIIlFaoDbfiPBI++Rt9rYD9xzmbl2JppLTbZZ03KS2u5174uNH6nMQT2mePg1cBdbq73PrGESi9LLaXqu+nNI6N44C+KIBgeynZIwJdLbS8P1TgsO3NKkkDvVYPV0pWBdwQFr7x4GvCgTxPTBWR0+Jh8zWLgzJ1WcDRsxelZdyJfBvjgBkJZdr8TPvZuKhszkOdlFMizjzjsM7zhnfxNKmqU0G70b4p5YRyBPAjUgT6TrUpO9OyKnV1ioYjNWslAQOdK6NB4YY+ilgqFubyYeV2nSEFArkR2Ae0Kr8IvtHgPcMMJ6SMSTjtimLfgCGUSO01rjzTaxVSxt2FMZjNW4cLwKjqOM8Ns/oJyv1AM9RZ2yrQSDbaAAeyTG6yUJ/FfmYUxTrSwxE2qCGQdLj3RKCuFdwWl8Kvi4hkENUAMtLCEQ+QzQcsaYyK02hAhjpaQrlE94aj8Ohew1/P9CxjXHorjXGGewJxMx2W5wk0UxFcEQd6tC/m/Vk5wbynuV0h3VCrAwG6HBZWhfBp5H3Qe6hvDvTRjqNwmfAhMghKdF7E5S3sripjd8s3Ton9PPAdb3u0H8NEZ6/qTCO6lN/JcLTVsV3w4X5ptGp4x1fS9OlPG9RYfS3TpCd1tm8Va/NRP1YlVJuCKNSjsPH9JT5v0AzsFjfA0kAQnIt26kmK3EfWBIDtSW3Zq4AAAAASUVORK5CYII="
            alt="Bull logo"
            className="h-6 w-6 dark:invert"
          />
          <span>TiendaTexas</span>
        </Link>


        <div className="flex items-center gap-2">
          <HeaderAuthClient isLoggedIn={!!token} />
          <HeaderCartClient />
        </div>
      </div>
    </header>
  )
}
