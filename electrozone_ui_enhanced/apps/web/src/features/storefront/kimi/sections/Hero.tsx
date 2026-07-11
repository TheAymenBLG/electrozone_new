import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Play, ArrowDown, Zap } from 'lucide-react'
import gsap from 'gsap'

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline reveal (kept simple so spacing is always correct)
      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.2 }
        )
      }

      // Subheading
      gsap.fromTo(
        subRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 1.2 }
      )

      // CTAs
      gsap.fromTo(
        ctaRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 1.5 }
      )

      // Image
      gsap.fromTo(
        imgRef.current,
        { x: 80, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.6 }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden pt-24"
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, rgba(26,26,46,0.6) 0%, #0a0a1a 70%)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-12 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ez-accent/30 bg-ez-accent/5 mb-8">
              <Zap className="w-4 h-4 text-ez-accent" />
              <span className="text-xs font-semibold text-ez-accent tracking-wider uppercase">
                Nouvelle Collection 2026
              </span>
            </div>

            {/* Headline */}
            <h1
              ref={headlineRef}
              className="text-4xl sm:text-5xl lg:text-[48px] font-extrabold leading-[1.1] text-white mb-6"
            >
              Engineering of Modern Comfort
            </h1>

            {/* Subheading */}
            <p
              ref={subRef}
              className="text-base text-ez-text-secondary leading-relaxed max-w-[520px] mb-8 opacity-0"
            >
              Discover an exclusive selection of high-end appliances combining technological
              performance and minimalist design for your home.
            </p>

            {/* CTAs */}
            <div ref={ctaRef} className="flex flex-wrap items-center gap-4 opacity-0">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-3.5 bg-ez-accent text-ez-bg font-semibold text-sm rounded-full hover:bg-ez-accent-hover transition-all hover:scale-[1.02]"
              >
                Explore the Collection
              </Link>
              <button className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/30 text-white font-semibold text-sm rounded-full hover:border-ez-accent hover:text-ez-accent transition-all">
                <Play className="w-4 h-4" />
                Watch Video
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-ez-border">
              <div>
                <p className="text-lg font-bold text-white">48 mois</p>
                <p className="text-xs text-ez-text-muted mt-1">Garantie produit</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">Livraison</p>
                <p className="text-xs text-ez-text-muted mt-1">Rapide partout</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">Prix</p>
                <p className="text-xs text-ez-text-muted mt-1">Imbatables</p>
              </div>
            </div>
          </div>

          {/* Right - Appliance image */}
          <div ref={imgRef} className="relative flex items-center justify-center opacity-0">
            <div className="relative animate-float">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-ez-accent/10 blur-[80px] rounded-full scale-75" />
              <img
                src="/images/hero-appliance.png"
                alt="Premium Refrigerator"
                className="relative w-full max-w-[500px] h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-[10px] tracking-[0.2em] uppercase text-ez-text-muted">Scroll</span>
        <ArrowDown className="w-4 h-4 text-ez-text-muted animate-bounce" />
      </div>
    </section>
  )
}
