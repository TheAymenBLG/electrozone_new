import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard, PieChart, Package, BadgePercent, Boxes,
  ShoppingBag, Users, Settings, Store, RotateCcw, Mail, Sun, Moon, Lock, LogOut, Monitor,
} from "lucide-react";
import { resetStore } from "../../data/store";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../lib/api-client";
import { LOGO_URL } from "../../data/brand";

const ROUTES = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/admin/analytics", label: "Analytiques", icon: PieChart, end: false },
  { to: "/admin/products", label: "Produits", icon: Package, end: false },
  { to: "/admin/bundles", label: "Packs", icon: Boxes, end: false },
  { to: "/admin/offers", label: "Offres & Promos", icon: BadgePercent, end: false },
  { to: "/admin/orders", label: "Commandes", icon: ShoppingBag, end: false },
  { to: "/admin/customers", label: "Clients", icon: Users, end: false },
  { to: "/admin/retention", label: "Rétention", icon: Mail, end: false },
];

export default function AdminLayout() {
  const { theme, toggleTheme } = useTheme();
  const [authed, setAuthed] = useState(() => !!localStorage.getItem("electrozone_admin_token"));
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await api.login(password);
      localStorage.setItem("electrozone_admin_token", token);
      setAuthed(true);
      setPassword("");
    } catch {
      setError("Mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("electrozone_admin_token");
    setAuthed(false);
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy text-cloud font-sans p-4">
        <div className="bg-navy-card border border-edge rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-chip rounded-lg p-2 mb-3">
              <img src={LOGO_URL} alt="ElectroZone" className="h-8 object-contain" />
            </div>
            <h1 className="font-head font-bold text-2xl text-cloud">ElectroZone</h1>
            <p className="font-mono text-[10px] text-cloud-muted tracking-widest mt-1">ADMIN PANEL</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="Mot de passe"
                autoFocus
                className="w-full bg-navy-tile border border-edge rounded-lg pl-10 pr-4 py-3 text-sm text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full bg-gold text-navy font-mono font-bold py-3 rounded-lg hover:bg-gold-bright transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "SE CONNECTER"}
            </button>
          </form>
          <p className="font-mono text-[10px] text-cloud-muted/60 text-center mt-4">
            Démo: mot de passe par défaut « admin »
          </p>
          <Link to="/" className="block text-center text-gold underline text-sm mt-4">
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="md:hidden min-h-screen flex items-center justify-center bg-navy text-cloud font-sans p-6">
        <div className="text-center max-w-sm">
          <div className="bg-chip rounded-lg p-3 inline-block mb-5">
            <img src={LOGO_URL} alt="ElectroZone" className="h-10 object-contain" />
          </div>
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mx-auto mb-4">
            <Monitor size={28} />
          </div>
          <h2 className="font-head font-bold text-xl text-cloud mb-2">Tableau de bord desktop</h2>
          <p className="text-sm text-cloud-muted leading-relaxed mb-4">
            L'interface d'administration est optimisée pour les écrans d'ordinateur.
            Veuillez utiliser un ordinateur pour accéder au panneau de gestion.
          </p>
          <Link to="/" className="inline-block bg-gold text-navy font-mono font-bold px-6 py-3 rounded-lg hover:bg-gold-bright transition-colors text-sm">
            Retour à la boutique
          </Link>
        </div>
      </div>

      <div className="hidden md:flex min-h-screen bg-navy text-cloud font-sans">
        <aside className="w-64 bg-navy-deep border-r border-edge flex flex-col shrink-0">
          <Link to="/admin" className="px-6 py-6 flex items-center gap-3">
            <div className="bg-chip rounded-lg p-1">
              <img src={LOGO_URL} alt="ElectroZone" className="h-8 object-contain" />
            </div>
            <div>
              <p className="font-head font-bold leading-none text-cloud">Electrozone</p>
              <p className="font-mono text-[10px] text-cloud-muted tracking-widest mt-1">ADMIN PANEL</p>
            </div>
          </Link>
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-6">
            {ROUTES.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${isActive ? "bg-gold text-navy font-semibold" : "text-cloud-muted hover:bg-cloud/5 hover:text-cloud"}`}>
                <l.icon size={18} /> <span>{l.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-edge">
            <div className="bg-navy-card border border-edge rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold text-navy flex items-center justify-center font-bold text-sm">AD</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-cloud truncate">Admin DZ</p>
                <p className="text-[11px] text-cloud-muted truncate">Chef de projet</p>
              </div>
              <button onClick={logout} className="p-1.5 rounded-lg text-cloud-muted hover:text-red-400 hover:bg-cloud/5 transition-colors" title="Déconnexion">
                <LogOut size={16} />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <button onClick={() => confirm("Réinitialiser les données de démo ?") && resetStore()} className="flex items-center gap-1.5 px-2 py-2 text-xs text-cloud-muted hover:text-gold">
                <RotateCcw size={13} /> Reset
              </button>
              <Link to="/" className="flex items-center gap-1.5 px-2 py-2 text-xs text-cloud-muted hover:text-gold">
                <Store size={13} /> Boutique
              </Link>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-2 py-2 text-xs text-cloud-muted hover:text-gold"
                title={theme === "dark" ? "Mode clair" : "Mode sombre"}
              >
                {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />} {theme === "dark" ? "Clair" : "Sombre"}
              </button>
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8"><Outlet /></main>
      </div>
    </>
  );
}