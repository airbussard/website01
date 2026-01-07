/**
 * Mapper fuer Konvertierung zwischen lokalen Daten und Lexoffice API Format
 */

import type {
  LexofficeContactCreateRequest,
  LexofficeInvoiceCreateRequest,
  LexofficeQuotationCreateRequest,
  LexofficeLineItem,
  LexofficeTaxRate,
  LexofficeTaxType,
  LexofficeVoucherStatus,
} from './types';
import type { Profile, Organization, Invoice } from '@/types/dashboard';

// =====================================================
// CONTACT MAPPING
// =====================================================

interface LocalContactData {
  // Fuer Profile
  profile?: Profile;
  // Fuer Organization
  organization?: Organization;
}

export function mapToLexofficeContact(
  data: LocalContactData
): LexofficeContactCreateRequest {
  if (data.organization) {
    return mapOrganizationToContact(data.organization);
  }

  if (data.profile) {
    return mapProfileToContact(data.profile);
  }

  throw new Error('Entweder profile oder organization muss angegeben werden');
}

function mapOrganizationToContact(
  org: Organization
): LexofficeContactCreateRequest {
  return {
    version: 0,
    roles: { customer: {} },
    company: {
      name: org.name,
      contactPersons: [],
    },
    addresses: {
      billing: [
        {
          countryCode: 'DE', // Default
        },
      ],
    },
  };
}

function mapProfileToContact(profile: Profile): LexofficeContactCreateRequest {
  const isCompany = !!profile.company;

  if (isCompany) {
    return {
      version: 0,
      roles: { customer: {} },
      company: {
        name: profile.company!,
        contactPersons: [
          {
            firstName: profile.first_name || undefined,
            lastName: profile.last_name || profile.full_name || 'Unbekannt',
            primary: true,
            emailAddress: profile.email || undefined,
            phoneNumber: profile.phone || profile.mobile || undefined,
          },
        ],
      },
      addresses: profile.company_street
        ? {
            billing: [
              {
                street: profile.company_street,
                zip: profile.company_postal_code || undefined,
                city: profile.company_city || undefined,
                countryCode: mapCountryToCode(profile.company_country),
              },
            ],
          }
        : undefined,
      emailAddresses: profile.email ? { business: [profile.email] } : undefined,
      phoneNumbers: profile.phone
        ? { business: [profile.phone] }
        : profile.mobile
          ? { mobile: [profile.mobile] }
          : undefined,
    };
  }

  // Privatperson
  return {
    version: 0,
    roles: { customer: {} },
    person: {
      firstName: profile.first_name || undefined,
      lastName: profile.last_name || profile.full_name || 'Unbekannt',
    },
    addresses: profile.street
      ? {
          billing: [
            {
              street: profile.street,
              zip: profile.postal_code || undefined,
              city: profile.city || undefined,
              countryCode: mapCountryToCode(profile.country),
            },
          ],
        }
      : undefined,
    emailAddresses: profile.email ? { business: [profile.email] } : undefined,
    phoneNumbers: profile.phone
      ? { business: [profile.phone] }
      : profile.mobile
        ? { mobile: [profile.mobile] }
        : undefined,
  };
}

function mapCountryToCode(country?: string | null): string {
  if (!country) return 'DE';

  const countryMap: Record<string, string> = {
    deutschland: 'DE',
    germany: 'DE',
    de: 'DE',
    oesterreich: 'AT',
    austria: 'AT',
    at: 'AT',
    schweiz: 'CH',
    switzerland: 'CH',
    ch: 'CH',
  };

  return countryMap[country.toLowerCase()] || 'DE';
}

// =====================================================
// INVOICE MAPPING
// =====================================================

interface LocalInvoiceData {
  invoice: Invoice;
  lexofficeContactId: string;
  lineItems: Array<{
    name: string;
    description?: string;
    quantity: number;
    unit_name: string;
    unit_price: number;
    tax_rate?: 0 | 7 | 19;
  }>;
  paymentTermDays?: number;
  introduction?: string;
  remark?: string;
}

