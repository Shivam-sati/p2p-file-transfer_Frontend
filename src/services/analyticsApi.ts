import apiClient from './apiClient';
import type {
  AnalyticsDashboardResponse,
  AnalyticsEventResponse,
  AnalyticsRange,
} from '../types/api';

export const analyticsApi = {
  async getDashboard(range: AnalyticsRange = '24h'): Promise<AnalyticsDashboardResponse> {
    const { data } = await apiClient.get<AnalyticsDashboardResponse>(
      '/analytics/dashboard',
      { params: { range } }
    );
    return data;
  },

  async getEvents(range: AnalyticsRange = '24h'): Promise<AnalyticsEventResponse[]> {
    const { data } = await apiClient.get<AnalyticsEventResponse[]>(
      '/analytics/events',
      { params: { range } }
    );
    return data;
  },
};