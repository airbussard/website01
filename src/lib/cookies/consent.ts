import { CookieConsent, CookieCategory, CookieInfo } from '@/types/cookies';

const CONSENT_KEY = 'cookie-consent';

// Cookie-Definitionen
export const cookieDefinitions: CookieInfo[] = [
  {
    name: 'cookie-consent',
    category: 'essential',
    purpose: 'Speichert Ihre Cookie-Präferenzen',
    duration: '1 Jahr',
    provider: 'getemergence.com',
  },
  {
    name: 'theme-preference',
    category: 'essential',
    purpose: 'Speichert Ihre Dark/Light Mode Einstellung',
    duration: 'Permanent',
    provider: 'getemergence.com',
  },
  // Analytics (Beispiel - falls später hinzugefügt)
  {
    name: '_ga',
    category: 'analytics',
    purpose: 'Google Analytics - Unterscheidet Benutzer',
    duration: '2 Jahre',
    provider: 'Google',
  },
  {
    name: '_ga_*',
    category: 'analytics',
    purpose: 'Google Analytics - Persistiert Session-Status',
    duration: '2 Jahre',
    provider: 'Google',
  },
  // Marketing (Beispiel - falls später hinzugefügt)
  {
    name: '_fbp',
    category: 'marketing',
    purpose: 'Facebook Pixel - Tracking von Konversionen',
    duration: '3 Monate',
    provider: 'Facebook',
  },
];

// Default Consent (nur Essential)
export const defaultConsent: CookieConsent = {
  essential: true,
  analytics: false,
  marketing: false,
  timestamp: Date.now(),
};

// Consent aus LocalStorage laden
export function getConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;

    const consent = JSON.parse(stored) as CookieConsent;

    // Prüfen ob Consent älter als 6 Monate ist
    const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);
    if (consent.timestamp < sixMonthsAgo) {
      return null;
    }

    return consent;
  } catch {
    return null;
  }
}

// Consent speichern
export function saveConsent(consent: Omit<CookieConsent, 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  const consentWithTimestamp: CookieConsent = {
    ...consent,
    timestamp: Date.now(),
  };

  localStorage.setItem(CONSENT_KEY, JSON.stringify(consentWithTimestamp));

  // Event für Änderungen triggern
  window.dispatchEvent(new CustomEvent('cookieConsentChange', {
    detail: consentWithTimestamp
  }));
}

// Alle Cookies akzeptieren
export function acceptAllCookies(): void {
  saveConsent({
    essential: true,
    analytics: true,
    marketing: true,
  });
}

// Nur notwendige Cookies akzeptieren
export function acceptEssentialOnly(): void {
  saveConsent({
    essential: true,
    analytics: false,
    marketing: false,
  });
}

// Prüfen ob eine bestimmte Kategorie erlaubt ist
export function isCategoryAllowed(category: CookieCategory): boolean {
  const consent = getConsent();
  if (!consent) return category === 'essential';
  return consent[category];
}

// Cookies nach Kategorie gruppieren
export function getCookiesByCategory(category: CookieCategory): CookieInfo[] {
  return cookieDefinitions.filter(cookie => cookie.category === category);
}
