import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Zap, Play, ShieldCheck, Truck, Headphones, Tag, ArrowRight, Mail, ArrowDown, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProducts, useOffers, useCategories } from "../../data/store";
import ProductCard from "../../components/ProductCard";
import { priceProduct } from "../../lib/offers";
import { BRANDS, BANNER_FOURS } from "../../data/brand";
import BrandLogo from "../../components/BrandLogo";

gsap.registerPlugin(ScrollTrigger);

const BENTO = [
  { slug: "refrigerateur", span: "" },
  { slug: "machine-a-cafe", span: "" },
  { slug: "tv", span: "md:col-span-2" },
  { slug: "aspirateur", span: "md:col-span-2" },
  { slug: "cuisiniere", span: "" },
  { slug: "machine-a-laver", span: "" },
];

const EXPERIENCE_SLIDES = [
  { image: "/images/carousel-1.jpg", caption: "Cuisine Moderne" },
  { image: "/images/carousel-2.jpg", caption: "Salon Connecté" },
  { image: "/images/carousel-3.jpg", caption: "Buanderie Parfaite" },
  { image: "/images/carousel-4.jpg", caption: "Moments Café" },
  { image: "/images/carousel-5.jpg", caption: "Espace de Vie" },
  { image: "/images/carousel-6.jpg", caption: "Maison Saine" },
];

