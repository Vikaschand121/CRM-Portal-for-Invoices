import { api } from './api';
import { Property, CreatePropertyPayload, UpdatePropertyPayload } from '../types';

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
}

export const propertiesService = new PropertiesService();