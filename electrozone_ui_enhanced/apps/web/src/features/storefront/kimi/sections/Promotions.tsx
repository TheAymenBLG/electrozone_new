import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Promotions() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-10">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-12">
        <div
          ref={cardRef}
          className="relative h-[400px] md:h-[450px] rounded-2xl overflow-hidden opacity-0"
        >
          {/* Background image */}
          <img
            src="/images/promo-banner.jpg"
            alt="Summer Kitchen Upgrade"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(10,10,26,0.95) 0%, rgba(10,10,26,0.8) 40%, rgba(10,10,26,0.4) 70%, transparent 100%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full p-8 md:p-12 lg:p-16 max-w-lg">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-ez-accent text-ez-bg text-xs font-bold w-fit mb-6">
              LIMITED TIME
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Summer Kitchen
              <br />
              <span className="text-ez-accent">Upgrade</span>
            </h2>
            <p className="text-ez-text-secondary text-base mb-8 leading-relaxed">
              Up to 30% off on selected built-in appliances from top brands. Transform your
              kitchen into a modern culinary space.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-ez-accent text-ez-bg font-semibold text-sm rounded-full hover:bg-ez-accent-hover transition-all hover:scale-[1.02] w-fit"
            >
              Shop the Sale
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
