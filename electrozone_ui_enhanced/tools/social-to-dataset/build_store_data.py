#!/usr/bin/env python3
"""
build_store_data.py
Converts Apify social-media scrape exports (Facebook, Instagram, TikTok, Google Maps)
into a single clean knowledge base `store_data.json` for the ElectroZone AI assistant.

Usage:
    python build_store_data.py            # reads ./input/*.json  -> ./store_data.json (+ .min.json)

The script is deterministic: no prices/specs are invented. If a price is not present
in the caption text, the product simply has no price field.
"""
import json, glob, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
IN   = os.path.join(HERE, "input")

def load(pattern):
    files = glob.glob(os.path.join(IN, pattern))
    if not files:
        return None
    return json.load(open(files[0], encoding="utf-8"))

# ---------- 1. STORE INFO (from Google Maps + Instagram bio) ----------
def build_store_info():
    gm = load("*google-map*") or []
    ig = load("*instagram*") or []
    g  = gm[0] if gm else {}
    i  = ig[0] if ig else {}

    hours = {}
    for h in (g.get("openingHours") or []):
        hours[h.get("day")] = h.get("hours")

    # phones: Google Maps main line + phone found in IG bio
    phones = []
    if g.get("phone"): phones.append(g["phone"])
    bio = i.get("biography", "") or ""
    for m in re.findall(r"0\d[\d\s]{7,}", bio):
        p = m.strip()
        if p and p not in phones: phones.append(p)

    return {
        "name": g.get("title") or "ElectroZone",
        "category": g.get("categoryName") or "Magasin d'électroménager",
        "description": "Magasin d'électroménager et multimédia — produits originaux, "
                       "prix compétitifs, paiement à la livraison.",
        "address": {
            "line": g.get("address"),
            "neighborhood": "Haricha Ammar",
            "city": g.get("city") or "Aïn Smara",
            "state": "Constantine",
            "country": "Algérie",
            "plusCode": g.get("plusCode"),
        },
        "contact": {"phones": phones},
        "socials": {
            "facebook": "https://www.facebook.com/electrozone25/",
            "instagram": f"https://www.instagram.com/{i.get('username','electrozone.constantine')}/",
            "tiktok": "https://www.tiktok.com/@electrozone.const",
            "website": g.get("website"),
        },
        "hours": hours,
        "rating": {"score": g.get("totalScore"), "reviews": g.get("reviewsCount")},
        "audience": {
            "instagram_followers": i.get("followersCount"),
            "tiktok_followers": 34300,
        },
        "policies": {
            "delivery": "Livraison dans les 58 wilayas. Paiement à la livraison (COD).",
            "warranty": "Garantie selon la marque du produit (jusqu'à 10 ans sur certains compresseurs/moteurs).",
            "originality": "Produits 100% originaux.",
        },
    }

# ---------- 2. COLLECT CAPTIONS ----------
def collect_captions():
    caps = []
    fb = load("*facebook*") or []
    for p in fb:
        if p.get("text"): caps.append({"src":"facebook","text":p["text"],"url":p.get("url"),"date":p.get("time")})
    ig = load("*instagram*") or []
    if ig:
        for p in (ig[0].get("latestPosts") or []):
            if p.get("caption"): caps.append({"src":"instagram","text":p["caption"],"url":p.get("url"),"date":p.get("timestamp")})
    tk = load("*tiktok*") or []
    for p in tk:
        if p.get("text"): caps.append({"src":"tiktok","text":p["text"],"url":p.get("webVideoUrl"),"date":p.get("createTimeISO")})
    return caps

# ---------- 3. PRODUCT EXTRACTION ----------
BRANDS = ["Cristor","Beko","LG","Hisense","Brandt","Candy","Maxwell","Condor",
          "Rosières","Rosieres","Samsung","Toshiba","Midea","Delonghi","Bosch",
          "Bomann","Bissell","Iris","Géant","Nikai","Frigor","Raylan"]

# category -> list of detection keywords (fr + ar + en)
CATS = [
    ("climatiseur",       ["climatiseur","climatis","مكيف","تكييف","split","btu"]),
    ("rafraichisseur-air",["rafraîchisseur","rafraichisseur","air cooler","مبرد","مبردات الهواء"]),
    ("refrigerateur",     ["réfrigérateur","refrigerateur","frigo","ثلاجة","no frost","mini bar","maxi bar"]),
    ("congelateur",       ["congélateur","congelateur","مجمد","freezer"]),
    ("machine-a-laver",   ["lave-linge","machine à laver","machine a laver","غسالة","séchant","laveuse","3d steam"]),
    ("lave-vaisselle",    ["lave-vaisselle","lave vaisselle","غسالة صحون","couverts","جلي"]),
    ("cuisiniere",        ["cuisinière","cuisiniere","طباخة","four","cooker"]),
    ("micro-onde",        ["micro-onde","micro onde","ميكروويف","microwave"]),
    ("machine-a-cafe",    ["machine à café","machine a cafe","cafetière","espresso","cappuccino","قهوة","آلة قهوة"]),
    ("tv",                ["téléviseur","smart tv"," tv ","4k","تلفزيون","pouces","uhd"]),
    ("aspirateur",        ["aspirateur","مكنسة","vacuum"]),
]

