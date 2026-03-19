import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/services/core/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('@/utils/apiHelpers', () => ({
  extractData: vi.fn(),
}));

import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';
import { customerDashboardService } from './customerDashboardService';

describe('customerDashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests customer dashboard with params and returns extracted payload', async () => {
    const apiResponse = { data: { data: { kpis: [] } } };
    const extractedResponse = { kpis: [{ label: 'Open', value: 10 }] };

    vi.mocked(api.get).mockResolvedValue(apiResponse as any);
    vi.mocked(extractData).mockReturnValue(extractedResponse as any);

    const params = { start_date: '2026-02-01', end_date: '2026-02-19' } as any;
    const result = await customerDashboardService.getCustomerDashboard(params);

    expect(api.get).toHaveBeenCalledWith('/dashboard/customer', { params });
    expect(extractData).toHaveBeenCalledWith(apiResponse);
    expect(result).toEqual(extractedResponse);
  });

  it('uses empty params by default', async () => {
    const apiResponse = { data: {} };

    vi.mocked(api.get).mockResolvedValue(apiResponse as any);
    vi.mocked(extractData).mockReturnValue({} as any);

    await customerDashboardService.getCustomerDashboard();

    expect(api.get).toHaveBeenCalledWith('/dashboard/customer', { params: {} });
  });
});
