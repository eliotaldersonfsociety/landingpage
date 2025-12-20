"use client"

import { useState, useEffect } from "react"

export function ResultsCarousel() {
  return (
    <section id="results" className="py-10">
      <div className="container mx-auto px-4 text-center md:text-left flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance mb-4">
            DISCOVER LABUBU <span className="text-[#FF8A00] font-black">COLLECTION</span>
          </h2>
          <p className="text-pretty text-muted-foreground">
            Get our special promotion: 1 Labubu Energy collectible monster, perfect for kids and adults, plus 2 Labubu water bottles for only $40. Labubu monsters are adorable toys from Pop Mart that bring joy and fun to any collection. Start building your Labubu family today with this amazing bundle that combines collectibles and hydration essentials.
          </p>
        </div>

        <div className="relative w-full md:w-1/2 h-80 rounded-lg overflow-hidden shadow-lg">
          <video
            src="/video2.mp4#t=1"
            controls
            className="w-full h-full rounded-lg"
            preload="metadata"
          >
            Your browser does not support videos.
          </video>
        </div>
      </div>
    </section>
  )
}
