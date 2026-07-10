import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon, Sparkles } from "lucide-react";
import { api } from "../../lib/api-client";
import { useOffers } from "../../data/store";
import ProductCard from "../../components/ProductCard";
import type { SearchResult, SearchResponse } from "@electrozone/shared";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const offers = useOffers();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .search(term)
      .then((data: SearchResponse) => {
        if (cancelled) return;
        setResults(data.results);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Erreur de recherche");
        setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = String(form.get("q") ?? "").trim();
    if (!value) return;
    setParams({ q: value });
  }

  return (
    <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-10">
      <nav className="font-mono text-xs text-cloud-muted mb-6">
        <Link to="/" className="hover:text-gold">ACCUEIL</Link>
        <span className="mx-2">/</span>
        <span className="text-gold uppercase">Recherche</span>
      </nav>

      <form onSubmit={submit} className="relative max-w-2xl mb-8">
        <input
          name="q"
          defaultValue={q}
          autoFocus
          placeholder="Décrivez ce que vous cherchez en langage naturel..."
          className="w-full bg-navy-tile border border-edge rounded py-3 pl-4 pr-14 text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition"
        />
        <button type="submit" className="absolute right-0 top-0 h-full px-4 bg-gold text-navy rounded-r hover:bg-gold-bright transition-colors">
          <SearchIcon size={18} />
        </button>
      </form>

      {q && (
        <div className="flex items-end justify-between mb-8 border-b border-edge pb-4">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-gold" />
            <h1 className="font-head font-bold text-2xl md:text-3xl">
              Résultats pour <span className="text-gold">"{q}"</span>
            </h1>
          </div>
          {!loading && !error && (
            <span className="font-mono text-xs text-cloud-muted">{results.length} PRODUIT(S)</span>
          )}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-navy-card border border-edge rounded-xl p-4 animate-pulse">
              <div className="aspect-square bg-navy-tile rounded-lg mb-5" />
              <div className="h-3 bg-navy-tile rounded w-1/3 mb-2" />
              <div className="h-4 bg-navy-tile rounded w-3/4 mb-4" />
              <div className="h-8 bg-navy-tile rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-navy-card border border-edge rounded-xl p-16 text-center text-cloud-muted">
          <p className="mb-2">Une erreur est survenue lors de la recherche.</p>
          <p className="font-mono text-xs text-red-300">{error}</p>
        </div>
      )}

      {!loading && !error && q && results.length === 0 && (
        <div className="bg-navy-card border border-edge rounded-xl p-16 text-center text-cloud-muted">
          <p className="mb-2">Aucun produit ne correspond à votre recherche.</p>
          <p className="text-sm">Essayez une description différente, ou demandez à notre assistant en bas à droite.</p>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((r) => (
            <div key={r.product.id} className="flex flex-col">
              <ProductCard product={r.product} offers={offers} />
              <div className="mt-2 flex items-start gap-2 bg-gold/5 border border-gold/20 rounded-lg px-3 py-2">
                <Sparkles size={14} className="text-gold shrink-0 mt-0.5" />
                <p className="font-mono text-[11px] text-gold/90 leading-snug">{r.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!q && !loading && (
        <div className="bg-navy-card border border-edge rounded-xl p-16 text-center text-cloud-muted">
          <SearchIcon size={32} className="mx-auto mb-4 text-cloud/40" />
          <p>Décrivez ce que vous cherchez dans la barre ci-dessus.</p>
          <p className="text-sm mt-2">Exemples : « machine pour faire du cappuccino », « frigo grand volume », « aspirateur pour tapis sous 70000 DA »</p>
        </div>
      )}
    </div>
  );
}