import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product, Bundle } from "@electrozone/shared";
import { askAssistant, type ChatMessage } from "../lib/gemini";
import { useProducts, useBundles, useOffers, useCategories } from "../data/store";
import { priceProduct, bundleFinalPrice } from "../lib/offers";
import { formatDA } from "../lib/format";

/* message model: text / quick-reply chips / product recs / bundle list */
type Chip = { label: string; val: string };
type Msg =
  | { id: number; role: "user" | "assistant"; kind: "text"; content: string }
  | { id: number; role: "assistant"; kind: "chips"; chips: Chip[] }
  | { id: number; role: "assistant"; kind: "recs"; products: Product[] }
  | { id: number; role: "assistant"; kind: "bundles"; bundles: Bundle[] };

const GREETING =
  "Bonjour 👋 Je suis le conseiller ElectroZone. Je peux vous guider par budget, par marque ou par catégorie — ou répondez-moi librement.";

const CAT_ICON: Record<string, string> = {
  refrigerateur: "🧊", congelateur: "❄️", "machine-a-laver": "🧺", "lave-vaisselle": "🍽️",
  cuisiniere: "🍳", "micro-onde": "📟", "machine-a-cafe": "☕", tv: "📺",
  aspirateur: "🧹", climatiseur: "🌬️",
};

