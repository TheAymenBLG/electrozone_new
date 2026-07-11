import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Heart, Globe, User, ShoppingCart, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [lang, setLang] = useState<'FR' | 'EN'>('FR')
  const location = useLocation()

  const isAdmin = location.pathname === '/admin'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isAdmin) return null

  const navLinks = [
    { label: lang === 'FR' ? 'Accueil' : 'Home', href: '/' },
    { label: lang === 'FR' ? 'Promotions' : 'Promotions', href: '/c/machine-a-cafe' },
    { label: lang === 'FR' ? 'TV & Maison' : 'TV & Smart Home', href: '/c/tv' },
    { label: lang === 'FR' ? 'Lave-Linge' : 'Washing Machines', href: '/c/machine-a-laver' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-ez-border'
          : 'bg-transparent'
      }`}
    >
      {/* Top bar */}
      <div className="bg-ez-bg-secondary border-b border-ez-border">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-12 flex items-center justify-between h-9">
          <p className="text-xs text-ez-text-muted hidden sm:block">
            {lang === 'FR'
              ? 'Bienvenue chez ElectroZone — Votre univers électroménager en un clic !'
              : 'Welcome to ElectroZone — Your appliance universe in one click!'}
          </p>
          <div className="flex items-center gap-4 ml-auto">
            <a href="tel:0554576664" className="text-xs text-ez-text-secondary hover:text-ez-accent transition-colors flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-ez-success inline-block" />
              0554 57 66 64
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 shrink-0">
            <img src="/img/logo.png" alt="ElectroZone" className="h-9 object-contain" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm font-medium text-ez-text-secondary hover:text-ez-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              {searchOpen && (
                <input
                  autoFocus
                  type="text"
                  placeholder={lang === 'FR' ? 'Rechercher...' : 'Search...'}
                  className="absolute right-10 top-1/2 -translate-y-1/2 w-64 bg-ez-bg-secondary border border-ez-border rounded-full px-4 py-2 text-sm text-white placeholder:text-ez-text-muted focus:border-ez-accent focus:outline-none transition-all"
                  onBlur={() => setSearchOpen(false)}
                />
              )}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-ez-bg-secondary transition-colors"
              >
                <Search className="w-4 h-4 text-ez-text-secondary" />
              </button>
            </div>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'FR' ? 'EN' : 'FR')}
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full border border-ez-border hover:border-ez-accent transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-ez-text-secondary" />
              <span className="text-xs font-medium text-ez-text-secondary">{lang}</span>
            </button>

            <button className="w-9 h-9 hidden sm:flex items-center justify-center rounded-full hover:bg-ez-bg-secondary transition-colors">
              <Heart className="w-4 h-4 text-ez-text-secondary" />
            </button>

            <Link
              to="/admin"
              className="w-9 h-9 hidden sm:flex items-center justify-center rounded-full hover:bg-ez-bg-secondary transition-colors"
            >
              <User className="w-4 h-4 text-ez-text-secondary" />
            </Link>

            <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-ez-bg-secondary transition-colors">
              <ShoppingCart className="w-4 h-4 text-ez-text-secondary" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-ez-accent rounded-full text-[10px] font-bold text-ez-bg flex items-center justify-center">
                0
              </span>
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-ez-bg-secondary transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-ez-border">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-medium text-ez-text-secondary hover:text-ez-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
