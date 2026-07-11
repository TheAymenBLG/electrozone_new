import { useState, type ReactNode } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useProducts, useCategories, saveProduct, deleteProduct } from "../../data/store";
import type { Product } from "@electrozone/shared";
import { formatDA } from "../../lib/format";

const empty = (categorySlug: string): Omit<Product, "id"> => ({
  name: "",
  brand: "",
  categorySlug,
  price: 0,
  stock: 0,
  description: "",
  imageUrl: "/img/logo.png",
  specs: {},
  isActive: true,
});

export default function AdminProducts() {
  const products = useProducts();
  const categories = useCategories();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<(Omit<Product, "id"> & { id?: string }) | null>(null);

  const filtered = products.filter((p) =>
    (p.name + p.brand).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-head text-3xl font-bold text-gradient">Produits</h1>
        <button
          onClick={() => categories[0] && setEditing(empty(categories[0].slug))}
          className="flex items-center gap-1.5 bg-gold text-navy px-4 py-2 rounded-lg text-sm font-bold hover:bg-gold-bright transition-colors"
        >
          <Plus size={18} /> Ajouter un produit
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un produit…"
        className="w-full max-w-sm bg-navy-tile border border-edge rounded-lg px-3 py-2 mb-4 text-sm text-cloud placeholder-cloud/40 focus:outline-none focus:border-gold"
      />

      <div className="bg-navy-card border border-edge rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-navy-tile text-left text-cloud-muted">
            <tr>
              <th className="p-3 font-mono text-xs uppercase tracking-wider">Produit</th>
              <th className="p-3 font-mono text-xs uppercase tracking-wider">Catégorie</th>
              <th className="p-3 font-mono text-xs uppercase tracking-wider">Prix</th>
              <th className="p-3 font-mono text-xs uppercase tracking-wider">Stock</th>
              <th className="p-3 font-mono text-xs uppercase tracking-wider">Statut</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="p-3">
                  <div className="font-medium text-cloud">{p.name}</div>
                  <div className="text-xs text-cloud-muted">{p.brand}</div>
                </td>
                <td className="p-3 text-cloud-muted">{p.categorySlug}</td>
                <td className="p-3 font-mono font-semibold text-gold">{formatDA(p.price)}</td>
                <td className="p-3">
                  <span className={p.stock <= 4 ? "text-red-400 font-semibold" : "text-cloud"}>{p.stock}</span>
                </td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      p.isActive ? "bg-green-500/15 text-green-300" : "bg-white/10 text-cloud-muted"
                    }`}
                  >
                    {p.isActive ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(p)} className="text-gold hover:text-gold-bright mr-3">
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => confirm(`Supprimer ${p.name} ?`) && deleteProduct(p.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductDialog
          value={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSave={async (p) => {
            try {
              await saveProduct(p);
              setEditing(null);
            } catch {
              alert("Erreur lors de l'enregistrement.");
            }
          }}
        />
      )}
    </div>
  );
}

function ProductDialog({
  value,
  categories,
  onClose,
  onSave,
}: {
  value: Omit<Product, "id"> & { id?: string };
  categories: { slug: string; name: string }[];
  onClose: () => void;
  onSave: (p: Omit<Product, "id"> & { id?: string }) => void;
}) {
  const [form, setForm] = useState(value);
  const [specs, setSpecs] = useState<[string, string][]>(Object.entries(value.specs));

  const set = (k: keyof Product, v: any) => setForm((f) => ({ ...f, [k]: v }));

  function submit() {
    if (!form.name.trim()) return alert("Le nom est requis");
    const specObj = Object.fromEntries(specs.filter(([k]) => k.trim()));
    onSave({ ...form, specs: specObj });
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-navy-card border border-edge rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-cloud">
        <div className="flex items-center justify-between p-4 border-b border-edge sticky top-0 bg-navy-card">
          <h2 className="font-head font-bold text-lg text-cloud">{value.id ? "Modifier" : "Ajouter"} un produit</h2>
          <button onClick={onClose} className="text-cloud-muted hover:text-gold">
            <X />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <Field label="Nom">
            <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Marque">
              <input className="input" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
            </Field>
            <Field label="Catégorie">
              <select
                className="input"
                value={form.categorySlug}
                onChange={(e) => set("categorySlug", e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prix (DA)">
              <input
                type="number"
                className="input"
                value={form.price}
                onChange={(e) => set("price", Number(e.target.value))}
              />
            </Field>
            <Field label="Stock">
              <input
                type="number"
                className="input"
                value={form.stock}
                onChange={(e) => set("stock", Number(e.target.value))}
              />
            </Field>
          </div>
          <Field label="Image (URL)">
            <input className="input" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea
              className="input"
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>

          <div>
            <label className="text-sm font-medium text-cloud-muted">Caractéristiques</label>
            <div className="space-y-2 mt-1">
              {specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input"
                    placeholder="clé (ex: capacité)"
                    value={s[0]}
                    onChange={(e) =>
                      setSpecs((arr) => arr.map((x, j) => (j === i ? [e.target.value, x[1]] : x)))
                    }
                  />
                  <input
                    className="input"
                    placeholder="valeur (ex: 470L)"
                    value={s[1]}
                    onChange={(e) =>
                      setSpecs((arr) => arr.map((x, j) => (j === i ? [x[0], e.target.value] : x)))
                    }
                  />
                  <button
                    onClick={() => setSpecs((arr) => arr.filter((_, j) => j !== i))}
                    className="text-red-400 px-2"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setSpecs((arr) => [...arr, ["", ""]])}
                className="text-sm text-gold hover:text-gold-bright"
              >
                + Ajouter une caractéristique
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-cloud">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
            />
            Produit actif (visible en boutique)
          </label>
        </div>
        <div className="p-4 border-t border-edge flex justify-end gap-2 sticky bottom-0 bg-navy-card">
          <button onClick={onClose} className="px-4 py-2 text-sm text-cloud-muted hover:text-cloud">
            Annuler
          </button>
          <button onClick={submit} className="bg-gold text-navy px-4 py-2 rounded-lg text-sm font-bold hover:bg-gold-bright transition-colors">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-cloud-muted">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
