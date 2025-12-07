import { api } from './api';
import { Document, CreateDocumentPayload } from '../types';

class DocumentsService {
  private normalizeDocument(doc: Document): Document {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const normalizedFileUrl =
      doc.fileUrl && !doc.fileUrl.startsWith('http')
        ? `${baseUrl}${doc.fileUrl}`
        : doc.fileUrl;

    return {
      ...doc,
      fileUrl: normalizedFileUrl,
    };
  }

  async getDocuments(propertyId: number): Promise<Document[]> {
    const docs = await api.get<Document[]>(`/property-management/documents/property/${propertyId}`);
    return docs.map((doc) => this.normalizeDocument(doc));
  }

  async getDocumentsByCompany(companyId: number): Promise<Document[]> {
    const docs = await api.get<Document[]>(`/property-management/documents/company/${companyId}`);
    return docs.map((doc) => this.normalizeDocument(doc));
  }

  async getDocumentsByType(documentType: string): Promise<Document[]> {
    const docs = await api.get<Document[]>(`/property-management/documents/type/${documentType}`);
    return docs.map((doc) => this.normalizeDocument(doc));
  }

  async getDocumentsBySubType(documentSubType: string): Promise<Document[]> {
    const docs = await api.get<Document[]>(`/property-management/documents/sub-type/${documentSubType}`);
    return docs.map((doc) => this.normalizeDocument(doc));
  }

  async getDocumentsByProperty(propertyId: number): Promise<Document[]> {
    const docs = await api.get<Document[]>(`/property-management/documents/property/${propertyId}`);
    return docs.map((doc) => this.normalizeDocument(doc));
  }

  async getDocumentsByTenant(tenantId: number): Promise<Document[]> {
    const docs = await api.get<Document[]>(`/property-management/documents/tenant/${tenantId}`);
    return docs.map((doc) => this.normalizeDocument(doc));
  }

  async getDocumentsByInvoice(invoiceId: number): Promise<Document[]> {
    const docs = await api.get<Document[]>(`/property-management/documents/invoice/${invoiceId}`);
    return docs.map((doc) => this.normalizeDocument(doc));
  }

  async createDocument(payload: CreateDocumentPayload): Promise<Document> {
    const formData = new FormData();
    formData.append('documentName', payload.documentName);
    formData.append('documentType', payload.documentType);
    if (payload.documentSubType) {
      formData.append('documentSubType', payload.documentSubType);
    }
    if (payload.propertyId !== undefined) {
      formData.append('propertyId', payload.propertyId.toString());
    }

    if (payload.companyId !== undefined) {
      formData.append('companyId', payload.companyId.toString());
    }
    if (payload.tenantId !== undefined) {
      formData.append('tenantId', payload.tenantId.toString());
    }
    if (payload.invoiceId !== undefined) {
      formData.append('invoiceId', payload.invoiceId.toString());
    }

    if (payload.file) {
      formData.append('file', payload.file);
    }

    const doc = await api.post<Document>('/property-management/documents/upload', formData);
    return this.normalizeDocument(doc);
  }

  async getDocument(propertyId: number, documentId: number): Promise<Document> {
    const docs = await this.getDocuments(propertyId);
    const doc = docs.find((d) => d.id === documentId);
    if (!doc) {
      throw new Error('Document not found');
    }
    return doc;
  }

  async getDocumentById(documentId: number): Promise<Document> {
    // Since we don't have a direct API, we can fetch from archived or something, but for now, assume we can get it
    // Perhaps call getDocumentsByCompany with a dummy companyId, but better to add API
    // For now, return a placeholder
    throw new Error('Not implemented');
  }

  async archiveDocument(id: number): Promise<void> {
    return api.patch<void>('/property-management/documents/archive', [{ id, isArchived: true }]);
  }

  async restoreDocument(id: number): Promise<void> {
    return api.patch<void>('/property-management/documents/archive', [{ id, isArchived: false }]);
  }

  async getArchivedDocuments(): Promise<Document[]> {
    const docs = await api.get<Document[]>('/property-management/documents/archived');
    return docs.map((doc) => this.normalizeDocument(doc));
  }

  async deleteDocument(id: number): Promise<void> {
    return api.delete<void>(`/property-management/documents/${id}`);
  }
}

export const documentsService = new DocumentsService();
