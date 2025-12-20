import { Dumbbell, Facebook, Instagram, Youtube } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-8 md:space-y-0">

          {/* Logo and description section */}
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEH0lEQVR4nNWaW4hWVRTHfzoyjppTeYVEH4LSEPJBFFEileohCNTSeYtKTCzFa4QmaoaKD41PCQ5oCUov0YsPYgZ2MyXwSpEVQjrjZcpLJpapM0cWrA2bzd77nOM53/ed/rDgzHfW9ex91lp7nYE4hgLrgcvA+9QfG9X2OmDIgyqZA1wBEqXN1B9bLPt/ArPyKngb6LWUHAH6UX/0A45afvQAi7IKv6QCiUXP0Dg86/givr2YJjQIuOAI/kzj8YvjUycwMCawyBEQ+qSAAyOAiUrDC+jZ7fFrYUzgoEegPafRAcAy4KRH1wlgKdCSU2e7R9eBmIC7rYS+A/pkNDgTOO/R4dI5YEZGnX012SSe7RXEfwHDe4FHUwyu8iSJGAnvihSdI4E9AfnbeVfE0E3gc2ArsAR43pL7IEcALm2w9LygusXGPuBORK4rFsjejMalUI62ak5SkExtGANcyygjKxXEZKcQ+qhXa43hjz21rCQ6JqnO2Rn4ey3+ID5MUbJD+R4CfishCEO/qk7Bxym87VmzxM7IljLN264SgzC0y6o/1wM84lsTOfAacMlR8qbem1GDIAxNVxtLnN/Fl9fzBNDHKljSBryqGeSwrlZfLWy1CuS42jAN4z71wbQkLWl1TW5OA74EfgfmBpZwfg2DSJR8T158adNielB99Qb0rUfhOT1QPWk9jVitKYu6gP5q82lgk1Zyl+8bXyCHMzyhhXUIIlFaoDbfiPBI++Rt9rYD9xzmbl2JppLTbZZ03KS2u5174uNH6nMQT2mePg1cBdbq73PrGESi9LLaXqu+nNI6N44C+KIBgeynZIwJdLbS8P1TgsO3NKkkDvVYPV0pWBdwQFr7x4GvCgTxPTBWR0+Jh8zWLgzJ1WcDRsxelZdyJfBvjgBkJZdr8TPvZuKhszkOdlFMizjzjsM7zhnfxNKmqU0G70b4p5YRyBPAjUgT6TrUpO9OyKnV1ioYjNWslAQOdK6NB4YY+ilgqFubyYeV2nSEFArkR2Ae0Kr8IvtHgPcMMJ6SMSTjtimLfgCGUSO01rjzTaxVSxt2FMZjNW4cLwKjqOM8Ns/oJyv1AM9RZ2yrQSDbaAAeyTG6yUJ/FfmYUxTrSwxE2qCGQdLj3RKCuFdwWl8Kvi4hkENUAMtLCEQ+QzQcsaYyK02hAhjpaQrlE94aj8Ohew1/P9CxjXHorjXGGewJxMx2W5wk0UxFcEQd6tC/m/Vk5wbynuV0h3VCrAwG6HBZWhfBp5H3Qe6hvDvTRjqNwmfAhMghKdF7E5S3sripjd8s3Ton9PPAdb3u0H8NEZ6/qTCO6lN/JcLTVsV3w4X5ptGp4x1fS9OlPG9RYfS3TpCd1tm8Va/NRP1YlVJuCKNSjsPH9JT5v0AzsFjfA0kAQnIt26kmK3EfWBIDtSW3Zq4AAAAASUVORK5CYII="
                alt="Bull logo"
                className="h-6 w-6 invert"
              />

              <span className="font-bold text-xl">TiendaTexas</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md md:max-w-xs mx-auto md:mx-0">
              Tienda Texas is a leading company in the online sale of various items. Located in the USA, we offer a wide range of quality products with shipping nationwide. Our mission is to provide an exceptional shopping experience with first-class customer service.
            </p>
          </div>

          {/* Social Media */}
          <div className="space-y-4 text-center md:text-left">
            <h3 className="font-semibold text-lg">Follow us on our social media</h3>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <Link href="https://web.facebook.com/profile.php?id=61580121111204" aria-label="Facebook">
                <Facebook className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link href="https://instagram.com/tiendatexas" aria-label="Instagram">
                <Instagram className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link href="https://tiktok.com/tiendatexas" aria-label="TikTok">
                <Youtube className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>

          {/* Links to Terms, Privacy and Contact */}
          <div className="space-y-4 text-center md:text-left">
            <h3 className="font-semibold text-lg">Information</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:underline">Terms of Service</Link></li>
              <li><Link href="#" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:underline">Contact</Link></li>
            </ul>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground md:self-end">
            © 2025 TiendaTexas. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  )
}