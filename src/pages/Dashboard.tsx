import { motion } from 'motion/react';
import {
  Upload, Download, Zap, Activity,
  TrendingUp, Wifi, WifiOff, BarChart2,
  RefreshCw, AlertCircle
} from 'lucide-react';
import { Card }          from '../components/common/Card';
import { Button }        from '../components/common/Button';
import { useAnalytics }  from '../hooks/useAnalytics';
import type { ElementType } from 'react';
import { formatBytes, formatSpeed } from '../lib/utils';
import type { AnalyticsRange } from '../types/api';

const RANGES: { label: string; value: AnalyticsRange }[] = [
  { label: '1h',  value: '1h'  },
  { label: '24h', value: '24h' },
  { label: '7d',  value: '7d'  },
  { label: '30d', value: '30d' },
];

export default function Dashboard() {
  const { data, loading, error, range, setRange, refresh } = useAnalytics(60_000);

  return (
    <div className="pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Transfer statistics and system health
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Range selector */}
            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10 gap-1">
              {RANGES.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    range === r.value
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={refresh}
              isLoading={loading}
            >
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>

        {error && (
          <Card className="p-4 border-red-500/20 bg-red-500/5 flex items-center gap-3">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </Card>
        )}

        {loading && !data && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 h-24 animate-pulse" />
            ))}
          </div>
        )}

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Row 1 — Transfer counts */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Upload}
                label="Uploads"
                value={String(data.totalUploads)}
                sub={`${data.failedUploads} failed`}
                color="indigo"
              />
              <StatCard
                icon={Download}
                label="Downloads"
                value={String(data.totalDownloads)}
                sub={`${data.failedDownloads} failed`}
                color="teal"
              />
              <StatCard
                icon={Zap}
                label="Avg Speed"
                value={formatSpeed(data.avgSpeedBps)}
                sub={`Peak ${formatSpeed(data.peakSpeedBps)}`}
                color="violet"
              />
              <StatCard
                icon={Activity}
                label="Data Moved"
                value={formatBytes(data.totalBytesUploaded + data.totalBytesDownloaded)}
                sub={`↑ ${formatBytes(data.totalBytesUploaded)} ↓ ${formatBytes(data.totalBytesDownloaded)}`}
                color="amber"
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                icon={Wifi}
                label="P2P Connected"
                value={String(data.p2pConnections)}
                sub="WebRTC sessions"
                color="teal"
              />
              <StatCard
                icon={WifiOff}
                label="P2P Fallbacks"
                value={String(data.p2pFallbacks)}
                sub="Fell back to server"
                color="amber"
              />
              <StatCard
                icon={TrendingUp}
                label="P2P Success Rate"
                value={`${data.p2pSuccessRatePercent.toFixed(1)}%`}
                sub="WebRTC reliability"
                color={data.p2pSuccessRatePercent >= 80 ? 'teal' : 'amber'}
              />
            </div>

            {Object.keys(data.transfersByMode).length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart2 size={18} className="text-indigo-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">Transfer mode breakdown</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(data.transfersByMode).map(([mode, count]) => {
                    const total  = Object.values(data.transfersByMode).reduce((a, b) => a + b, 0);
                    const pct    = total > 0 ? (count / total) * 100 : 0;
                    const isP2P  = mode === 'P2P';
                    return (
                      <div key={mode}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-zinc-400 flex items-center gap-2">
                            {isP2P
                              ? <Wifi size={13} className="text-teal-400" />
                              : <Activity size={13} className="text-indigo-400" />
                            }
                            {mode}
                          </span>
                          <span className="text-zinc-300 font-medium">
                            {count} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-zinc-800/50 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              isP2P
                                ? 'bg-gradient-to-r from-teal-400 to-indigo-500'
                                : 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            <p className="text-xs text-zinc-600 text-center">
              Period: {new Date(data.periodFrom).toLocaleString()} — {new Date(data.periodTo).toLocaleString()}
              {' · '}Auto-refreshes every 60s
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
}


type StatColor = 'indigo' | 'teal' | 'violet' | 'amber';

interface StatCardProps {
  icon: ElementType;
  label: string;
  value: string;
  sub?:  string;
  color: StatColor;
}

const COLOR_MAP: Record<StatColor, { bg: string; text: string; icon: string }> = {
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', icon: 'text-indigo-400' },
  teal:   { bg: 'bg-teal-500/10',   text: 'text-teal-400',   icon: 'text-teal-400'   },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', icon: 'text-violet-400' },
  amber:  { bg: 'bg-amber-500/10',  text: 'text-amber-400',  icon: 'text-amber-400'  },
};

function StatCard({ icon: Icon, label, value, sub, color }: StatCardProps) {
  const c = COLOR_MAP[color];
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card rounded-2xl p-5 space-y-3"
    >
      <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
        <Icon size={18} className={c.icon} />
      </div>
      <div>
        <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
        <p className={`text-2xl font-bold ${c.text} font-mono tracking-tight`}>{value}</p>
        {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}