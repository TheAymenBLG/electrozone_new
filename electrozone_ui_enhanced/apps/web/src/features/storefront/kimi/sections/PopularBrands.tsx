import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const brands = [
  'GEANT',
  'MAXWELL',
  'DigiTech',
  'Condor',
  'CRISTOR',
  'IRIS',
  'BOSCH',
  "De'Longhi",
  'BOMANN',
  'BISSELL',
  'beko',
]

export default function PopularBrands() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const pillsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (pillsRef.current) {
        const pills = pillsRef.current.children
        gsap.fromTo(
          pills,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.04,
            duration: 0.5,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white">
            Popular <span className="text-ez-accent">Brands</span>
          </h2>
          <div className="w-16 h-[3px] bg-ez-accent mt-4" />
        </div>

        {/* Brand pills */}
        <div ref={pillsRef} className="flex flex-wrap gap-3">
          {brands.map((brand) => (
            <button
              key={brand}
              className="px-6 py-3 bg-ez-bg-secondary border border-ez-border rounded-full text-sm font-medium text-white hover:border-ez-accent hover:text-ez-accent transition-all duration-300"
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
