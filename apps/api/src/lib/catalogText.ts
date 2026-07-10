import type { Product, Bundle, Offer } from "@electrozone/shared";

function formatDA(amount: number): string {
  return new Intl.NumberFormat("fr-DZ").format(Math.round(amount)) + " DA";
}

function isLive(o: Offer): boolean {
  if (!o.isActive) return false;
  const now = new Date().toISOString().slice(0, 10);
  return o.startsAt <= now && o.endsAt >= now;
}

export function priceProduct(product: Product, offers: Offer[]) {
  const matching = offers.filter((o) => {
    if (!isLive(o)) return false;
    if (o.scope === "sitewide") return true;
    if (o.scope === "product") return o.targetId === product.id;
    if (o.scope === "category") return o.targetId === product.categorySlug;
    return false;
  });
  let best = { finalPrice: product.price, originalPrice: product.price, discountPct: 0 };
  for (const o of matching) {
    const final =
      o.type === "percentage"
        ? product.price * (1 - o.value / 100)
        : Math.max(0, product.price - o.value);
    if (final < best.finalPrice) {
      best = {
        finalPrice: Math.round(final),
        originalPrice: product.price,
        discountPct: Math.round((1 - final / product.price) * 100),
      };
    }
  }
  return best;
}

function bundleFinalPrice(bundle: Bundle, products: Product[]): number {
  const total = bundle.items.reduce((sum, it) => {
    const p = products.find((x) => x.id === it.productId);
    return sum + (p ? p.price * it.quantity : 0);
  }, 0);
  return bundle.bundlePrice ?? total;
}

export function buildCatalogText(products: Product[], bundles: Bundle[], offers: Offer[]): string {
  const lines: string[] = [];
  lines.push("PRODUITS:");
  for (const p of products.filter((x) => x.isActive)) {
    const pr = priceProduct(p, offers);
    const price =
      pr.discountPct > 0
        ? `${formatDA(pr.finalPrice)} (au lieu de ${formatDA(pr.originalPrice)}, -${pr.discountPct}%)`
        : formatDA(p.price);
    const specs = Object.entries(p.specs)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    lines.push(
      `- id:${p.id} | ${p.name} | marque ${p.brand} | catégorie ${p.categorySlug} | prix ${price} | stock ${p.stock} | ${specs} | ${p.description}`,
    );
  }
  lines.push("\nPACKS:");
  for (const b of bundles.filter((x) => x.isActive)) {
    lines.push(`- ${b.name} | prix ${formatDA(bundleFinalPrice(b, products))} | ${b.description}`);
  }
  return lines.join("\n");
}