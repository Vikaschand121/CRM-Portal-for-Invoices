import { api } from './api';
import { Tenant, CreateTenantPayload, UpdateTenantPayload } from '../types';

class TenantsService {
  async getTenants(propertyId: number): Promise<Tenant[]> {
    return api.get<Tenant[]>(`/property-management/tenants/property/${propertyId}`);
  }

  async createTenant(payload: CreateTenantPayload): Promise<Tenant> {
    return api.post<Tenant>('/property-management/tenants', payload);
  }

  async updateTenant(id: number, payload: UpdateTenantPayload): Promise<Tenant> {
    return api.patch<Tenant>(`/property-management/tenants/${id}`, payload);
  }

  async deleteTenant(id: number): Promise<void> {
    return api.delete<void>(`/property-management/tenants/${id}`);
  }
}

export const tenantsService = new TenantsService();