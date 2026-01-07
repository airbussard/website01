/**
 * Lexoffice/Lexware API Types
 * API Base URL: https://api.lexware.io
 * Rate Limit: 2 requests/second
 */

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface LexofficeApiResponse<T> {
  id: string;
  resourceUri: string;
  createdDate: string;
  updatedDate: string;
  version: number;
  data?: T;
}

export interface LexofficeError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  traceId?: string;
}

// =====================================================
// CONTACT TYPES
// =====================================================

export interface LexofficeContactAddress {
  supplement?: string;
  street?: string;
  zip?: string;
  city?: string;
  countryCode: string; // ISO 3166 alpha2 (e.g., 'DE')
}

export interface LexofficeContactPerson {
  salutation?: string;
  firstName?: string;
  lastName: string;
  primary?: boolean;
  emailAddress?: string;
  phoneNumber?: string;
}

export interface LexofficeContactCompany {
  name: string;
  taxNumber?: string;
  vatRegistrationId?: string;
  allowTaxFreeInvoices?: boolean;
  contactPersons?: LexofficeContactPerson[];
}

export interface LexofficeContactPrivatePerson {
  salutation?: string;
  firstName?: string;
  lastName: string;
}

export interface LexofficeContactRoles {
  customer?: {
    number?: number;
  };
  vendor?: {
    number?: number;
  };
}

export interface LexofficeContact {
  id?: string;
  organizationId?: string;
  version: number;
  roles: LexofficeContactRoles;
  company?: LexofficeContactCompany;
  person?: LexofficeContactPrivatePerson;
  addresses?: {
    billing?: LexofficeContactAddress[];
    shipping?: LexofficeContactAddress[];
  };
  emailAddresses?: {
    business?: string[];
    office?: string[];
    private?: string[];
    other?: string[];
  };
  phoneNumbers?: {
    business?: string[];
    office?: string[];
    mobile?: string[];
    private?: string[];
    fax?: string[];
    other?: string[];
  };
  note?: string;
  archived?: boolean;
}

export interface LexofficeContactCreateRequest {
  version: 0;
  roles: LexofficeContactRoles;
  company?: LexofficeContactCompany;
  person?: LexofficeContactPrivatePerson;
  addresses?: {
    billing?: LexofficeContactAddress[];
  };
  emailAddresses?: {
    business?: string[];
  };
  phoneNumbers?: {
    business?: string[];
    mobile?: string[];
  };
  note?: string;
}

// =====================================================
// INVOICE TYPES
// =====================================================

export type LexofficeTaxType =
  | 'net'
  | 'gross'
  | 'vatfree'
  | 'intraCommunitySupply'
  | 'constructionService13b'
  | 'externalService13b'
  | 'thirdPartyCountryService'
  | 'thirdPartyCountryDelivery'
  | 'photovoltaicEquipment';

export type LexofficeVoucherStatus = 'draft' | 'open' | 'paidoff' | 'voided';

export type LexofficeTaxRate = 0 | 7 | 19;

export interface LexofficeLineItemUnitPrice {
  currency: 'EUR';
  netAmount: number;
  grossAmount?: number;
  taxRatePercentage: LexofficeTaxRate;
}

export interface LexofficeLineItem {
  id?: string;
  type: 'service' | 'material' | 'custom' | 'text';
  name: string;
  description?: string;
  quantity?: number;
  unitName?: string;
  unitPrice?: LexofficeLineItemUnitPrice;
  discountPercentage?: number;
  lineItemAmount?: number;
}

export interface LexofficeAddress {
  contactId?: string;
  name?: string;
  supplement?: string;
  street?: string;
  city?: string;
  zip?: string;
  countryCode?: string;
}

export interface LexofficeTotalPrice {
  currency: 'EUR';
  totalNetAmount?: number;
  totalGrossAmount?: number;
  totalTaxAmount?: number;
  totalDiscountAbsolute?: number;
  totalDiscountPercentage?: number;
}

export interface LexofficeTaxAmount {
  taxRatePercentage: number;
  taxAmount: number;
  netAmount: number;
}

export interface LexofficeTaxConditions {
  taxType: LexofficeTaxType;
  taxTypeNote?: string;
}

export interface LexofficePaymentConditions {
  paymentTermLabel?: string;
  paymentTermLabelTemplate?: string;
  paymentTermDuration?: number;
  paymentDiscountConditions?: {
    discountPercentage: number;
    discountRange: number;
  };
}

export interface LexofficeShippingConditions {
  shippingDate?: string;
  shippingEndDate?: string;
  shippingType?: 'delivery' | 'deliveryperiod' | 'service' | 'serviceperiod' | 'none';
}

