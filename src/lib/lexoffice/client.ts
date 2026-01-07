/**
 * Lexoffice/Lexware API Client
 * Base URL: https://api.lexware.io
 * Rate Limit: 2 requests/second (500ms between requests)
 */

import type {
  LexofficeContact,
  LexofficeContactCreateRequest,
  LexofficeInvoice,
  LexofficeInvoiceCreateRequest,
  LexofficeQuotation,
  LexofficeQuotationCreateRequest,
  LexofficeRecurringTemplate,
  LexofficeApiResponse,
  LexofficeError,
} from './types';

const BASE_URL = process.env.LEXOFFICE_API_URL || 'https://api.lexware.io';
const MIN_REQUEST_INTERVAL = 500; // 500ms = 2 requests per second

class RateLimiter {
  private lastRequestTime = 0;

  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const waitTime = Math.max(0, MIN_REQUEST_INTERVAL - timeSinceLastRequest);

    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }
}

export class LexofficeClient {
  private apiKey: string;
  private rateLimiter: RateLimiter;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Lexoffice API Key ist erforderlich');
    }
    this.apiKey = apiKey;
    this.rateLimiter = new RateLimiter();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    await this.rateLimiter.wait();

    const url = `${BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: 'application/json',
    };

    // Merge existing headers
    if (options.headers) {
      const existingHeaders = options.headers as Record<string, string>;
      Object.assign(headers, existingHeaders);
    }

    if (options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: LexofficeError | null = null;
      try {
        errorData = await response.json();
      } catch {
        // Ignore JSON parse errors
      }

      const errorMessage =
        errorData?.message || `Lexoffice API Fehler: ${response.status}`;
      console.error('[Lexoffice] API Error:', {
        status: response.status,
        endpoint,
        error: errorData,
      });

      throw new LexofficeApiError(response.status, errorMessage, errorData);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // =====================================================
  // CONTACTS
  // =====================================================

  async createContact(
    data: LexofficeContactCreateRequest
  ): Promise<LexofficeApiResponse<LexofficeContact>> {
    return this.request('/v1/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getContact(id: string): Promise<LexofficeContact> {
    return this.request(`/v1/contacts/${id}`);
  }

  async searchContacts(params?: {
    email?: string;
    name?: string;
    number?: number;
    customer?: boolean;
    vendor?: boolean;
  }): Promise<{ content: LexofficeContact[]; totalElements: number }> {
    const searchParams = new URLSearchParams();
    if (params?.email) searchParams.set('email', params.email);
    if (params?.name) searchParams.set('name', params.name);
    if (params?.number) searchParams.set('number', params.number.toString());
    if (params?.customer !== undefined)
      searchParams.set('customer', params.customer.toString());
    if (params?.vendor !== undefined)
      searchParams.set('vendor', params.vendor.toString());

    const query = searchParams.toString();
    return this.request(`/v1/contacts${query ? `?${query}` : ''}`);
  }

  // =====================================================
  // INVOICES
  // =====================================================

  async createInvoice(
    data: LexofficeInvoiceCreateRequest,
    finalize = false
  ): Promise<LexofficeApiResponse<LexofficeInvoice>> {
    const query = finalize ? '?finalize=true' : '';
    return this.request(`/v1/invoices${query}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInvoice(id: string): Promise<LexofficeInvoice> {
    return this.request(`/v1/invoices/${id}`);
  }

  async getInvoicePdf(id: string): Promise<ArrayBuffer> {
    await this.rateLimiter.wait();

    const response = await fetch(`${BASE_URL}/v1/invoices/${id}/document`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new LexofficeApiError(
        response.status,
        `Fehler beim Abrufen der PDF: ${response.status}`
      );
    }

    return response.arrayBuffer();
  }

  // =====================================================
  // QUOTATIONS
  // =====================================================

  async createQuotation(
    data: LexofficeQuotationCreateRequest,
    finalize = false
  ): Promise<LexofficeApiResponse<LexofficeQuotation>> {
    const query = finalize ? '?finalize=true' : '';
    return this.request(`/v1/quotations${query}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getQuotation(id: string): Promise<LexofficeQuotation> {
    return this.request(`/v1/quotations/${id}`);
  }

  async getQuotationPdf(id: string): Promise<ArrayBuffer> {
    await this.rateLimiter.wait();

    const response = await fetch(`${BASE_URL}/v1/quotations/${id}/document`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new LexofficeApiError(
        response.status,
        `Fehler beim Abrufen der PDF: ${response.status}`
      );
    }

    return response.arrayBuffer();
  }

  // =====================================================
  // RECURRING TEMPLATES (READ ONLY)
  // =====================================================

  async getRecurringTemplates(): Promise<{
    content: LexofficeRecurringTemplate[];
    totalElements: number;
  }> {
    return this.request('/v1/recurring-templates');
  }

  async getRecurringTemplate(id: string): Promise<LexofficeRecurringTemplate> {
    return this.request(`/v1/recurring-templates/${id}`);
  }

  // =====================================================
  // UTILITY
  // =====================================================

  async testConnection(): Promise<boolean> {
    try {
      // Try to fetch contacts with limit 1 to test the connection
      await this.request('/v1/contacts?page=0&size=1');
      return true;
    } catch (error) {
      console.error('[Lexoffice] Connection test failed:', error);
      return false;
    }
  }
}

// =====================================================
// ERROR CLASS
// =====================================================

export class LexofficeApiError extends Error {
  status: number;
  details: LexofficeError | null;

  constructor(
    status: number,
    message: string,
    details: LexofficeError | null = null
  ) {
    super(message);
    this.name = 'LexofficeApiError';
    this.status = status;
    this.details = details;
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

let clientInstance: LexofficeClient | null = null;

export function getLexofficeClient(): LexofficeClient | null {
  const apiKey = process.env.LEXOFFICE_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = new LexofficeClient(apiKey);
  }

  return clientInstance;
}

/**
 * Creates a new Lexoffice client with a custom API key
 * Useful when API key is stored in database
 */
export function createLexofficeClient(apiKey: string): LexofficeClient {
  return new LexofficeClient(apiKey);
}
