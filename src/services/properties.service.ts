import { api } from './api';
import { Property, CreatePropertyPayload, UpdatePropertyPayload, BankDetails, CreateBankDetailsPayload, UpdateBankDetailsPayload } from '../types';

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
}

export const propertiesService = new PropertiesService();