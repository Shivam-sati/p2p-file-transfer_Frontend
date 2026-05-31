import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../services/analyticsApi';
import type { AnalyticsDashboardResponse, AnalyticsRange } from '../types/api';

interface UseAnalyticsResult {
  data:      AnalyticsDashboardResponse | null;
  loading:   boolean;
  error:     string | null;
  range:     AnalyticsRange;
  setRange:  (range: AnalyticsRange) => void;
  refresh:   () => void;
}

export function useAnalytics(autoRefreshMs = 0): UseAnalyticsResult {
  const [data,    setData]    = useState<AnalyticsDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [range,   setRange]   = useState<AnalyticsRange>('24h');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyticsApi.getDashboard(range);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [range]);

  // Fetch on mount and whenever range changes
  useEffect(() => { fetch(); }, [fetch]);

  // Optional auto-refresh
  useEffect(() => {
    if (!autoRefreshMs) return;
    const id = setInterval(fetch, autoRefreshMs);
    return () => clearInterval(id);
  }, [fetch, autoRefreshMs]);

  return { data, loading, error, range, setRange, refresh: fetch };
}