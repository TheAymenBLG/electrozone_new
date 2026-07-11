import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const slides = [
  { image: '/images/carousel-1.jpg', caption: 'Modern Kitchen' },
  { image: '/images/carousel-2.jpg', caption: 'Entertainment Hub' },
  { image: '/images/carousel-3.jpg', caption: 'Laundry Perfection' },
  { image: '/images/carousel-4.jpg', caption: 'Coffee Moments' },
  { image: '/images/carousel-5.jpg', caption: 'Open Living' },
  { image: '/images/carousel-6.jpg', caption: 'Clean Living' },
]

export default function Experience() {
  const [active, setActive] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the section and drive horizontal scroll
      if (trackRef.current && sectionRef.current) {
        const totalWidth = trackRef.current.scrollWidth - window.innerWidth

        gsap.to(trackRef.current, {
          x: -totalWidth,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => `+=${totalWidth}`,
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
              const newActive = Math.min(
                slides.length - 1,
                Math.floor(self.progress * slides.length)
              )
              setActive(newActive)
            },
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden bg-ez-bg">
      {/* Section label */}
      <div className="absolute top-8 left-4 md:left-12 z-20">
        <p className="text-xs font-medium text-ez-text-muted tracking-wider uppercase mb-1">
          Experience
        </p>
        <h2 className="text-2xl font-bold text-white">
          Lifestyle <span className="text-ez-accent">Gallery</span>
        </h2>
      </div>

      {/* Horizontal track */}
      <div
        ref={trackRef}
        className="flex items-center h-full gap-8 px-4 md:px-12 pt-20"
        style={{ width: 'fit-content' }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`relative flex-shrink-0 h-[70vh] rounded-2xl overflow-hidden transition-all duration-500 ${
              i === active ? 'w-[80vw] md:w-[60vw] opacity-100' : 'w-[70vw] md:w-[50vw] opacity-60'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.caption}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ez-bg/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <p className="text-lg font-semibold text-white">{slide.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`transition-all duration-300 rounded-full ${
              i === active
                ? 'w-8 h-3 bg-ez-accent'
                : 'w-3 h-3 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
