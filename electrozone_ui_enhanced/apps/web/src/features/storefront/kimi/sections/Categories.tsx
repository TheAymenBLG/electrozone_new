import { useEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const categories = [
  { name: 'Refrigerator', nameFr: 'Réfrigérateur', href: '/products' },
  { name: 'Coffee Machine', nameFr: 'Machine à Café', href: '/products' },
  { name: 'TV', nameFr: 'Téléviseur', href: '/products' },
  { name: 'Vacuum Cleaner', nameFr: 'Aspirateur', href: '/products' },
  { name: 'Stove', nameFr: 'Cuisinière', href: '/products' },
  { name: 'Washing Machine', nameFr: 'Lave-Linge', href: '/products' },
]

function SpotlightCard({
  name,
  nameFr,
  href,
}: {
  name: string
  nameFr: string
  href: string
}) {
  const cardRef = useRef<HTMLAnchorElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <a
      ref={cardRef}
      href={href}
      onMouseMove={handleMouseMove}
      className="spotlight-card group relative flex flex-col justify-between h-[200px] p-6 bg-ez-bg-secondary border border-ez-border rounded-2xl hover:border-ez-border-hover transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative z-10">
        <h3 className="text-xl font-semibold text-white">{name}</h3>
        <p className="text-sm text-ez-text-muted mt-1">{nameFr}</p>
      </div>
      <div className="relative z-10 flex justify-end">
        <div className="w-10 h-10 rounded-full border border-ez-border flex items-center justify-center group-hover:border-ez-accent group-hover:bg-ez-accent/10 transition-all duration-300">
          <ArrowUpRight className="w-4 h-4 text-ez-text-muted group-hover:text-ez-accent transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </a>
  )
}

export default function Categories() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        const cards = cardsRef.current.children
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.7,
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
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white">
            Discover Our{' '}
            <span className="text-ez-accent">Categories</span>
          </h2>
          <div className="w-16 h-[3px] bg-ez-accent mt-4" />
        </div>

        {/* Bento grid */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <SpotlightCard key={cat.name} {...cat} />
          ))}
        </div>
      </div>
    </section>
  )
}
