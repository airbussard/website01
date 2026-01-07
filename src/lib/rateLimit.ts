// =====================================================
// RATE LIMITER
// Einfaches In-Memory Rate Limiting ohne externe Abhaengigkeiten
// =====================================================

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup alte Eintraege alle 5 Minuten
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number; // Millisekunden bis Reset
}

/**
 * Prueft Rate Limit fuer eine IP-Adresse
 * @param ip - IP-Adresse oder Identifier
 * @param limit - Maximale Anzahl Anfragen (default: 5)
 * @param windowMs - Zeitfenster in Millisekunden (default: 60000 = 1 Minute)
 */
export function rateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const key = `rate:${ip}`;
  const record = rateLimitMap.get(key);

  // Kein Record oder abgelaufen -> neues Fenster starten
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return {
      success: true,
      remaining: limit - 1,
      resetIn: windowMs,
    };
  }

  // Limit erreicht
  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    };
  }

  // Zaehler erhoehen
  record.count++;
  return {
    success: true,
    remaining: limit - record.count,
    resetIn: record.resetTime - now,
  };
}

/**
 * Setzt Rate Limit fuer eine IP zurueck (z.B. nach erfolgreicher Captcha-Validierung)
 */
export function resetRateLimit(ip: string): void {
  rateLimitMap.delete(`rate:${ip}`);
}