let SEQ = 0;
const nextId = () => ++SEQ;

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const products = useProducts().filter((p) => p.isActive);
  const bundles = useBundles().filter((b) => b.isActive);
  const offers = useOffers();
  const categories = useCategories();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const pushBot = (content: string) =>
    setMessages((m) => [...m, { id: nextId(), role: "assistant", kind: "text", content }]);
  const pushUser = (content: string) =>
    setMessages((m) => [...m, { id: nextId(), role: "user", kind: "text", content }]);
  const pushChips = (chips: Chip[]) =>
    setMessages((m) => [...m, { id: nextId(), role: "assistant", kind: "chips", chips }]);
  const pushRecs = (list: Product[]) =>
    setMessages((m) => [...m, { id: nextId(), role: "assistant", kind: "recs", products: list.slice(0, 3) }]);

  const startChips = (): Chip[] => {
    const chips: Chip[] = [
      { label: "💰 Par budget", val: "budget" },
      { label: "🏷️ Par marque", val: "brand" },
      { label: "📦 Par catégorie", val: "cat" },
    ];
    if (bundles.length) chips.push({ label: "🎁 Voir les packs", val: "bundle" });
    return chips;
  };

  function begin() {
    SEQ = 0;
    const first: Msg[] = [{ id: nextId(), role: "assistant", kind: "text", content: GREETING }];
    if (products.length) first.push({ id: nextId(), role: "assistant", kind: "chips", chips: startChips() });
    else first.push({ id: nextId(), role: "assistant", kind: "text", content: "Le catalogue est en cours de chargement…" });
    setMessages(first);
  }

  function openPanel() {
    setOpen(true);
    if (messages.length === 0) begin();
  }

  const priceOf = (p: Product) => priceProduct(p, offers).finalPrice;

  /* guided quick-reply logic (ported from shop-ai-widget.js) */
  function handleChip(val: string, label: string) {
    pushUser(label);
    const brands = Array.from(new Set(products.map((p) => p.brand)));

    if (val === "budget") {
      const max = Math.max(...products.map(priceOf), 100000);
      const step = Math.max(1000, Math.round(max / 4 / 1000) * 1000);
      pushBot("Quel est votre budget approximatif ?");
      pushChips([
        { label: `Moins de ${formatDA(step)}`, val: `bud_0_${step}` },
        { label: `${formatDA(step)} – ${formatDA(step * 2)}`, val: `bud_${step}_${step * 2}` },
        { label: `${formatDA(step * 2)} – ${formatDA(step * 3)}`, val: `bud_${step * 2}_${step * 3}` },
        { label: `Plus de ${formatDA(step * 3)}`, val: `bud_${step * 3}_999999999` },
      ]);
    } else if (val === "brand") {
      pushBot("Quelle marque préférez-vous ?");
      pushChips(brands.map((b) => ({ label: b, val: `br_${b}` })));
    } else if (val === "cat") {
      pushBot("Quelle catégorie recherchez-vous ?");
      const cats = Array.from(new Set(products.map((p) => p.categorySlug)));
      pushChips(
        cats.map((slug) => {
          const name = categories.find((c) => c.slug === slug)?.name ?? slug;
          return { label: `${CAT_ICON[slug] ?? "📦"} ${name}`, val: `cat_${slug}` };
        }),
      );
    } else if (val === "bundle") {
      setMessages((m) => [...m, { id: nextId(), role: "assistant", kind: "bundles", bundles }]);
      pushChips([{ label: "🔁 Recommencer", val: "start" }]);
    } else if (val === "start") {
      pushBot("Très bien, reprenons. Sur quoi voulez-vous filtrer ?");
      pushChips(startChips());
    } else if (val.startsWith("bud_")) {
      const parts = val.split("_");
      const lo = Number(parts[1]);
      const hi = Number(parts[2]);
      const list = products
        .map((p) => ({ p, price: priceOf(p) }))
        .filter((x) => x.price >= lo && x.price <= hi)
        .sort((a, b) => a.price - b.price)
        .map((x) => x.p);
      const hiLabel = hi === 999999999 ? formatDA(Math.max(...products.map(priceOf))) : formatDA(hi);
      recommend(list, `Voici des produits jusqu'à ${hiLabel} :`);
    } else if (val.startsWith("br_")) {
      const b = val.slice(3);
      recommend(products.filter((p) => p.brand === b), `Voici notre sélection ${b} :`);
    } else if (val.startsWith("cat_")) {
      const slug = val.slice(4);
      const name = categories.find((c) => c.slug === slug)?.name ?? slug;
      recommend(products.filter((p) => p.categorySlug === slug), `Voici nos ${name} :`);
    }
  }

  function recommend(list: Product[], intro: string) {
    if (list.length === 0) {
      pushBot("Je n'ai pas trouvé de correspondance exacte. Souhaitez-vous élargir votre recherche ?");
    } else {
      pushBot(intro);
      pushRecs(list);
    }
    setTimeout(() => {
      pushBot("Souhaitez-vous affiner ?");
      pushChips([
        { label: "💰 Budget", val: "budget" },
        { label: "🏷️ Marque", val: "brand" },
        { label: "🔁 Recommencer", val: "start" },
      ]);
    }, 250);
  }

  /* free-text goes to the AI backend */
  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    pushUser(text);
    const history: ChatMessage[] = messages
      .filter((m): m is Extract<Msg, { kind: "text" }> => m.kind === "text")
      .map((m) => ({ role: m.role, content: m.content }));
    setLoading(true);
    try {
      const reply = await askAssistant(history, text);
      pushBot(reply);
    } catch {
      pushBot("Désolé, une erreur est survenue. Réessayez ou utilisez les suggestions ci-dessus.");
    }
    setLoading(false);
  }

  return (
    <>
      <button onClick={() => (open ? setOpen(false) : openPanel())} className="fixed bottom-5 right-5 z-50 bg-gold text-navy rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-gold-bright transition-colors" aria-label="Assistant">
        {open ? <X /> : <MessageCircle />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[92vw] max-w-sm h-[72vh] max-h-[560px] bg-navy-card rounded-xl shadow-2xl flex flex-col overflow-hidden border border-edge">
          <div className="bg-navy-deep border-b border-edge px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold text-navy flex items-center justify-center text-lg shrink-0">🤖</div>
            <div className="flex-1">
              <p className="font-head font-bold text-cloud leading-none">Conseiller ElectroZone</p>
              <p className="font-mono text-[11px] text-green-400 mt-1 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />En ligne</p>
            </div>
            <button onClick={begin} title="Recommencer" className="text-cloud-muted hover:text-gold"><RotateCcw size={16} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m) => {
              if (m.kind === "text")
                return (
                  <div key={m.id} className={`max-w-[86%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${m.role === "user" ? "ml-auto bg-gold text-navy font-medium" : "bg-navy-tile border border-edge text-cloud"}`}>
                    {m.content}
                  </div>
                );
              if (m.kind === "chips")
                return (
                  <div key={m.id} className="flex flex-wrap gap-2">
                    {m.chips.map((c) => (
                      <button key={c.val} onClick={() => handleChip(c.val, c.label)} className="bg-navy-tile border border-gold/40 text-gold font-medium text-xs px-3 py-1.5 rounded-full hover:bg-gold hover:text-navy transition-colors">
                        {c.label}
                      </button>
                    ))}
                  </div>
                );
              if (m.kind === "recs")
                return (
                  <div key={m.id} className="space-y-2">
                    {m.products.map((p) => {
                      const pr = priceProduct(p, offers);
                      return (
                        <Link key={p.id} to={`/p/${p.id}`} onClick={() => setOpen(false)} className="flex gap-3 bg-navy-tile border border-edge rounded-xl p-2.5 hover:border-gold transition-colors">
                          <div className="w-12 h-12 rounded-lg bg-navy-deep flex items-center justify-center overflow-hidden shrink-0">
                            {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-contain" /> : <span className="text-lg">{CAT_ICON[p.categorySlug] ?? "🛒"}</span>}
                          </div>
                          <div className="min-w-0">
                            <b className="block text-cloud text-[13px] leading-tight line-clamp-1">{p.name}</b>
                            <span className="text-cloud-muted text-[11px]">{p.brand}</span>
                            <span className="block text-gold font-bold text-[13px] mt-0.5">
                              {formatDA(pr.finalPrice)}
                              {pr.discountPct > 0 && <span className="text-cloud-muted line-through font-normal ml-2 text-[11px]">{formatDA(pr.originalPrice)}</span>}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                );
              return (
                <div key={m.id} className="space-y-2">
                  <div className="bg-navy-tile border border-edge rounded-lg px-3 py-2 text-sm text-cloud">Nos packs du moment :</div>
                  {m.bundles.map((b) => (
                    <div key={b.id} className="bg-navy-tile border border-edge rounded-xl p-3">
                      <b className="text-cloud text-[13px]">🎁 {b.name}</b>
                      <span className="block text-gold font-bold text-sm mt-1">{formatDA(bundleFinalPrice(b, products))}</span>
                    </div>
                  ))}
                </div>
              );
            })}
            {loading && <div className="bg-navy-tile border border-edge text-cloud-muted text-sm rounded-lg px-3 py-2 w-16">…</div>}
            <div ref={endRef} />
          </div>

          <div className="p-2 border-t border-edge flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ex: frigo pour 130000 DA" className="flex-1 bg-navy-tile border border-edge rounded-lg px-3 py-2 text-sm text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold" />
            <button onClick={send} disabled={loading} className="bg-gold text-navy rounded-lg px-3 disabled:opacity-50"><Send size={18} /></button>
          </div>
        </div>
      )}
    </>
  );
}
