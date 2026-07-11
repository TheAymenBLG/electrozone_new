import { useEffect, useRef } from 'react'
import { Shield, Truck, Headphones, Tag } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: Shield,
    title: 'Quality Products',
    titleFr: 'Produits de Qualité',
    description: 'All appliances are sourced from trusted brands with authentic warranties.',
    descriptionFr: 'Tous les appareils proviennent de marques de confiance avec garanties authentiques.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    titleFr: 'Livraison Rapide',
    description: 'Quick delivery across all of Algeria. Track your order in real-time.',
    descriptionFr: 'Livraison rapide dans toute l\'Algérie. Suivez votre commande en temps réel.',
  },
  {
    icon: Headphones,
    title: 'Customer Service',
    titleFr: 'Service Client',
    description: 'Responsive support team ready to help you with any questions.',
    descriptionFr: 'Équipe de support réactive prête à vous aider pour toute question.',
  },
  {
    icon: Tag,
    title: 'Best Prices',
    titleFr: 'Meilleurs Prix',
    description: 'Competitive pricing all year round with regular promotions.',
    descriptionFr: 'Prix compétitifs toute l\'année avec des promotions régulières.',
  },
]

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (gridRef.current) {
        const items = gridRef.current.children
        gsap.fromTo(
          items,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
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
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white">
            Why Choose <span className="text-ez-accent">Us</span>
          </h2>
          <div className="w-16 h-[3px] bg-ez-accent mt-4 mx-auto" />
        </div>

        {/* Features grid */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-ez-bg-secondary border border-ez-border flex items-center justify-center group-hover:border-ez-accent/50 transition-colors">
                  <Icon className="w-7 h-7 text-ez-accent" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-ez-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
