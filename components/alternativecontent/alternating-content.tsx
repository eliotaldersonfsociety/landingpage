"use client"

import React, { useState } from "react"
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
      "Dive into the adorable world of Labubu monsters from Pop Mart. These cute collectible figures bring joy and fun to any collection. Each monster has its own unique personality and charm, perfect for fans of blind box collecting. Start your journey with these lovable creatures that spark imagination and happiness.",
    media: "/video.mp4",
    poster: "/video1.webp"
  },
  {
    type: "image",
    titlePart1: "COLLECT THEM",
    titlePart2: "ALL",
    description: "Build your ultimate Labubu collection with monsters of all shapes and sizes. From sleepy bears to mischievous cats, each figure adds character to your display. Experience the thrill of collecting and trading these popular Pop Mart items. Join the global community of Labubu enthusiasts and expand your monster family.",
    media: "/2.webp"
  },
  {
    type: "image",
    titlePart1: "SPECIAL BUNDLE",
    titlePart2: "OFFER",
    description: "Get 1 Labubu Monster and 2 Water Bottles for only $40! This exclusive bundle combines your favorite collectible with practical hydration essentials. Perfect for collectors who want to stay refreshed while building their monster collection. Don't miss this limited-time deal to add fun and functionality to your life.",
    media: "/1.webp"
  },
  {
    type: "image",
    titlePart1: "SEE LABUBU",
    titlePart2: "MAGIC",
    description: "Watch the Labubu monsters come to life in our exciting video. See how these cute figures inspire creativity and bring smiles to faces everywhere. Learn about the Pop Mart phenomenon and why Labubu has captured hearts worldwide. Get inspired to start or expand your own collection today.",
    media: "/3.webp"
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
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  />
                ) : (
                  <button
                    onClick={() => setPlaying(index)}
                    className="relative group w-full max-w-md mx-auto"
                  >
                    <img
                      src={section.poster}
                      alt="Video preview"
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
                <img
                  src={section.media}
                  alt={`${section.titlePart1} ${section.titlePart2}`}
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
