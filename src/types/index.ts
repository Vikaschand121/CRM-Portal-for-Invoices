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
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  companyType?: string;
  totalProperties?: number;
  activeProperties?: number;
  portfolioValue?: number;
  properties?: CompanyProperty[];
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

export interface Tenant {
  id: number;
  tenantName: string;
  propertyId: number;
  leaseStartDate: string;
  leaseEndDate: string;
  rentReviewDates: string;
  breakDate: string;
  lenderName: string;
  isVatAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTenantPayload {
  tenantName: string;
  propertyId: number;
  leaseStartDate: string;
  leaseEndDate: string;
  rentReviewDates: string;
  breakDate: string;
  lenderName: string;
  isVatAvailable: boolean;
}

export interface UpdateTenantPayload extends CreateTenantPayload {}

export interface Document {
  id: number;
  name: string;
  type: string;
  url: string;
  propertyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentPayload {
  name: string;
  type: string;
  file: File | null; // For upload
  propertyId: number;
}

export interface Invoice {
  id: number;
  amount: number;
  date: string;
  status: string;
  propertyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoicePayload {
  amount: number;
  date: string;
  status: string;
  propertyId: number;
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
