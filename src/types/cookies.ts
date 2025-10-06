export type CookieCategory = 'essential' | 'analytics' | 'marketing';

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

export interface CookieInfo {
  name: string;
  category: CookieCategory;
  purpose: string;
  duration: string;
  provider: string;
}
