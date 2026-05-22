import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  FileText,
  Zap,
  Box
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { Button } from '../components/common/Button';
import apiClient from '../services/apiClient';
import { AnalyticsDashboard, TransferEvent } from '../types/api';
import { formatBytes, cn } from '../lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState<AnalyticsDashboard | null>(null);
  const [events, setEvents] = useState<TransferEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashboardData, eventsData] = await Promise.all([
          apiClient.get<AnalyticsDashboard>('/analytics/dashboard'),
          apiClient.get<TransferEvent[]>('/analytics/events')
        ]);
        setStats(dashboardData.data);
        setEvents(eventsData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return null;

  const statCards = [
    { label: 'Total Bandwidth', value: formatBytes(stats?.totalBytesUploaded || 0), icon: Zap, color: 'text-indigo-400' },
    { label: 'P2P Success Rate', value: `${stats?.p2pSuccessRatePercent?.toFixed(1) || 0}%`, icon: Zap, color: 'text-teal-400' },
    { label: 'Total Uploads', value: stats?.totalUploads || 0, icon: Activity, color: 'text-emerald-400' },
    { label: 'Avg Speed', value: `${((stats?.avgSpeedMbps || 0)).toFixed(2)} Mbps`, icon: Clock, color: 'text-violet-400' },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-12 relative">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tighter">System Analytics</h1>
          <p className="text-slate-400 mt-2">Real-time performance metrics and global network status.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-teal-500/20">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Node Node: 12.0.4.88</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {statCards.map((stat, i) => (
          <div key={i}>
            <Card className="relative overflow-hidden group border-white/5 bg-white/5">
              <div className={cn('absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-30', stat.color.replace('text', 'bg'))} />
              <div className="flex justify-between items-start mb-6">
                <div className={cn('p-3 rounded-xl bg-white/5', stat.color)}>
                  <stat.icon size={22} />
                </div>
                <ArrowUpRight size={18} className="text-slate-600" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-mono text-white font-medium">{stat.value}</h3>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 relative z-10">
        <Card className="lg:col-span-2 border-white/5 bg-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Recent Transfer Events</h3>
            <span className="text-xs text-indigo-400 font-mono">{events.length} Events</span>
          </div>
          <div className="space-y-4">
            {events && events.length > 0 ? (
              events.slice(0, 10).map((event) => (
              <div key={event.id} className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.07] hover:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner',
                      event.transferMode === 'P2P' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-500/10 text-slate-400'
                    )}>
                      <Zap size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">{event.eventType}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-2 font-medium">
                        <Clock size={12} /> {new Date(event.recordedAt).toLocaleTimeString()} • <span className={event.transferMode === 'P2P' ? 'text-indigo-400' : 'text-slate-400'}>{event.transferMode || 'SERVER'} MODE</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-slate-300">{formatBytes(event.bytesAtEvent)}</div>
                    <div className={cn('text-[10px] font-bold mt-1 flex items-center gap-1 justify-end uppercase tracking-widest', event.errorCode ? 'text-red-400' : 'text-teal-400')}>
                      {event.errorCode ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                      {event.errorCode || 'SUCCESS'}
                    </div>
                  </div>
                </div>
              </div>
            ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                No recent transfers
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/5 bg-white/5">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Efficiency Mix</h3>
            <div className="space-y-10">
              <div className="space-y-4">
                <ProgressBar progress={stats?.p2pSuccessRatePercent || 0} label="P2P DELIVERY" color="indigo" size="sm" />
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase tracking-wider">
                  Direct browser-to-browser data exchange.
                </p>
              </div>
              <div className="space-y-4">
                <ProgressBar progress={100 - (stats?.p2pSuccessRatePercent || 0)} label="SERVER FALLBACK" color="violet" size="sm" />
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase tracking-wider">
                  Relay synchronization via regional node.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
