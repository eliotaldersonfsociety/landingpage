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
    titlePart1: "DISCOVER LABUBU",
    titlePart2: "MONSTERS",
    description:
      "Dive into the adorable world of Labubu monsters from Pop Mart. These cute collectible figures bring joy and fun to any collection.",
    media: "/video.mp4",
    poster: "/video1.webp",
  },
  {
    type: "image",
    titlePart1: "COLLECT THEM",
    titlePart2: "ALL",
    description:
      "Build your ultimate Labubu collection with monsters of all shapes and sizes.",
    media: "/2.webp",
  },
  {
    type: "image",
    titlePart1: "SPECIAL BUNDLE",
    titlePart2: "OFFER",
    description:
      "Get 1 Labubu Monster and 2 Water Bottles for only $40!",
    media: "/1.webp",
  },
  {
    type: "image",
    titlePart1: "SEE LABUBU",
    titlePart2: "MAGIC",
    description:
      "Watch the Labubu monsters come to life and get inspired.",
    media: "/3.webp",
  },
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
