import { Resend } from "resend";
import { config } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import type { RetentionTriggerType, RetentionResult } from "@electrozone/shared";

function formatDA(amount: number): string {
  return new Intl.NumberFormat("fr-DZ").format(Math.round(amount)) + " DA";
}

function getItemNames(items: { kind: string; productId: string | null; bundleId: string | null; quantity: number }[]): Promise<{ names: string[]; total: number }> {
  return (async () => {
    const names: string[] = [];
    let total = 0;
    for (const it of items) {
      if (it.kind === "product" && it.productId) {
        const p = await prisma.product.findUnique({ where: { id: it.productId } });
        if (p) {
          names.push(`${p.name} ×${it.quantity}`);
          total += p.price * it.quantity;
        }
      } else if (it.kind === "bundle" && it.bundleId) {
        const b = await prisma.bundle.findUnique({ where: { id: it.bundleId } });
        if (b) {
          names.push(`${b.name} ×${it.quantity}`);
          total += b.bundlePrice ?? 0;
        }
      }
    }
    return { names, total };
  })();
}

async function buildEmailContent(
  type: RetentionTriggerType,
  orderId: string,
): Promise<{ subject: string; html: string } | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return null;

  const { names, total } = await getItemNames(order.items);
  const itemList = names.map((n) => `<li style="padding:8px 0;border-bottom:1px solid #e7deff20;">${n}</li>`).join("");
  const customerName = order.customerName;
  const trackingLink = `${config.webOrigin}/order/${orderId}`;

  if (type === "abandoned_cart") {
    return {
      subject: "Votre panier ElectroZone vous attend",
      html: `<div style="font-family:'Plus Jakarta Sans',sans-serif;background:#150e2d;color:#e7deff;padding:32px;max-width:560px;margin:0 auto;border-radius:16px;">
        <h1 style="color:#fabd00;font-size:24px;margin:0 0 16px;">Bonjour ${customerName},</h1>
        <p style="font-size:15px;line-height:1.6;color:#a99fd0;">Vous avez laissé des articles dans votre panier. Ne manquez pas cette occasion !</p>
        <div style="background:#1f1740;border-radius:12px;padding:16px;margin:24px 0;">
          <p style="font-size:12px;text-transform:uppercase;color:#a99fd0;margin:0 0 12px;letter-spacing:1px;">Articles dans votre panier</p>
          <ul style="list-style:none;padding:0;margin:0;">${itemList}</ul>
          <p style="font-size:18px;color:#fabd00;font-weight:bold;margin:16px 0 0;text-align:right;">Total: ${formatDA(total)}</p>
        </div>
        <a href="${config.webOrigin}/cart" style="display:inline-block;background:#fabd00;color:#150e2d;font-weight:bold;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:14px;">Retourner au panier</a>
        <p style="font-size:12px;color:#6b6394;margin:24px 0 0;">ElectroZone — Électroménager en Algérie</p>
      </div>`,
    };
  }

  if (type === "promo") {
    return {
      subject: "Offre spéciale ElectroZone pour vous",
      html: `<div style="font-family:'Plus Jakarta Sans',sans-serif;background:#150e2d;color:#e7deff;padding:32px;max-width:560px;margin:0 auto;border-radius:16px;">
        <h1 style="color:#fabd00;font-size:24px;margin:0 0 16px;">Bonjour ${customerName},</h1>
        <p style="font-size:15px;line-height:1.6;color:#a99fd0;">Suite à votre récente commande, nous vous offrons une réduction sur une sélection de produits complémentaires :</p>
        <div style="background:#1f1740;border-radius:12px;padding:16px;margin:24px 0;">
          <p style="font-size:12px;text-transform:uppercase;color:#a99fd0;margin:0 0 12px;letter-spacing:1px;">Votre dernière commande</p>
          <ul style="list-style:none;padding:0;margin:0;">${itemList}</ul>
          <p style="font-size:18px;color:#fabd00;font-weight:bold;margin:16px 0 0;text-align:right;">Total: ${formatDA(total)}</p>
        </div>
        <p style="font-size:15px;line-height:1.6;color:#a99fd0;">Utilisez le code <strong style="color:#fabd00;">PACK5</strong> pour -5% sur votre prochaine commande.</p>
        <a href="${config.webOrigin}" style="display:inline-block;background:#fabd00;color:#150e2d;font-weight:bold;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:14px;">Découvrir les offres</a>
        <p style="font-size:12px;color:#6b6394;margin:24px 0 0;">ElectroZone — Électroménager en Algérie</p>
      </div>`,
    };
  }

  return {
    subject: `Suivi de votre commande ${order.id.slice(0, 8)}`,
    html: `<div style="font-family:'Plus Jakarta Sans',sans-serif;background:#150e2d;color:#e7deff;padding:32px;max-width:560px;margin:0 auto;border-radius:16px;">
      <h1 style="color:#fabd00;font-size:24px;margin:0 0 16px;">Bonjour ${customerName},</h1>
      <p style="font-size:15px;line-height:1.6;color:#a99fd0;">Merci pour votre commande ! Voici un récapitulatif :</p>
      <div style="background:#1f1740;border-radius:12px;padding:16px;margin:24px 0;">
        <p style="font-size:12px;text-transform:uppercase;color:#a99fd0;margin:0 0 12px;letter-spacing:1px;">Commande #${order.id.slice(0, 8)}</p>
        <ul style="list-style:none;padding:0;margin:0;">${itemList}</ul>
        <p style="font-size:18px;color:#fabd00;font-weight:bold;margin:16px 0 0;text-align:right;">Total: ${formatDA(order.total)}</p>
      </div>
      <p style="font-size:15px;line-height:1.6;color:#a99fd0;">Statut actuel: <strong style="color:#fabd00;">${order.status}</strong></p>
      <a href="${trackingLink}" style="display:inline-block;background:#fabd00;color:#150e2d;font-weight:bold;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:14px;">Suivre ma commande</a>
      <p style="font-size:12px;color:#6b6394;margin:24px 0 0;">ElectroZone — Électroménager en Algérie</p>
    </div>`,
  };
}

export async function sendRetentionEmail(
  type: RetentionTriggerType,
  orderId: string,
  toEmail: string,
): Promise<RetentionResult> {
  if (!config.resendApiKey) {
    return { ok: false, messageId: null, error: "RESEND_API_KEY not configured" };
  }

  const content = await buildEmailContent(type, orderId);
  if (!content) {
    return { ok: false, messageId: null, error: "Order not found" };
  }

  try {
    const resend = new Resend(config.resendApiKey);
    const { data, error } = await resend.emails.send({
      from: config.resendFromEmail,
      to: toEmail,
      subject: content.subject,
      html: content.html,
    });

    if (error) {
      return { ok: false, messageId: null, error: error.message };
    }

    return { ok: true, messageId: data?.id ?? null, error: null };
  } catch (e) {
    return { ok: false, messageId: null, error: e instanceof Error ? e.message : "Unknown error" };
  }
}