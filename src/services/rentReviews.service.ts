import { api } from './api';
import type { RentReview, UpdateRentReviewPayload } from '../types';

interface GetFullDetailsParams {
  tenantId?: number;
  implemented?: boolean;
}

class RentReviewsService {
  async getFullDetails(params?: GetFullDetailsParams): Promise<RentReview[]> {
    const query = new URLSearchParams();
    if (params?.tenantId) {
      query.append('tenantId', params.tenantId.toString());
    }
    if (typeof params?.implemented === 'boolean') {
      query.append('implemented', params.implemented.toString());
    }
    const queryString = query.toString();
    return api.get<RentReview[]>(
      `/property-management/rent-reviews/full-details${queryString ? `?${queryString}` : ''}`
    );
  }

  async getRentReview(id: number): Promise<RentReview> {
    return api.get<RentReview>(`/property-management/rent-reviews/${id}`);
  }

  async updateRentReview(id: number, payload: UpdateRentReviewPayload): Promise<RentReview> {
    return api.patch<RentReview>(`/property-management/rent-reviews/${id}`, payload);
  }

  async createRentReview(payload: UpdateRentReviewPayload): Promise<RentReview> {
    return api.post<RentReview>('/property-management/rent-reviews', payload);
  }
}

export const rentReviewsService = new RentReviewsService();
