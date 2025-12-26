import Image from "next/image"
import { Play } from "lucide-react"

interface ResultsCarouselProps {
  isPlaying: boolean
  onPlay: () => void
  onEnded: () => void
}

export function ResultsCarousel({
  isPlaying,
  onPlay,
  onEnded,
}: ResultsCarouselProps) {
  return (
    <section id="results" className="py-10">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
        {/* TEXT */}
        <div className="space-y-4 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold">
            DISCOVER LABUBU{" "}
            <span className="text-[#FF8A00] font-black">
              COLLECTION
            </span>
          </h2>

          <p className="text-muted-foreground">
            Get our special promotion: 1 Labubu Energy collectible
            monster, perfect for kids and adults, plus 2 Labubu water
            bottles for only $40.
          </p>
        </div>

        {/* MEDIA */}
        <div className="relative w-full max-w-md mx-auto aspect-square">
          {!isPlaying ? (
            <button
              onClick={onPlay}
              className="relative group w-full h-full rounded-lg overflow-hidden"
            >
              {/* PREVIEW IMAGE */}
              <Image
                src="/video2.webp"
                alt="Labubu preview"
                fill
                sizes="(max-width: 768px) 100vw, 448px"
                className="object-cover"
              />

              {/* OVERLAY */}
              <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="bg-black/50 p-4 rounded-full group-hover:scale-110 transition">
                  <Play className="w-8 h-8 text-white" />
                </span>
              </span>
            </button>
          ) : (
            <video
              src="/video2.mp4"
              autoPlay
              controls
              playsInline
              preload="metadata"
              className="w-full h-full rounded-lg shadow-lg"
              onEnded={onEnded}
            />
          )}
        </div>
      </div>
    </section>
  )
}