export default function Home() {
  const products = useProducts();
  const offers = useOffers();
  const categories = useCategories();

  const root = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const gallerySectionRef = useRef<HTMLDivElement>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const [galleryActive, setGalleryActive] = useState(0);

  const FEATURES = [
    { icon: ShieldCheck, title: "Produits de qualité", desc: "Garantis jusqu'à 48 mois" },
    { icon: Truck, title: "Livraison rapide", desc: "Toute l'Algérie, 58 wilayas" },
    { icon: Headphones, title: "Service client", desc: "Réactif et à l'écoute" },
    { icon: Tag, title: "Meilleurs prix", desc: "Offres compétitives toute l'année" },
  ];

  const promos = products.filter((p) => p.isActive && priceProduct(p, offers).discountPct > 0);
  const featured = products.filter((p) => p.isActive).slice(0, 8);
  const grid = (promos.length ? promos : featured).slice(0, 8);
  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
  const catImg = (slug: string) => products.find((p) => p.categorySlug === slug)?.imageUrl;

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll(".word");
        gsap.from(words, { y: 55, opacity: 0, stagger: 0.1, duration: 0.85, ease: "power3.out", delay: 0.15 });
      }
      gsap.from("[data-hero]", { y: 26, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.14, delay: 0.5 });
      gsap.from("[data-hero-img]", { x: 70, opacity: 0, duration: 1.1, ease: "power3.out", delay: 0.55 });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const kids = el.querySelectorAll<HTMLElement>("[data-reveal-item]");
        const targets = kids.length ? kids : [el];
        gsap.from(targets, {
          y: 42,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: kids.length ? 0.08 : 0,
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
        });
      });

      if (galleryTrackRef.current && gallerySectionRef.current) {
        const totalWidth = galleryTrackRef.current.scrollWidth - window.innerWidth;
        gsap.to(galleryTrackRef.current, {
          x: -totalWidth,
          ease: "none",
          scrollTrigger: {
            trigger: gallerySectionRef.current,
            start: "top top",
            end: () => `+=${totalWidth}`,
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
              setGalleryActive(Math.min(EXPERIENCE_SLIDES.length - 1, Math.floor(self.progress * EXPERIENCE_SLIDES.length)));
            },
          },
        });
      }
    }, root);
    return () => ctx.revert();
  }, [grid.length, categories.length]);

  function handleSpotlightMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }

  return (
    <div ref={root} className="noise-overlay">
      {/* ===== HERO ===== */}
      <section
        className="relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse 80% 60% at 55% 40%, rgba(255,215,0,0.07), transparent 68%)" }}
      >
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 grid lg:grid-cols-2 gap-12 items-center py-16 md:py-28">
          <div className="relative z-10">
            <span data-hero className="inline-flex items-center gap-2 bg-gold/10 text-gold border border-gold/30 text-xs font-semibold tracking-wider uppercase rounded-full px-4 py-2 mb-8">
              <Zap size={14} /> Nouvelle Collection 2026
            </span>
            <h1 ref={headlineRef} className="font-head font-extrabold text-4xl sm:text-5xl md:text-7xl leading-[1.03]">
              <span className="word inline-block mr-[0.25em]">L'Ingénierie</span>{" "}
              <span className="word inline-block mr-[0.25em]">du</span>
              <br />
              <span className="word inline-block text-gradient">Confort Moderne</span>
            </h1>
            <p data-hero className="mt-6 text-cloud-muted text-lg max-w-[520px] leading-relaxed">
              Découvrez une sélection exclusive d'appareils haut de gamme alliant performance
              technologique et design minimaliste pour votre foyer.
            </p>
            <div data-hero className="mt-9 flex items-center gap-4 flex-wrap">
              <Link to="/c/refrigerateur" className="inline-flex items-center px-8 py-3.5 bg-gold text-navy font-semibold text-sm rounded-full hover:bg-gold-bright hover:scale-[1.03] transition-all shadow-lg shadow-gold/10">
                Explorer la Collection
              </Link>
              <button className="inline-flex items-center gap-2 px-6 py-3.5 border border-cloud/25 text-cloud font-semibold text-sm rounded-full hover:border-gold hover:text-gold transition-all">
                <Play size={16} /> Voir la vidéo
              </button>
            </div>
            <div data-hero className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-12 pt-8 border-t border-edge">
              <div><p className="text-xl font-bold text-cloud">48 mois</p><p className="text-xs text-cloud-muted mt-1">Garantie produit</p></div>
              <div><p className="text-xl font-bold text-cloud">58 wilayas</p><p className="text-xs text-cloud-muted mt-1">Livraison rapide</p></div>
              <div><p className="text-xl font-bold text-cloud">4,1 ★</p><p className="text-xs text-cloud-muted mt-1">Avis Google</p></div>
            </div>
          </div>

          <div data-hero-img className="relative flex items-center justify-center min-h-[360px]">
            <div className="absolute w-80 h-80 md:w-[26rem] md:h-[26rem] rounded-full bg-gold/10 blur-[90px] animate-pulse-glow" />
            <img src="/img/fridge.png" alt="Réfrigérateur premium" className="relative h-[380px] md:h-[480px] object-contain drop-shadow-2xl animate-float" />
          </div>
        </div>

        <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] tracking-[0.2em] uppercase text-cloud-muted">Scroll</span>
          <ArrowDown size={16} className="text-cloud-muted animate-bounce" />
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section data-reveal className="max-w-[1280px] mx-auto px-5 md:px-10 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} data-reveal-item className="bg-navy-card border border-edge rounded-2xl p-6 card-lift">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-4">
                <f.icon size={22} />
              </div>
              <h3 className="font-semibold text-cloud mb-1.5">{f.title}</h3>
              <p className="text-sm text-cloud-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section data-reveal className="max-w-[1280px] mx-auto px-5 md:px-10 mt-20">
        <div className="mb-10">
          <h2 className="font-head font-extrabold text-3xl md:text-5xl">
            Découvrez nos <span className="text-gradient">Catégories</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {BENTO.map((b) => (
            <Link
              key={b.slug}
              data-reveal-item
              to={`/c/${b.slug}`}
              onMouseMove={handleSpotlightMove}
              className={`spotlight-card group relative bg-navy-card border border-edge rounded-2xl overflow-hidden h-60 hover:border-gold card-lift ${b.span}`}
            >
              {catImg(b.slug) && (
                <img src={catImg(b.slug)} alt="" className="absolute inset-0 w-full h-full object-contain p-6 opacity-90 group-hover:scale-105 transition-transform duration-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/20 to-transparent" />
              <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                <h3 className="font-bold text-xl text-cloud group-hover:text-gold transition-colors drop-shadow">
                  {catName(b.slug)}
                </h3>
                <div className="inline-flex w-10 h-10 rounded-full bg-gold/10 border border-gold/30 items-center justify-center text-gold group-hover:bg-gold group-hover:text-navy transition-all">
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== PROMOTIONS ===== */}
      <section data-reveal className="max-w-[1280px] mx-auto px-5 md:px-10 mt-20">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-head font-extrabold text-3xl md:text-5xl">
            Découvrez nos <span className="text-gradient">Promotions</span>
          </h2>
          <Link to="/c/machine-a-cafe" className="hidden md:inline-flex text-sm text-gold hover:text-gold-bright items-center gap-2 font-semibold transition-colors">
            Voir tout <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {grid.map((p) => (
            <div key={p.id} data-reveal-item>
              <ProductCard product={p} offers={offers} />
            </div>
          ))}
        </div>
      </section>

      {/* ===== PROMO BANNER ===== */}
      <section data-reveal className="max-w-[1280px] mx-auto px-5 md:px-10 mt-20">
        <Link to="/c/cuisiniere" className="block rounded-2xl overflow-hidden border border-edge hover:border-gold card-lift">
          <img src={BANNER_FOURS} alt="Équipez votre cuisine" className="w-full object-cover" />
        </Link>
      </section>

      {/* ===== EXPERIENCE GALLERY (horizontal pinned scroll) ===== */}
      <section ref={gallerySectionRef} className="relative h-screen overflow-hidden bg-ez-bg mt-20">
        <div className="absolute top-8 left-4 md:left-12 z-20">
          <p className="text-xs font-medium text-ez-text-muted tracking-wider uppercase mb-1">Experience</p>
          <h2 className="text-2xl font-bold text-ez-text">Galerie <span className="text-ez-accent">Lifestyle</span></h2>
        </div>
        <div
          ref={galleryTrackRef}
          className="flex items-center h-full gap-8 px-4 md:px-12 pt-20"
          style={{ width: "fit-content" }}
        >
          {EXPERIENCE_SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`relative flex-shrink-0 h-[70vh] rounded-2xl overflow-hidden transition-all duration-500 ${
                i === galleryActive ? "w-[80vw] md:w-[60vw] opacity-100" : "w-[70vw] md:w-[50vw] opacity-60"
              }`}
            >
              <img src={slide.image} alt={slide.caption} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ez-bg/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-lg font-semibold text-ez-text">{slide.caption}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {EXPERIENCE_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setGalleryActive(i)}
              className={`transition-all duration-300 rounded-full ${
                i === galleryActive ? "w-8 h-3 bg-ez-accent" : "w-3 h-3 bg-ez-text/30 hover:bg-ez-text/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ===== POPULAR BRANDS ===== */}
      <section data-reveal className="mt-20 max-w-[1280px] mx-auto px-5 md:px-10">
        <div className="mb-10">
          <h2 className="font-head font-extrabold text-3xl md:text-5xl">
            Nos <span className="text-gradient">marques</span> populaires
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {BRANDS.map((b) => (
            <div key={b} data-reveal-item className="bg-navy-card border border-edge hover:border-gold rounded-2xl p-6 flex items-center justify-center card-lift group">
              <BrandLogo name={b} className="scale-95 group-hover:scale-100 transition-transform duration-300" />
            </div>
          ))}
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section data-reveal className="max-w-[1280px] mx-auto px-5 md:px-10 my-20">
        <div className="relative rounded-3xl border border-gold/25 bg-navy-card overflow-hidden p-10 md:p-16 text-center">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.08), transparent 60%)" }} />
          <div className="relative z-10 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-6">
              <Mail size={24} />
            </div>
            <h2 className="font-head font-extrabold text-3xl md:text-4xl">Restez informé de nos <span className="text-gradient">offres</span></h2>
            <p className="text-cloud-muted mt-3">Recevez nos nouveautés et promotions directement par email.</p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" required placeholder="Votre adresse email" className="input flex-1 rounded-full !py-3 !px-5" />
              <button type="submit" className="px-7 py-3 rounded-full bg-gold text-navy font-semibold text-sm hover:bg-gold-bright hover:scale-[1.02] transition-all whitespace-nowrap">
                S'abonner
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}