import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search, Heart, User, ShoppingCart, PackageSearch, Sun, Moon } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useCategories } from "../data/store";
import { LOGO_URL } from "../data/brand";

export default function Navbar() {
  const { count } = useCart();
  const categories = useCategories();
  const { theme, toggleTheme } = useTheme();
  const [q, setQ] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [showTrack, setShowTrack] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function search() {
    const term = q.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
  }

  function trackOrder() {
    const id = trackingId.trim();
    if (!id) return;
    navigate(`/order/${id}`);
    setShowTrack(false);
    setTrackingId("");
  }

  return (
    <header className={`sticky top-0 z-50 border-b border-edge transition-all duration-300 ${scrolled ? "glass" : "bg-navy/80 backdrop-blur-xl"}`}>
      <div className="max-w-[1440px] mx-auto px-5 md:px-10">
        <div className="flex items-center gap-4 md:gap-6 h-16 md:h-20">
          <Link to="/" className="shrink-0">
            <div className="bg-chip rounded-lg p-1 flex items-center justify-center">
              <img src={LOGO_URL} alt="ElectroZone" className="h-7 md:h-8 object-contain" />
            </div>
          </Link>

          <div className="flex-1 max-w-xl mx-2 hidden lg:block">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="Décrivez ce que vous cherchez..."
                className="w-full bg-navy-tile border border-edge rounded py-2 pl-4 pr-12 text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition"
              />
              <button onClick={search} className="absolute right-0 top-0 h-full px-4 bg-gold text-navy rounded-r hover:bg-gold-bright transition-colors">
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 ml-auto">
            <Link
              to="/search"
              className="lg:hidden p-2 rounded-full text-cloud/80 hover:text-gold hover:bg-cloud/5 transition"
              title="Rechercher"
            >
              <Search size={20} />
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-cloud/80 hover:text-gold hover:bg-cloud/5 transition"
              title={theme === "dark" ? "Mode clair" : "Mode sombre"}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="hidden sm:block p-2 rounded-full text-cloud/80 hover:text-gold hover:bg-cloud/5 transition"><Heart size={20} /></button>
            <Link to="/admin" className="p-2 rounded-full text-cloud/80 hover:text-gold hover:bg-cloud/5 transition"><User size={20} /></Link>
            <div className="relative">
              <button
                onClick={() => setShowTrack((s) => !s)}
                className="p-2 rounded-full text-cloud/80 hover:text-gold hover:bg-cloud/5 transition"
                title="Suivre une commande"
              >
                <PackageSearch size={20} />
              </button>
              {showTrack && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-navy-card border border-edge rounded-xl shadow-2xl p-3 z-50">
                  <p className="font-mono text-[11px] text-cloud-muted mb-2 uppercase tracking-wider">Suivre une commande</p>
                  <div className="flex gap-2">
                    <input
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && trackOrder()}
                      placeholder="N° de commande"
                      className="flex-1 min-w-0 bg-navy-tile border border-edge rounded px-2.5 py-2 text-sm text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold"
                    />
                    <button
                      onClick={trackOrder}
                      className="bg-gold text-navy font-mono text-xs font-bold px-3 rounded hover:bg-gold-bright transition-colors shrink-0"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Link to="/cart" className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-navy-tile border border-edge text-gold hover:border-gold transition">
              <ShoppingCart size={18} />
              <span className="font-mono text-sm">{count}</span>
            </Link>
          </div>
        </div>

        <nav className="flex gap-4 overflow-x-auto pb-2 text-xs sm:text-sm text-cloud/70 scrollbar-hide">
          <Link to="/" className="text-gold whitespace-nowrap font-medium">Accueil</Link>
          {categories.map((c) => (
            <Link key={c.id} to={`/c/${c.slug}`} className="whitespace-nowrap hover:text-gold transition-colors">{c.name}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}