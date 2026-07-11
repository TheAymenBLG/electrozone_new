import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard, PieChart, Package, BadgePercent, Boxes,
  ShoppingBag, Users, LogOut, Store, RotateCcw, Lock,
} from "lucide-react";
import { resetStore } from "../../data/store";
import { api } from "../../lib/api-client";

const TOKEN_KEY = "electrozone_admin_token";

const ROUTES = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/admin/analytics", label: "Analytiques", icon: PieChart, end: false },
  { to: "/admin/products", label: "Produits", icon: Package, end: false },
  { to: "/admin/bundles", label: "Packs", icon: Boxes, end: false },
  { to: "/admin/offers", label: "Offres & Promos", icon: BadgePercent, end: false },
  { to: "/admin/orders", label: "Commandes", icon: ShoppingBag, end: false },
  { to: "/admin/customers", label: "Clients", icon: Users, end: false },
];

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { token } = await api.login(password.trim());
      localStorage.setItem(TOKEN_KEY, token);
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/invalid credentials/i.test(msg)) setError("Mot de passe incorrect.");
      else setError(`Connexion impossible : ${msg}. Le serveur API (port 4000) tourne-t-il ?`);
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy text-cloud font-sans px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-navy-card border border-edge rounded-2xl p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gold text-navy flex items-center justify-center"><Lock size={20} /></div>
          <div>
            <p className="font-head font-bold text-lg text-cloud leading-none">Espace Admin</p>
            <p className="font-mono text-[11px] text-cloud-muted mt-1">ElectroZone</p>
          </div>
        </div>
        <div>
          <label className="block text-sm text-cloud-muted mb-1">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            placeholder="••••••"
            className="w-full bg-navy-tile border border-edge rounded-lg px-3 py-2 text-cloud placeholder-cloud/30 focus:outline-none focus:border-gold"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={busy} className="w-full bg-gold text-navy font-bold rounded-lg py-2.5 hover:bg-gold-bright transition-colors disabled:opacity-50">
          {busy ? "Connexion…" : "Se connecter"}
        </button>
        <Link to="/" className="block text-center text-xs text-cloud-muted hover:text-gold">← Retour à la boutique</Link>
      </form>
    </div>
  );
}

export default function AdminLayout() {
  const [authed, setAuthed] = useState(() => !!localStorage.getItem(TOKEN_KEY));

  if (!authed) return <LoginScreen onSuccess={() => setAuthed(true)} />;

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setAuthed(false);
  }

  return (
    <div className="min-h-screen flex bg-navy text-cloud font-sans">
      <aside className="w-64 bg-navy-deep border-r border-edge flex flex-col shrink-0">
        <Link to="/admin" className="px-6 py-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-navy font-extrabold">E</div>
          <div>
            <p className="font-head font-bold leading-none text-cloud">Electrozone</p>
            <p className="font-mono text-[10px] text-cloud-muted tracking-widest mt-1">ADMIN PANEL</p>
          </div>
        </Link>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-6">
          {ROUTES.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${isActive ? "bg-gold text-navy font-semibold" : "text-cloud-muted hover:bg-white/5 hover:text-cloud"}`}>
              <l.icon size={18} /> <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-edge">
          <div className="bg-navy-card border border-edge rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold text-navy flex items-center justify-center font-bold text-sm">AD</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-cloud truncate">Admin DZ</p>
              <p className="text-[11px] text-cloud-muted truncate">Chef de projet</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <button onClick={() => confirm("Recharger les données ?") && resetStore()} className="flex items-center gap-1.5 px-2 py-2 text-xs text-cloud-muted hover:text-gold">
              <RotateCcw size={13} /> Recharger
            </button>
            <Link to="/" className="flex items-center gap-1.5 px-2 py-2 text-xs text-cloud-muted hover:text-gold">
              <Store size={13} /> Boutique
            </Link>
            <button onClick={logout} className="flex items-center gap-1.5 px-2 py-2 text-xs text-cloud-muted hover:text-gold">
              <LogOut size={13} /> Quitter
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8"><Outlet /></main>
    </div>
  );
}