CAT_LABEL = {
    "climatiseur":"Climatiseur","rafraichisseur-air":"Rafraîchisseur d'air",
    "refrigerateur":"Réfrigérateur","congelateur":"Congélateur",
    "machine-a-laver":"Machine à laver","lave-vaisselle":"Lave-vaisselle",
    "cuisiniere":"Cuisinière","micro-onde":"Micro-onde","machine-a-cafe":"Machine à café",
    "tv":"Téléviseur","aspirateur":"Aspirateur",
}

def detect_brand(t):
    tl = t.lower()
    for b in BRANDS:
        if b.lower() in tl:
            return "Rosières" if b.lower().startswith("rosi") else b
    return None

def detect_cat(t):
    tl = t.lower()
    for slug,kws in CATS:
        for kw in kws:
            if kw.strip() and kw in tl:
                return slug
    return None

def spec_tokens(t):
    toks = []
    for m in re.findall(r"\b\d{3,5}\s?BTU\b", t, re.I): toks.append(m.upper().replace(" ",""))
    for m in re.findall(r"\b\d{2,4}\s?L\b", t):        toks.append(m.replace(" ",""))
    for m in re.findall(r"\b\d{1,2}\s?KG\b", t, re.I):  toks.append(m.upper().replace(" ",""))
    for m in re.findall(r"\b\d{1,2}\s?[Pp]ortes?\b", t):toks.append(m.strip())
    for m in re.findall(r"\b\d{1,2}\s?[Cc]ouverts?\b", t):toks.append(m.strip())
    if re.search(r"inverter", t, re.I): toks.append("Inverter")
    if re.search(r"no\s?frost", t, re.I): toks.append("No Frost")
    if re.search(r"inox", t, re.I): toks.append("Inox")
    # dedupe preserve order
    seen=set(); out=[]
    for x in toks:
        k="".join(x.lower().split())   # space-insensitive dedupe (4 Portes == 4Portes)
        if k not in seen: seen.add(k); out.append(x)
    return out

def detect_price(t):
    # accept "128 000 DA", "128000 DA", "128.000 دج", etc.
    m = re.search(r"(\d[\d\s.٫٬]{3,9}\d)\s*(DA|DZD|دج|دينار)", t, re.I)
    if not m: return None
    digits = re.sub(r"[^\d]", "", m.group(1))
    try:
        v = int(digits)
        return v if 1000 <= v <= 5000000 else None
    except: return None

def clean_desc(t):
    t = re.sub(r"http\S+", "", t)
    t = re.sub(r"#\S+", "", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t[:220]

def extract_products(caps):
    products, seen = [], {}
    pid = 0
    for c in caps:
        t = c["text"]
        brand = detect_brand(t)
        cat   = detect_cat(t)
        if not cat:              # need at least a category to be a product post
            continue
        toks = spec_tokens(t)
        name_parts = [brand] if brand else []
        name_parts.append(CAT_LABEL[cat])
        size = [x for x in toks if re.search(r"\d", x)]
        if size: name_parts.append(size[0])
        name = " ".join(name_parts)
        key = (brand or "?", cat, size[0].lower() if size else "")
        if key in seen:          # dedupe same brand+cat+size
            continue
        pid += 1
        seen[key] = True
        prod = {
            "id": f"SM-{pid:02d}",
            "cat": cat,
            "category": CAT_LABEL[cat],
            "brand": brand or "Non spécifié",
            "name": name,
            "specs": toks,
            "desc": clean_desc(t),
            "source": {"platform": c["src"], "url": c.get("url")},
        }
        price = detect_price(t)
        if price: prod["price_dzd"] = price
        products.append(prod)
    return products

def main():
    store = build_store_info()
    caps  = collect_captions()
    products = extract_products(caps)
    dataset = {
        "store": store,
        "catalog": products,
        "_meta": {
            "generated_from": "Apify social scrapes (facebook, instagram, tiktok, google maps)",
            "posts_scanned": len(caps),
            "products_extracted": len(products),
            "note": "Prices only included when explicitly present in the post text. "
                    "Assistant must never invent prices/specs.",
        },
    }
    out = os.path.join(HERE, "store_data.json")
    json.dump(dataset, open(out,"w",encoding="utf-8"), ensure_ascii=False, indent=2)
    mn = os.path.join(HERE, "store_data.min.json")
    json.dump(dataset, open(mn,"w",encoding="utf-8"), ensure_ascii=False, separators=(",",":"))
    print(f"posts scanned : {len(caps)}")
    print(f"products       : {len(products)}")
    print(f"wrote          : {out}  ({os.path.getsize(out)} bytes)")
    print(f"wrote (min)    : {mn}  ({os.path.getsize(mn)} bytes)")

if __name__ == "__main__":
    main()
