import { api } from './api';
import { Invoice, CreateInvoicePayload } from '../types';

class InvoicesService {
  async getInvoices(propertyId: number): Promise<Invoice[]> {
    return api.get<Invoice[]>(`/property-management/invoices/property/${propertyId}`);
  }

  async getInvoice(id: number): Promise<Invoice> {
    return api.get<Invoice>(`/property-management/invoices/${id}`);
  }

  async createInvoice(payload: CreateInvoicePayload): Promise<Invoice> {
    return api.post<Invoice>('/property-management/invoices', payload);
  }

  async updateInvoice(id: number, payload: CreateInvoicePayload): Promise<Invoice> {
    console.log('InvoicesService: Updating invoice', id, 'with payload:', payload);
    const result = await api.patch<Invoice>(`/property-management/invoices/${id}`, payload);
    console.log('InvoicesService: Update result:', result);
    return result;
  }

  async deleteInvoice(id: number): Promise<void> {
    return api.delete<void>(`/property-management/invoices/${id}`);
  }
}

export const invoicesService = new InvoicesService();