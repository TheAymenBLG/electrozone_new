import { Link } from 'react-router-dom'
import { Facebook, Instagram } from 'lucide-react'

const infoLinks = [
  { label: 'My Cart', href: '/products' },
  { label: 'Shop', href: '/products' },
  { label: 'Dashboard', href: '/admin' },
  { label: 'Contact', href: '/' },
]

const socialLinks = [
  { label: 'Facebook', icon: Facebook, href: '#' },
  { label: 'Instagram', icon: Instagram, href: '#' },
  { label: 'TikTok', icon: null, href: '#' },
]

const brandLinks = [
  ['GEANT', 'MAXWELL'],
  ['DigiTech', 'Condor'],
  ['CRISTOR', 'IRIS'],
  ['BOSCH', "De'Longhi"],
  ['BOMANN', 'BISSELL'],
  ['beko', ''],
]

export default function Footer() {
  return (
    <footer className="bg-ez-bg-tertiary border-t border-ez-border pt-16 pb-8">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Company info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-xl font-extrabold tracking-tight text-white">
                ELECTRO<span className="text-ez-accent">ZONE</span>
              </span>
            </Link>
            <p className="text-sm text-ez-text-secondary leading-relaxed mb-6 max-w-xs">
              ElectroZone is an online store specializing in household appliances and multimedia. A
              wide range of quality products at competitive prices.
            </p>
            <p className="text-xs text-ez-text-muted">
              &copy; 2025 ElectroZone Algeria.
              <br />
              Engineering Excellence.
            </p>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-xs font-semibold text-ez-text-muted tracking-wider uppercase mb-5">
              Information
            </h4>
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-ez-text-secondary hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-ez-border">
              <p className="text-xs text-ez-text-muted">Tel: 0554 57 66 64</p>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-semibold text-ez-text-muted tracking-wider uppercase mb-5">
              Follow Us
            </h4>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="inline-flex items-center gap-2 text-sm text-ez-text-secondary hover:text-white transition-colors"
                  >
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {!link.icon && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                    )}
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h4 className="text-xs font-semibold text-ez-text-muted tracking-wider uppercase mb-5">
              Our Brands
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {brandLinks.flat().filter(Boolean).map((brand) => (
                <a
                  key={brand}
                  href="#"
                  className="text-sm text-ez-text-secondary hover:text-ez-accent transition-colors"
                >
                  {brand}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-ez-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ez-text-muted">
            All rights reserved. ElectroZone Algeria.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-ez-text-muted hover:text-ez-text-secondary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-ez-text-muted hover:text-ez-text-secondary transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
