import React from 'react'

interface Section {
  type: 'image' | 'video'
  titlePart1: string
  titlePart2: string
  description: string
  media: string // image src or youtube video id
}

const sections: Section[] = [
  {
    type: 'video',
    titlePart1: 'DISCOVER LABUBU',
    titlePart2: 'MONSTERS',
    description: 'Dive into the adorable world of Labubu monsters from Pop Mart. These cute collectible figures bring joy and fun to any collection. Each monster has its own unique personality and charm, perfect for fans of blind box collecting. Start your journey with these lovable creatures that spark imagination and happiness.',
    media: '/video.mp4' 
  },
  {
    type: 'image',
    titlePart1: 'COLLECT THEM',
    titlePart2: 'ALL',
    description: 'Build your ultimate Labubu collection with monsters of all shapes and sizes. From sleepy bears to mischievous cats, each figure adds character to your display. Experience the thrill of collecting and trading these popular Pop Mart items. Join the global community of Labubu enthusiasts and expand your monster family.',
    media: '/2.jpeg'
  },
  {
    type: 'image',
    titlePart1: 'SPECIAL BUNDLE',
    titlePart2: 'OFFER',
    description: 'Get 1 Labubu Monster and 2 Water Bottles for only $40! This exclusive bundle combines your favorite collectible with practical hydration essentials. Perfect for collectors who want to stay refreshed while building their monster collection. Don\'t miss this limited-time deal to add fun and functionality to your life.',
    media: '/1.jpeg'
  },
  {
    type: 'image',
    titlePart1: 'SEE LABUBU',
    titlePart2: 'MAGIC',
    description: 'Watch the Labubu monsters come to life in our exciting video. See how these cute figures inspire creativity and bring smiles to faces everywhere. Learn about the Pop Mart phenomenon and why Labubu has captured hearts worldwide. Get inspired to start or expand your own collection today.',
    media: '/3.jpeg' // placeholder youtube id
  }
]

export function AlternatingContent() {
  return (
    <section className="">
      <div className="container">
        {sections.map((section, index) => (
          <div key={index} className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className={`space-y-6 ${index % 2 === 0 ? 'order-2 lg:order-1' : 'order-2 lg:order-2'}`}>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
                <b>{section.titlePart1} <span className="text-orange-500">{section.titlePart2}</span></b>
              </h2>
              <p className="text-muted-foreground text-pretty">
                {section.description}
              </p>
            </div>
            <div className={`relative ${index % 2 === 0 ? 'order-1 lg:order-2' : 'order-1 lg:order-1'}`}>
              {section.type === 'image' ? (
                <img src={section.media} alt={`${section.titlePart1} ${section.titlePart2}`} className="w-full h-64 lg:h-80 object-cover rounded-lg mask-hero mask-hero-double" />
              ) : (
                <div className="aspect-square">
                  <video
                    src={section.media}
                    controls
                    className="w-full h-full rounded-lg"
                    preload="metadata"
                  >
                    Your browser does not support videos.
                  </video>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}