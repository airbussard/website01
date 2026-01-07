/**
 * Lexoffice Integration Module
 *
 * Exportiert alle Lexoffice-bezogenen Funktionen und Types
 */

// Client
export {
  LexofficeClient,
  LexofficeApiError,
  getLexofficeClient,
  createLexofficeClient,
} from './client';

// Types
export type {
  // API Types
  LexofficeApiResponse,
  LexofficeError,
  LexofficeContact,
  LexofficeContactCreateRequest,
  LexofficeContactAddress,
  LexofficeContactPerson,
  LexofficeContactCompany,
  LexofficeInvoice,
  LexofficeInvoiceCreateRequest,
  LexofficeQuotation,
  LexofficeQuotationCreateRequest,
  LexofficeLineItem,
  LexofficeTaxType,
  LexofficeTaxRate,
  LexofficeVoucherStatus,
  LexofficeRecurringTemplate,
  // Local Types
  RecurringInvoice,
  RecurringInterval,
  Quotation,
  QuotationStatus,
  LexofficeContactMapping,
  LexofficeSettings,
} from './types';

// Mapper
export {
  mapToLexofficeContact,
  mapToLexofficeInvoice,
  mapToLexofficeQuotation,
  mapLexofficeStatusToLocal,
  mapLocalStatusToLexoffice,
  calculateTotalsFromLineItems,
} from './mapper';
