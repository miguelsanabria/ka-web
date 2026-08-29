const buckets = new Map();

function keyOf(req) {
  const ip =
    req.ip ||
    req.socket?.remoteAddress ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    "unknown";
  return ip;
}

export function rateLimit({ windowMs = 60000, max = 30, name = "rl" } = {}) {
  return (req, res, next) => {
    const key = `${name}:${keyOf(req)}`;
    const now = Date.now();
    const rec = buckets.get(key);
    if (!rec || rec.reset < now) {
      buckets.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    rec.count += 1;
    if (rec.count > max) {
      return res
        .status(429)
        .json({ error: "Demasiadas solicitudes. Intenta en un momento." });
    }
    next();
  };
}

// limpieza periódica para no acumular
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (v.reset < now) buckets.delete(k);
  }
}, 5 * 60 * 1000).unref();