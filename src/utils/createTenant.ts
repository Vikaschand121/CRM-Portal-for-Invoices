import { tenantsService } from '../services/tenants.service';
import { CreateTenantPayload } from '../types';

export const createTenantFromData = async () => {
  const payload: CreateTenantPayload = {
    tenantName: "Acme Holdings Ltd",
    propertyId: 1,
    leaseStartDate: "2025-01-01",
    leaseEndDate: "2030-12-31",
    rentReviewDates: "2025-09-28 & every 3 years after",
    isReviewedDates: true,
    isVatRegistered: false,
    rentPaymentFrequency: "MONTHLY",
    aggreedAnnualRent: "25000",
    netAmount: "15000",
    tenantEmail: "tenant@example.com",
    tenantContact: "+44 1234 567890",
    tenantCorrespondingAddress: "123 Baker Street, London, W1 6XE",
    breakDate: "2028-12-31",
    rentStartDate: "2025-01-01",
    crmRentStartDate: "2025-01-15",
    previousBalance: 1250.5,
    isArchived: false,
  };

  try {
    const tenant = await tenantsService.createTenant(payload);
    console.log('Tenant created:', tenant);
    return tenant;
  } catch (error) {
    console.error('Failed to create tenant:', error);
    throw error;
  }
};

