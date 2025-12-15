export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  userType?: string;
  roles?: Array<{ id: number; name: string }>;
  two_factor_enabled?: boolean;
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requires2FA: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TwoFactorVerification {
  code: string;
  userId: string;
}

export type LoginResult =
  | { requires2FA: true; userId: string; message?: string }
  | { requires2FA: false; user: User; message?: string };

export interface Verify2FAResponse {
  accessToken: string;
  user: User;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface CompanyProperty {
  id?: number;
  name: string;
  status?: string;
  value?: number;
  address?: string;
}

export interface Property {
  id: number;
  propertyName: string;
  propertyAddress: string;
  description: string;
  propertyType: string;
  propertyValue: number;
  rentalIncomePerAnnum: number;
  company: Company;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
}

export interface CreatePropertyPayload {
  propertyName: string;
  propertyAddress: string;
  description: string;
  propertyType: string;
  propertyValue: number;
  rentalIncomePerAnnum: number;
  companyId: number;
}

export interface UpdatePropertyPayload extends CreatePropertyPayload {}

export interface Company {
  id?: number;
  name: string;
  companyNumber: string;
  incorporationDate: string;
  sicCode: string;
  natureOfBusiness: string;
  registeredAddress: string;
  directors: string;
  shareholding: string;
  confirmationStatementDue: string;
  accountsDue: string;
  vatNumber: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  companyType?: string;
  totalProperties?: number;
  activeProperties?: number;
  portfolioValue?: number;
  properties?: CompanyProperty[];
  isArchived?: boolean;
  tenantsPercentage?: string;
  accountHolderName?: string;
  bankName?: string;
  sortCode?: string;
  accountNumber?: string;
  bankAddress?: string;
}

export interface CreateCompanyPayload {
  name: string;
  companyNumber: string;
  incorporationDate: string;
  sicCode: string;
  natureOfBusiness: string;
  registeredAddress: string;
  directors: string;
  shareholding: string;
  confirmationStatementDue: string;
  accountsDue: string;
  vatNumber: string;
}

export interface UpdateCompanyPayload extends CreateCompanyPayload {}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO date string
  end?: string; // ISO date string, optional for all-day events
  allDay?: boolean;
  description?: string;
  color?: string;
  extendedProps?: {
    type: 'task' | 'meeting';
    priority?: 'low' | 'medium' | 'high';
    attendees?: string[];
    location?: string;
    companyId?: number;
    userIds?: number[];
  };
}

export interface Task {
  id: string;
  title: string;
  date: string; // ISO date string
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // ISO date string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  description?: string;
  companyId?: number;
  userIds?: number[];
}

export type RentPaymentFrequency = 'MONTHLY' | 'QUARTERLY';

export interface Tenant {
  id: number;
  tenantName: string;
  propertyId: number;
  leaseStartDate: string;
  leaseEndDate: string;
  rentReviewDates: string;
  isReviewedDates: boolean;
  isVatRegistered: boolean;
  rentPaymentFrequency: RentPaymentFrequency;
  tenantEmail: string;
  tenantContact: string;
  tenantCorrespondingAddress: string;
  breakDate: string;
  rentStartDate: string;
  lenderName?: string;
  aggreedAnnualRent?: string;
  netAmount?: string;
  previousBalance?: number;
  createdAt?: string;
  updatedAt?: string;
  isArchived?: boolean;
  property?: Property;
}

export interface CreateTenantPayload {
  tenantName: string;
  propertyId: number;
  leaseStartDate: string;
  leaseEndDate: string;
  rentReviewDates: string;
  isReviewedDates: boolean;
  isVatRegistered: boolean;
  rentPaymentFrequency: RentPaymentFrequency;
  tenantEmail: string;
  tenantContact: string;
  tenantCorrespondingAddress: string;
  breakDate: string;
  rentStartDate: string;
  lenderName?: string;
  aggreedAnnualRent?: string;
  netAmount?: string;
  previousBalance?: number;
}

export interface UpdateTenantPayload extends CreateTenantPayload {}

export interface Document {
  id: number;
  documentName: string;
  documentType: string;
  documentSubType?: string;
  filePath: string;
  fileUrl: string;
  companyId?: number;
  tenantId?: number;
  propertyId: number;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  property?: Property;
  tenant?: Tenant;
}

export interface CreateDocumentPayload {
  documentName: string;
  documentType: string;
  documentSubType?: string;
  companyId?: number;
  tenantId?: number;
  propertyId: number;
  invoiceId?: number;
  file: File | null;
}

export interface Invoice {
  id: number;
  invoiceName: string;
  invoiceType: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  terms: string;
  companyName: string;
  companyAddress: string;
  companyContactDetails: string;
  billToName: string;
  billToAddress: string;
  propertyAddress: string;
  propertyId: number;
  rentalPeriodStart: string;
  rentalPeriodEnd: string;
  netAmount: number;
  vatAmount: number;
  vatRate: number;
  totalAmount: number;
  paymentMade: number;
  balanceDue?: string;
  notes: string;
  bankAccountName: string;
  bankName: string;
  bankSortCode: string;
  bankAccountNumber: string;
  bankAddress: string;
  filePath: string;
  fileUrl: string;
  tenantId: number;
  tenantName: string;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  property?: Property;
  tenant?: Tenant;
}

export interface CreateInvoicePayload {
  tenantId: number;
  propertyId: number;
  invoiceName: string;
  invoiceType: string;
  invoiceNumber: string;
  invoiceDate: string;
  terms: string;
  dueDate: string;
  companyName: string;
  companyAddress: string;
  companyContactDetails: string;
  billToName: string;
  billToAddress: string;
  propertyAddress: string;
  rentalPeriodStart: string;
  rentalPeriodEnd: string;
  netAmount: number;
  vatAmount: number;
  vatRate: number;
  totalAmount: number;
  paymentMade: number;
  balanceDue?: string;
  notes: string;
  bankAccountName: string;
  bankName: string;
  bankSortCode: string;
  bankAccountNumber: string;
  bankAddress: string;
}

export interface BankDetails {
  accountHolderName: string;
  bankName: string;
  sortCode: string;
  accountNumber: string;
  bankAddress: string;
}

export interface CreateBankDetailsPayload extends BankDetails {}

export interface UpdateBankDetailsPayload extends BankDetails {}

export interface Payment {
  id: number;
  invoiceId: number;
  invoiceNumber: string;
  paymentDate: string;
  amountReceived: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentPayload {
  invoiceId: number;
  invoiceNumber: string;
  paymentDate: string;
  amountReceived: string;
  paymentMethod: string;
}

export interface UpdatePaymentPayload extends CreatePaymentPayload {}

export interface CreditNote {
  id: number;
  creditNoteDate: string;
  creditNoteAmount: string;
  description: string;
  invoiceId: number;
  invoiceNumber: string;
  tenantId: number;
  tenantName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreditNotePayload {
  tenantId: number;
  invoiceId: number;
  creditNoteDate: string;
  creditNoteAmount: string;
  description: string;
}

export interface UpdateCreditNotePayload extends CreateCreditNotePayload {}
