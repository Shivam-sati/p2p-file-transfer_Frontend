import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Download as DownloadIcon, CheckCircle2,
  AlertCircle, Loader2, ArrowLeft, Clock, Lock
} from 'lucide-react';
import { Button }       from '../components/common/Button';
import { Card }         from '../components/common/Card';
import { ProgressBar }  from '../components/common/ProgressBar';
import { useDownload }  from '../hooks/useDownload';
import { formatBytes, formatDate } from '../lib/utils';

export default function Download() {
  const { code }  = useParams<{ code: string }>();
  const { state, resolveCode, downloadFromServer, reset } = useDownload();
  const { phase, info, progress, error } = state;

  useEffect(() => {
    if (code) resolveCode(code);
    return () => reset();
  }, [code]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-4">
      <div className="w-full max-w-md space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to transfer
        </Link>

        <AnimatePresence mode="wait">
          {phase === 'resolving' && (
            <motion.div
              key="resolving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-16"
            >
              <Loader2 size={32} className="text-indigo-400 animate-spin" />
              <p className="text-zinc-400 text-sm">Resolving share code…</p>
            </motion.div>
          )}

          {phase === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-6 border-red-500/20 bg-red-500/5 text-center">
                <AlertCircle size={36} className="text-red-400 mx-auto mb-4" />
                <h2 className="text-white font-semibold mb-2">Link not found</h2>
                <p className="text-sm text-zinc-400 mb-5">
                  {error || 'This share code is invalid, expired, or has reached its download limit.'}
                </p>
                <Link to="/">
                  <Button variant="outline" size="sm">Go to upload page</Button>
                </Link>
              </Card>
            </motion.div>
          )}

          {(phase === 'ready' || phase === 'downloading' || phase === 'done') && info && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Card className="p-6">
                {/* File icon + info */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <FileText size={26} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-white truncate mb-1">
                      {info.fileName}
                    </h2>
                    <p className="text-sm text-zinc-400">
                      {formatBytes(info.fileSize)}
                      {info.mimeType && (
                        <span className="ml-2 text-zinc-600">· {info.mimeType}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {info.expiresAt && (
                    <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
                      <Clock size={14} className="text-zinc-500 shrink-0" />
                      <div>
                        <p className="text-xs text-zinc-500">Expires</p>
                        <p className="text-xs text-zinc-300">{formatDate(info.expiresAt)}</p>
                      </div>
                    </div>
                  )}
                  {info.maxDownloads && (
                    <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
                      <DownloadIcon size={14} className="text-zinc-500 shrink-0" />
                      <div>
                        <p className="text-xs text-zinc-500">Downloads</p>
                        <p className="text-xs text-zinc-300">
                          {info.downloadCount} / {info.maxDownloads}
                        </p>
                      </div>
                    </div>
                  )}
                  {info.passwordProtected && (
                    <div className="bg-amber-500/10 rounded-xl p-3 flex items-center gap-2 border border-amber-500/20">
                      <Lock size={14} className="text-amber-400 shrink-0" />
                      <p className="text-xs text-amber-400">Password protected</p>
                    </div>
                  )}
                </div>
                {phase === 'downloading' && (
                  <div className="mb-4">
                    <ProgressBar
                      progress={progress}
                      label="Downloading…"
                      color="indigo"
                    />
                  </div>
                )}

                {/* Done */}
                {phase === 'done' && (
                  <div className="flex items-center gap-2 mb-4 text-teal-400 text-sm">
                    <CheckCircle2 size={16} />
                    Download started successfully
                  </div>
                )}

                {(phase === 'ready' || phase === 'done') && (
                  <Button
                    variant="primary"
                    className="w-full rounded-xl"
                    onClick={() => code && downloadFromServer(code)}
                    disabled={phase === 'downloading'}
                  >
                    <DownloadIcon size={18} />
                    {phase === 'done' ? 'Download again' : 'Download file'}
                  </Button>
                )}
              </Card>

              <div className="text-center">
                <p className="text-xs text-zinc-600">
                  Share code:{' '}
                  <span className="font-mono text-zinc-400 tracking-widest">
                    {code}
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}