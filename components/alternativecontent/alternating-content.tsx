"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"

interface Section {
  type: "image" | "video"
  titlePart1: string
  titlePart2: string
  description: string
  media: string
  poster?: string
}

const sections: Section[] = [
  {
    type: "video",
    titlePart1: "🎁 LABUBU SURPRISE BOX",
    titlePart2: "+ 2 CUTE BOTTLES 🧸",
    description: `
  Each box is a surprise Labubu figure
  + 2 exclusive collectible bottles

  🚚 Ships fast from Hot Springs, TX 🇺🇸

  📦 WHAT’S INSIDE THE BOX
  • 1x Labubu Blind Box (Random Design)
  • 2x Cute collectible bottles
  • Official Pop Mart–style collectible
  • Perfect for kids, collectors & gifts

  You don’t choose the design — that’s the fun part.
  Every box is a surprise experience 🎉
    `,
    media: "/video.mp4",
    poster: "/video1.webp",
  },

  {
    type: "image",
    titlePart1: "THE PERFECT GIFT",
    titlePart2: "THEY'LL REMEMBER 🎁",
    description:
      "Beautifully packed and ready to surprise.🎄 Perfect for birthdays & holidays🎁 Premium packaging 😊 Instant smiles guaranteed",
    media: "/6.webp",
  },
  {
    type: "image",
    titlePart1: "MORE THAN A TOY",
    titlePart2: "A BEST FRIEND 💛",
    description:
      "Soft, adorable, and designed to bring comfort anywhere. A hug they’ll never want to let go.",
    media: "/7.webp",
  },
  {
    type: "image",
    titlePart1: "LOVED BY KIDS",
    titlePart2: "TRUSTED BY PARENTS ✅",
    description:
      "Perfect for school, playtime, and everyday adventures. ✔️ Safe materials ✔️ Easy to clean ✔️ Kid-approved comfort",
    media: "/4.webp",
  },
  {
    type: "image",
    titlePart1: "SHIPS FAST FROM",
    titlePart2: "HOT SPRINGS, TX us 🚚",
    description:
      "Fulfilled in the U.S. · Fast shipping from Hot Springs, TX · No long waits. Secure checkout · Pay with PayPal, Visa or Mastercard, 🔒 Your payment is 100% protected",
    media: "/5.webp",
  }
]

export function AlternatingContent() {
  const [playing, setPlaying] = useState<number | null>(null)

  return (
    <section>
      <div className="container">
        {sections.map((section, index) => (
          <div
            key={index}
            className="grid lg:grid-cols-2 gap-12 items-center mb-16"
          >
            {/* TEXT */}
            <div
              className={`space-y-6 ${
                index % 2 === 0 ? "order-2 lg:order-1" : "order-2"
              }`}
            >
              <h2 className="text-3xl md:text-4xl font-bold">
                {section.titlePart1}{" "}
                <span className="text-orange-500">
                  {section.titlePart2}
                </span>
              </h2>

              <p className="text-muted-foreground">
                {section.description}
              </p>
            </div>

            {/* MEDIA */}
            <div
              className={`relative ${
                index % 2 === 0 ? "order-1 lg:order-2" : "order-1"
              }`}
            >
              {section.type === "video" ? (
                playing === index ? (
                  <video
                    src={section.media}
                    controls
                    autoPlay
                    playsInline
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                    aria-label="Labubu promotional video"
                  />
                ) : (
                  <button
                    onClick={() => setPlaying(index)}
                    aria-label="Play Labubu video"
                    className="relative group w-full max-w-md mx-auto"
                  >
                    <Image
                      src={section.poster!}
                      alt="Labubu video preview"
                      width={616}
                      height={320}
                      sizes="(max-width: 768px) 100vw, 616px"
                      className="w-full h-64 object-cover rounded-lg"
                    />

                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-black/60 p-4 rounded-full group-hover:scale-110 transition">
                        <Play className="w-8 h-8 text-white" />
                      </span>
                    </span>
                  </button>
                )
              ) : (
                <Image
                  src={section.media}
                  alt={`${section.titlePart1} ${section.titlePart2}`}
                  width={616}
                  height={320}
                  sizes="(max-width: 768px) 100vw, 616px"
                  className="w-full h-64 lg:h-80 object-cover rounded-lg"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
