import { useState, useEffect, useRef } from 'react'
import { Send, Check } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setEmail('')
      }, 3000)
    }
  }

  return (
    <section ref={sectionRef} className="py-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-12">
        <div
          ref={contentRef}
          className="max-w-2xl mx-auto text-center opacity-0"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay in the <span className="text-ez-accent">Loop</span>
          </h2>
          <p className="text-ez-text-secondary mb-8">
            Subscribe for exclusive offers, new arrivals, and appliance tips.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-5 py-3.5 bg-ez-bg-secondary border border-ez-border rounded-full text-white text-sm placeholder:text-ez-text-muted focus:border-ez-accent focus:outline-none focus:ring-1 focus:ring-ez-accent/30 transition-all"
                disabled={submitted}
              />
            </div>
            <button
              type="submit"
              disabled={submitted}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm transition-all ${
                submitted
                  ? 'bg-ez-success text-white'
                  : 'bg-ez-accent text-ez-bg hover:bg-ez-accent-hover hover:scale-[1.02]'
              }`}
            >
              {submitted ? (
                <>
                  <Check className="w-4 h-4" />
                  Subscribed
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Subscribe
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