export function mapToLexofficeInvoice(
  data: LocalInvoiceData
): LexofficeInvoiceCreateRequest {
  const taxRate = determineTaxRate(data.invoice.tax_amount, data.invoice.amount);

  return {
    voucherDate: formatDate(data.invoice.issue_date),
    address: {
      contactId: data.lexofficeContactId,
    },
    lineItems: data.lineItems.map((item) => mapLineItem(item, taxRate)),
    totalPrice: { currency: 'EUR' },
    taxConditions: {
      taxType: taxRate === 0 ? 'vatfree' : 'net',
    },
    paymentConditions: data.paymentTermDays
      ? { paymentTermDuration: data.paymentTermDays }
      : data.invoice.due_date
        ? {
            paymentTermDuration: calculateDaysDifference(
              data.invoice.issue_date,
              data.invoice.due_date
            ),
          }
        : undefined,
    title: data.invoice.title || undefined,
    introduction: data.introduction,
    remark: data.remark,
  };
}

function mapLineItem(
  item: {
    name: string;
    description?: string;
    quantity: number;
    unit_name: string;
    unit_price: number;
    tax_rate?: 0 | 7 | 19;
  },
  defaultTaxRate: LexofficeTaxRate
): LexofficeLineItem {
  return {
    type: 'service',
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    unitName: item.unit_name,
    unitPrice: {
      currency: 'EUR',
      netAmount: item.unit_price,
      taxRatePercentage: item.tax_rate ?? defaultTaxRate,
    },
  };
}

// =====================================================
// QUOTATION MAPPING
// =====================================================

interface LocalQuotationData {
  quotation: {
    title: string;
    description?: string;
    valid_until?: string;
  };
  lexofficeContactId: string;
  lineItems: Array<{
    name: string;
    description?: string;
    quantity: number;
    unit_name: string;
    unit_price: number;
    tax_rate?: 0 | 7 | 19;
  }>;
  introduction?: string;
  remark?: string;
}

export function mapToLexofficeQuotation(
  data: LocalQuotationData
): LexofficeQuotationCreateRequest {
  const taxRate: LexofficeTaxRate =
    data.lineItems[0]?.tax_rate ?? 19;

  return {
    voucherDate: formatDate(new Date().toISOString()),
    expirationDate: data.quotation.valid_until
      ? formatDate(data.quotation.valid_until)
      : undefined,
    address: {
      contactId: data.lexofficeContactId,
    },
    lineItems: data.lineItems.map((item) => mapLineItem(item, taxRate)),
    totalPrice: { currency: 'EUR' },
    taxConditions: {
      taxType: taxRate === 0 ? 'vatfree' : 'net',
    },
    title: data.quotation.title || undefined,
    introduction: data.introduction || data.quotation.description,
    remark: data.remark,
  };
}

// =====================================================
// STATUS MAPPING
// =====================================================

export function mapLexofficeStatusToLocal(
  lexofficeStatus: LexofficeVoucherStatus
): 'draft' | 'sent' | 'paid' | 'cancelled' {
  switch (lexofficeStatus) {
    case 'draft':
      return 'draft';
    case 'open':
      return 'sent';
    case 'paidoff':
      return 'paid';
    case 'voided':
      return 'cancelled';
    default:
      return 'draft';
  }
}

export function mapLocalStatusToLexoffice(
  localStatus: string
): LexofficeVoucherStatus {
  switch (localStatus) {
    case 'draft':
      return 'draft';
    case 'sent':
      return 'open';
    case 'paid':
      return 'paidoff';
    case 'cancelled':
      return 'voided';
    case 'overdue':
      return 'open'; // Lexoffice hat kein overdue
    default:
      return 'draft';
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString();
}

function calculateDaysDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function determineTaxRate(taxAmount: number, netAmount: number): LexofficeTaxRate {
  if (taxAmount === 0 || netAmount === 0) return 0;

  const rate = (taxAmount / netAmount) * 100;

  if (rate >= 18 && rate <= 20) return 19;
  if (rate >= 6 && rate <= 8) return 7;
  return 0;
}

// =====================================================
// REVERSE MAPPING (Lexoffice -> Local)
// =====================================================

export function calculateTotalsFromLineItems(
  lineItems: Array<{
    quantity: number;
    unit_price: number;
    tax_rate: 0 | 7 | 19;
  }>
): { net_amount: number; tax_amount: number; total_amount: number } {
  let net_amount = 0;
  let tax_amount = 0;

  for (const item of lineItems) {
    const itemNet = item.quantity * item.unit_price;
    const itemTax = itemNet * (item.tax_rate / 100);
    net_amount += itemNet;
    tax_amount += itemTax;
  }

  return {
    net_amount: Math.round(net_amount * 100) / 100,
    tax_amount: Math.round(tax_amount * 100) / 100,
    total_amount: Math.round((net_amount + tax_amount) * 100) / 100,
  };
}
