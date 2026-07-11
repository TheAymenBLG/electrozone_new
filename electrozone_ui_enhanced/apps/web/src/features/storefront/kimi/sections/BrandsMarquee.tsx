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
  'SAMSUNG',
]

export default function BrandsMarquee() {
  const doubled = [...brands, ...brands]

  return (
    <section className="py-6 border-y border-ez-border overflow-hidden bg-ez-bg/50">
      <div className="relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {doubled.map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="inline-flex items-center mx-10 text-lg font-semibold text-ez-text-muted/60 hover:text-white transition-colors duration-300 select-none"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