export interface LexofficeInvoice {
  id?: string;
  organizationId?: string;
  createdDate?: string;
  updatedDate?: string;
  version?: number;
  language?: string;
  archived?: boolean;
  voucherStatus?: LexofficeVoucherStatus;
  voucherNumber?: string;
  voucherDate: string; // ISO 8601
  dueDate?: string;
  address: LexofficeAddress;
  lineItems: LexofficeLineItem[];
  totalPrice: LexofficeTotalPrice;
  taxAmounts?: LexofficeTaxAmount[];
  taxConditions: LexofficeTaxConditions;
  paymentConditions?: LexofficePaymentConditions;
  shippingConditions?: LexofficeShippingConditions;
  title?: string;
  introduction?: string;
  remark?: string;
  closingInvoice?: boolean;
}

export interface LexofficeInvoiceCreateRequest {
  voucherDate: string;
  address: LexofficeAddress;
  lineItems: LexofficeLineItem[];
  totalPrice: { currency: 'EUR' };
  taxConditions: LexofficeTaxConditions;
  paymentConditions?: LexofficePaymentConditions;
  shippingConditions?: LexofficeShippingConditions;
  title?: string;
  introduction?: string;
  remark?: string;
}

// =====================================================
// QUOTATION TYPES
// =====================================================

export type LexofficeQuotationStatus = 'draft' | 'open' | 'accepted' | 'rejected';

export interface LexofficeQuotation {
  id?: string;
  organizationId?: string;
  createdDate?: string;
  updatedDate?: string;
  version?: number;
  language?: string;
  archived?: boolean;
  voucherStatus?: LexofficeQuotationStatus;
  voucherNumber?: string;
  voucherDate: string;
  expirationDate?: string;
  address: LexofficeAddress;
  lineItems: LexofficeLineItem[];
  totalPrice: LexofficeTotalPrice;
  taxAmounts?: LexofficeTaxAmount[];
  taxConditions: LexofficeTaxConditions;
  paymentConditions?: LexofficePaymentConditions;
  title?: string;
  introduction?: string;
  remark?: string;
}

export interface LexofficeQuotationCreateRequest {
  voucherDate: string;
  expirationDate?: string;
  address: LexofficeAddress;
  lineItems: LexofficeLineItem[];
  totalPrice: { currency: 'EUR' };
  taxConditions: LexofficeTaxConditions;
  title?: string;
  introduction?: string;
  remark?: string;
}

// =====================================================
// RECURRING TEMPLATE TYPES (READ ONLY)
// =====================================================

export interface LexofficeRecurringTemplate {
  id: string;
  organizationId: string;
  createdDate: string;
  updatedDate: string;
  version: number;
  address: LexofficeAddress;
  lineItems: LexofficeLineItem[];
  totalPrice: LexofficeTotalPrice;
  taxConditions: LexofficeTaxConditions;
  paymentConditions?: LexofficePaymentConditions;
  recurringTemplateSettings: {
    id: string;
    startDate: string;
    endDate?: string;
    finalize: boolean;
    shippingType: string;
    executionInterval: 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';
    nextExecutionDate: string;
    lastExecutionFailed: boolean;
  };
}

// =====================================================
// LOCAL TYPES (for our system)
// =====================================================

export type RecurringInterval = 'monthly' | 'quarterly' | 'yearly';

export interface RecurringInvoice {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  amount: number;
  tax_rate: 0 | 7 | 19;
  line_items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unit_name: string;
    unit_price: number;
  }>;

  // Recurring Settings
  interval_type: RecurringInterval;
  interval_value: number;
  start_date: string;
  end_date: string | null;
  next_invoice_date: string;

  // Status
  is_active: boolean;
  last_generated_at: string | null;
  invoices_generated: number;

  created_by: string;
  created_at: string;
  updated_at: string;

  // Relations
  project?: {
    id: string;
    name: string;
  };
}

export interface LexofficeContactMapping {
  id: string;
  profile_id: string | null;
  organization_id: string | null;
  lexoffice_contact_id: string;
  created_at: string;
}

export interface LexofficeSettings {
  api_key: string;
  is_enabled: boolean;
  last_sync_at: string | null;
}

// =====================================================
// QUOTATION LOCAL TYPE
// =====================================================

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface Quotation {
  id: string;
  project_id: string;
  quotation_number: string;
  title: string;
  description: string | null;
  line_items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unit_name: string;
    unit_price: number;
    tax_rate: 0 | 7 | 19;
  }>;
  total_amount: number;
  tax_amount: number;
  net_amount: number;
  status: QuotationStatus;
  valid_until: string | null;
  lexoffice_id: string | null;
  pdf_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;

  // Relations
  project?: {
    id: string;
    name: string;
  };
}
