import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const products = [
  {
    id: 1,
    name: 'Samsung French Door Refrigerator 617L',
    nameFr: 'Réfrigérateur Samsung French Door 617L',
    category: 'REFRIGERATOR',
    price: 485000,
    oldPrice: 520000,
    image: '/images/product-1.png',
    badge: 'NEW',
    badgeType: 'new' as const,
  },
  {
    id: 2,
    name: 'LG Front Load Washing Machine 9kg',
    nameFr: 'Lave-Linge LG Frontal 9kg',
    category: 'WASHING MACHINE',
    price: 129000,
    oldPrice: null,
    image: '/images/product-2.png',
    badge: '-15%',
    badgeType: 'sale' as const,
  },
  {
    id: 3,
    name: 'Nespresso Vertuo Coffee Machine',
    nameFr: 'Machine à Café Nespresso Vertuo',
    category: 'COFFEE MACHINE',
    price: 45000,
    oldPrice: 52000,
    image: '/images/product-3.png',
    badge: null,
    badgeType: null,
  },
  {
    id: 4,
    name: 'Samsung 65" QLED 4K Smart TV',
    nameFr: 'TV Samsung 65" QLED 4K Smart',
    category: 'TV',
    price: 320000,
    oldPrice: 375000,
    image: '/images/product-4.png',
    badge: '-15%',
    badgeType: 'sale' as const,
  },
  {
    id: 5,
    name: 'Dyson V15 Cordless Vacuum',
    nameFr: 'Aspirateur Dyson V15 Sans Fil',
    category: 'VACUUM',
    price: 98000,
    oldPrice: null,
    image: '/images/product-5.png',
    badge: 'NEW',
    badgeType: 'new' as const,
  },
  {
    id: 6,
    name: 'Bosch Built-in Electric Oven',
    nameFr: 'Four Électrique Encastrable Bosch',
    category: 'OVEN',
    price: 85000,
    oldPrice: 95000,
    image: '/images/product-6.png',
    badge: '-10%',
    badgeType: 'sale' as const,
  },
  {
    id: 7,
    name: 'Condor 5-Burner Gas Range',
    nameFr: 'Cuisinière Condor 5 Feux Gaz',
    category: 'STOVE',
    price: 72000,
    oldPrice: null,
    image: '/images/product-7.png',
    badge: null,
    badgeType: null,
  },
  {
    id: 8,
    name: 'Samsung Side-by-Side 635L Black',
    nameFr: 'Réfrigérateur Samsung Side-by-Side 635L Noir',
    category: 'REFRIGERATOR',
    price: 560000,
    oldPrice: 620000,
    image: '/images/product-8.png',
    badge: '-10%',
    badgeType: 'sale' as const,
  },
]

function ProductCard({
  product,
}: {
  product: (typeof products)[0]
}) {
  return (
    <div className="group bg-ez-bg-secondary border border-ez-border rounded-2xl overflow-hidden hover:border-ez-border-hover hover:-translate-y-2 hover:shadow-card transition-all duration-300">
      {/* Image container */}
      <div className="relative aspect-square bg-[#1a1a2e]/50 p-6 overflow-hidden">
        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[10px] font-bold ${
              product.badgeType === 'new'
                ? 'bg-ez-accent text-ez-bg'
                : 'bg-ez-danger text-white'
            }`}
          >
            {product.badge}
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-[11px] font-medium text-ez-text-muted tracking-wider uppercase mb-2">
          {product.category}
        </p>
        <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-3 min-h-[2.5rem]">
          {product.name}
        </h4>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base font-bold text-ez-accent">
            {product.price.toLocaleString()} DA
          </span>
          {product.oldPrice && (
            <span className="text-sm text-ez-text-muted line-through">
              {product.oldPrice.toLocaleString()} DA
            </span>
          )}
        </div>
        <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-ez-border rounded-full text-sm font-medium text-white hover:bg-ez-accent hover:text-ez-bg hover:border-ez-accent transition-all duration-300">
          <ShoppingCart className="w-4 h-4" />
          ADD TO CART
        </button>
      </div>
    </div>
  )
}

export default function ProductsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (gridRef.current) {
        const cards = gridRef.current.children
        gsap.fromTo(
          cards,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.06,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
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
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white">
              New <span className="text-ez-accent">Arrivals</span>
            </h2>
            <div className="w-16 h-[3px] bg-ez-accent mt-4" />
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-ez-text-secondary hover:text-ez-accent transition-colors"
          >
            See All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product grid */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile see all */}
        <div className="sm:hidden mt-8 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-ez-text-secondary hover:text-ez-accent transition-colors"
          >
            See All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
