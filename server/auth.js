import crypto from "node:crypto";

const SECRET = process.env.SECRET || "dev-secret-change-me";
const COOKIE = "ka_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token) {
  const [body, sig] = String(token || "").split(".");
  if (!body || !sig) return null;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(body)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function setSession(res, payload) {
  res.cookie(COOKIE, sign(payload), {
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