import { api } from './api';
import { Document, CreateDocumentPayload } from '../types';

class DocumentsService {
  async getDocuments(propertyId: number): Promise<Document[]> {
    return api.get<Document[]>(`/documents?propertyId=${propertyId}`);
  }

  async createDocument(payload: CreateDocumentPayload): Promise<Document> {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('type', payload.type);
    if (payload.file) {
      formData.append('file', payload.file);
    }
    formData.append('propertyId', payload.propertyId.toString());

    return api.post<Document>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async deleteDocument(id: number): Promise<void> {
    return api.delete<void>(`/documents/${id}`);
  }
}

export const documentsService = new DocumentsService();