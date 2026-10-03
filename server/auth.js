import crypto from "node:crypto";

// Sin SECRET real las sesiones serían falsificables por cualquiera (el valor
// por defecto está en un repo público), así que en producción se para el arranque.
const SECRET = process.env.SECRET;
if (!SECRET || SECRET === "dev-secret-change-me") {
  if (process.env.NODE_ENV === "production") {
    throw new Error("SECRET no definido o con valor de ejemplo (ver .env)");
  }
  console.warn("[auth] AVISO: usando SECRET de ejemplo, solo válido para desarrollo");
}
const DEV_SECRET = "dev-secret-change-me";
const COOKIE = "ka_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function key() {
  return SECRET || DEV_SECRET;
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", key()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token) {
  const [body, sig] = String(token || "").split(".");
  if (!body || !sig) return null;
  const expected = crypto
    .createHmac("sha256", key())
    .update(body)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    // La caducidad la impone el servidor, no solo el navegador: un token
    // robado deja de servir al expirar aunque se reutilice mucho después.
    if (!payload || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setSession(res, payload) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  res.cookie(COOKIE, sign({ ...payload, exp }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    maxAge: MAX_AGE * 1000,
    path: "/",
  });
}

export function clearSession(res) {
  res.clearCookie(COOKIE, { path: "/" });
}

export function getSession(req) {
  return verify(req.cookies?.[COOKIE]);
}

export function requireAdmin(req, res, next) {
  const s = getSession(req);
  if (!s || !s.admin) {
    return res.status(401).json({ error: "no autorizado" });
  }
  next();
}