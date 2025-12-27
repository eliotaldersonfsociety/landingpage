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
Each box includes:
• 1x Each box contains one random Labubu figure — the surprise is the fun part!
• 2x Exclusive collectible bottles

🚚 Ships from Hot Springs, TX · 1 business days

📦 WHAT’S INSIDE THE BOX
✔ Official Pop Mart–style collectible
✔ Perfect for kids, collectors & gifts

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
      "Beautifully packed and ready to surprise.\n🎄 Perfect for birthdays & holidays\n🎁 Premium packaging\n😊 Instant smiles guaranteed",
    media: "/6.webp",
  },
  {
    type: "image",
    titlePart1: "MORE THAN A TOY",
    titlePart2: "A BEST FRIEND 💛",
    description:
      "Soft, adorable, and designed to bring comfort anywhere.\nA hug they’ll never want to let go.",
    media: "/7.webp",
  },
  {
    type: "image",
    titlePart1: "LOVED BY KIDS",
    titlePart2: "TRUSTED BY PARENTS ✅",
    description:
      "Perfect for school, playtime, and everyday adventures.\n✔ Safe materials\n✔ Easy to clean\n✔ Kid-approved comfort",
    media: "/4.webp",
  },
  {
    type: "image",
    titlePart1: "SHIPS FAST FROM",
    titlePart2: "HOT SPRINGS, TX 🚚",
    description:
      "Fulfilled in the U.S.\nFast shipping from Hot Springs, TX\nNo long waits\n\n🔒 Secure checkout · Pay with PayPal, Visa or Mastercard\nYour payment is 100% protected",
    media: "/5.webp",
  },
]

export function AlternatingContent() {
  const [playing, setPlaying] = useState<number | null>(null)

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {sections.map((section, index) => (
          <div
            key={index}
            className="grid lg:grid-cols-2 gap-12 items-center mb-20"
          >
            {/* TEXT */}
            <div
              className={`space-y-4 ${
                index % 2 === 0 ? "order-2 lg:order-1" : "order-2"
              }`}
            >
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                {section.titlePart1}{" "}
                <span className="text-orange-500">
                  {section.titlePart2}
                </span>
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.description}
              </p>

              {/* Micro trust line only on first section */}
              {index === 0 && (
                <p className="text-[11px] text-muted-foreground opacity-80">
                  🔒 Secure checkout · PayPal · Visa · Mastercard
                </p>
              )}
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
                    className="w-full max-w-md mx-auto rounded-xl shadow-lg"
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
                      className="w-full h-64 lg:h-80 object-cover rounded-xl"
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
                  className="w-full h-64 lg:h-80 object-cover rounded-xl shadow-md"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
