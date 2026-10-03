import crypto from "node:crypto";

const API = "https://graph.facebook.com";
const VERSION = "v21.0";

export function getConfig() {
  return {
    phoneId: process.env.WHATSAPP_PHONE_ID,
    token: process.env.WHATSAPP_TOKEN,
    templateInvite: process.env.WA_TEMPLATE_INVITE || "invitacion_karen_aldo",
    templateReminder: process.env.WA_TEMPLATE_REMINDER || "recordatorio_karen_aldo",
    language: process.env.WA_TEMPLATE_LANG || "es",
    enabled: Boolean(process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_TOKEN),
  };
}

async function uploadMedia(imageBuffer) {
  const cfg = getConfig();
  const blob = new Blob([imageBuffer], { type: "image/png" });
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("file", blob, "invitacion.png");
  form.append("type", "image/png");

  const res = await fetch(`${API}/${VERSION}/${cfg.phoneId}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}` },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`WhatsApp Media upload error ${res.status}`);
    err.data = data;
    throw err;
  }
  return data.id;
}

export async function sendImageMessage({ to, imageBuffer, caption }) {
  const cfg = getConfig();
  if (!cfg.enabled) {
    throw new Error("WhatsApp no configurado (WHATSAPP_PHONE_ID / WHATSAPP_TOKEN)");
  }
  const mediaId = await uploadMedia(imageBuffer);
  const res = await fetch(`${API}/${VERSION}/${cfg.phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "image",
      image: { id: mediaId, caption },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`WhatsApp API error ${res.status}`);
    err.data = data;
    throw err;
  }
  return data;
}

export async function sendTemplate({ to, template, components }) {
  const cfg = getConfig();
  if (!cfg.enabled) {
    throw new Error("WhatsApp no configurado (WHATSAPP_PHONE_ID / WHATSAPP_TOKEN)");
  }
  const res = await fetch(`${API}/${VERSION}/${cfg.phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: template,
        language: { code: cfg.language },
        components,
      },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`WhatsApp API error ${res.status}`);
    err.data = data;
    throw err;
  }
  return data;
}

export function inviteComponents({ nombre, enlace }) {
  return [
    {
      type: "body",
      parameters: [
        { type: "text", text: nombre },
        { type: "text", text: enlace },
      ],
    },
  ];
}

// Comparación en tiempo constante: con `===` un atacante puede adivinar la
// firma byte a byte midiendo tiempos de respuesta.
function timingSafeEqualStr(a, b) {
  const ba = Buffer.from(String(a ?? ""), "utf8");
  const bb = Buffer.from(String(b ?? ""), "utf8");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function verifyWebhook(mode, token) {
  const expected = process.env.META_VERIFY_TOKEN;
  // Fail-closed: sin token configurado, la verificación nunca pasa. Con `===`
  // directo, token ausente y META_VERIFY_TOKEN ausente se comparaban como
  // undefined === undefined y la verificación se aceptaba.
  if (!expected) return false;
  return mode === "subscribe" && timingSafeEqualStr(token, expected);
}

export function verifySignature(req, rawBody) {
  const sig = req.headers["x-hub-signature-256"];
  const secret = process.env.META_APP_SECRET;
  if (!sig || !secret) return false;
  const expected = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")}`;
  return timingSafeEqualStr(sig, expected);
}