import { api } from './api';
import { Property, CreatePropertyPayload, UpdatePropertyPayload, BankDetails, CreateBankDetailsPayload, UpdateBankDetailsPayload, Payment, CreatePaymentPayload, UpdatePaymentPayload, CreditNote, CreateCreditNotePayload, UpdateCreditNotePayload } from '../types';

class PropertiesService {
  async getProperties(): Promise<Property[]> {
    return api.get<Property[]>('/property-management/properties');
  }

  async createProperty(payload: CreatePropertyPayload): Promise<Property> {
    return api.post<Property>('/property-management/properties', payload);
  }

  async updateProperty(id: number, payload: UpdatePropertyPayload): Promise<Property> {
    return api.patch<Property>(`/property-management/properties/${id}`, payload);
  }

  async deleteProperty(id: number): Promise<void> {
    return api.delete<void>(`/property-management/properties/${id}`);
  }

  async archiveProperty(id: number): Promise<void> {
    return api.patch<void>('/property-management/properties/archive', [{ id, isArchived: true }]);
  }

  async restoreProperty(id: number): Promise<void> {
    return api.patch<void>('/property-management/properties/archive', [{ id, isArchived: false }]);
  }

  async getArchivedProperties(): Promise<Property[]> {
    return api.get<Property[]>('/property-management/properties/archived');
  }

  async getBankDetails(companyId: number): Promise<BankDetails> {
    return api.get<BankDetails>(`/property-management/companies/${companyId}/bank-details`);
  }

  async createBankDetails(companyId: number, payload: CreateBankDetailsPayload): Promise<BankDetails> {
    return api.post<BankDetails>(`/property-management/companies/${companyId}/bank-details`, payload);
  }

  async updateBankDetails(companyId: number, payload: UpdateBankDetailsPayload): Promise<BankDetails> {
    return api.patch<BankDetails>(`/property-management/companies/${companyId}/bank-details`, payload);
  }

  async deleteBankDetails(companyId: number): Promise<void> {
    return api.delete<void>(`/property-management/companies/${companyId}/bank-details`);
  }

  async getPaymentDetails(tenantId: number): Promise<Payment[]> {
    return api.get<Payment[]>(`/property-management/payment-details/tenant/${tenantId}`);
  }

  async createPayment(payload: CreatePaymentPayload): Promise<Payment> {
    return api.post<Payment>('/property-management/payment-details', payload);
  }

  async getPayment(id: number): Promise<Payment> {
    return api.get<Payment>(`/property-management/payment-details/${id}`);
  }

  async updatePayment(id: number, payload: UpdatePaymentPayload): Promise<Payment> {
    return api.patch<Payment>(`/property-management/payment-details/${id}`, payload);
  }

  async deletePayment(id: number): Promise<void> {
    return api.delete<void>(`/property-management/payment-details/${id}`);
  }

  async archivePayment(id: number): Promise<void> {
    return api.patch<void>(`/property-management/payment-details/archive/${id}`, { isArchived: true });
  }

  async restorePayment(id: number): Promise<void> {
    return api.patch<void>(`/property-management/payment-details/archive/${id}`, { isArchived: false });
  }

  async getArchivedPayments(): Promise<Payment[]> {
    return api.get<Payment[]>('/property-management/payment-details/archived');
  }

  async getCreditNotes(tenantId: number): Promise<CreditNote[]> {
    return api.get<CreditNote[]>(`/property-management/credit-notes/tenant/${tenantId}`);
  }

  async createCreditNote(payload: CreateCreditNotePayload): Promise<CreditNote> {
    return api.post<CreditNote>('/property-management/credit-notes', payload);
  }

  async getCreditNote(id: number): Promise<CreditNote> {
    return api.get<CreditNote>(`/property-management/credit-notes/${id}`);
  }

  async updateCreditNote(id: number, payload: UpdateCreditNotePayload): Promise<CreditNote> {
    return api.patch<CreditNote>(`/property-management/credit-notes/${id}`, payload);
  }

  async deleteCreditNote(id: number): Promise<void> {
    return api.delete<void>(`/property-management/credit-notes/${id}`);
  }

  async archiveCreditNote(id: number): Promise<void> {
    return api.patch<void>(`/property-management/credit-notes/archive/${id}`, { isArchived: true });
  }

  async restoreCreditNote(id: number): Promise<void> {
    return api.patch<void>(`/property-management/credit-notes/archive/${id}`, { isArchived: false });
  }

  async getArchivedCreditNotes(): Promise<CreditNote[]> {
    return api.get<CreditNote[]>('/property-management/credit-notes/archived');
  }
}

export const propertiesService = new PropertiesService();
