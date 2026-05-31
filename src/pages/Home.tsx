import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Copy, Check, ExternalLink, RotateCcw,
  Zap, Shield, Globe, ChevronRight
} from 'lucide-react';
import { Dropzone }   from '../components/upload/Dropzone';
import { Button }     from '../components/common/Button';
import { Card }       from '../components/common/Card';
import { useUploader } from '../hooks/useUploader';
import { useUploadStore } from '../store/uploadStore';
import { formatBytes, formatSpeed, formatEta } from '../lib/utils';

export default function Home() {
  const { uploadFile, cancelUpload } = useUploader();
  const {
    phase, progress, speedBps, etaSeconds,
    chunksUploaded, totalChunks,
    fileName, fileSize, shareCode, shareUrl, error, reset,
  } = useUploadStore();

  const [copied, setCopied] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    uploadFile(file);
  }, [uploadFile]);

  const handleCopy = useCallback(() => {
    if (!shareCode) return;
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareCode]);

  const handleReset = useCallback(() => {
    reset();
    setCopied(false);
  }, [reset]);

  const isActive = phase !== 'idle' && phase !== 'done' && phase !== 'error';

  return (
    <div className="pt-28 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center space-y-4"
            >
              <h1 className="text-4xl font-bold tracking-tight text-white">
                Transfer files at{' '}
                <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
                  light speed
                </span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md mx-auto">
                Chunked upload with auto-resume. WebRTC peer-to-peer when available,
                server fallback guaranteed.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <Dropzone onFileSelect={handleFileSelect} />
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-5">
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-zinc-400">
                    {phase === 'hashing'   && 'Computing checksum…'}
                    {phase === 'uploading' && `Chunk ${chunksUploaded} of ${totalChunks}`}
                    {phase === 'merging'   && 'Assembling on server…'}
                    {phase === 'sharing'   && 'Generating share code…'}
                  </span>
                  <div className="flex items-center gap-4 text-zinc-300 font-mono text-xs">
                    {speedBps > 0 && <span>{formatSpeed(speedBps)}</span>}
                    {etaSeconds > 0 && <span>ETA {formatEta(etaSeconds)}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: 'Size',     value: formatBytes(fileSize)            },
                    { label: 'Chunks',   value: `${chunksUploaded}/${totalChunks}` },
                    { label: 'Progress', value: `${Math.round(progress)}%`       },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-xs text-zinc-500 mb-1">{label}</p>
                      <p className="text-sm font-semibold text-zinc-100 font-mono">{value}</p>
                    </div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 text-zinc-500 hover:text-red-400 w-full"
                  onClick={cancelUpload}
                >
                  Cancel upload
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {phase === 'done' && shareCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.25 }}
            >
              <Card className="p-6 border-teal-500/20 bg-teal-500/5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
                    <Check size={20} className="text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Upload complete</h3>
                    <p className="text-sm text-zinc-400">
                      {fileName} · {formatBytes(fileSize)}
                    </p>
                  </div>
                </div>

                {/* Share code */}
                <div className="bg-black/30 rounded-2xl p-5 border border-white/5 mb-4">
                  <p className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">
                    Share Code
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-3xl font-bold tracking-[0.4em] text-white font-mono">
                      {shareCode}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl shrink-0"
                      onClick={handleCopy}
                    >
                      {copied
                        ? <><Check size={14} className="text-teal-400" /> Copied</>
                        : <><Copy size={14} /> Copy</>
                      }
                    </Button>
                  </div>
                </div>

                {/* Download link */}
                <div className="flex items-center gap-3">
                  <a
                    href={`/download/${shareCode}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                  >
                    <Button variant="primary" className="w-full rounded-xl gap-2">
                      <ExternalLink size={16} />
                      Open download page
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="md"
                    className="rounded-xl"
                    onClick={handleReset}
                  >
                    <RotateCcw size={16} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {phase === 'error' && error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-5 border-red-500/20 bg-red-500/5">
                <p className="text-sm text-red-400 mb-3">{error}</p>
                <Button variant="danger" size="sm" onClick={handleReset}>
                  <RotateCcw size={14} />
                  Try again
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-3 gap-4 pt-4"
            >
              {[
                { icon: Zap,    label: 'Auto-resume',   desc: 'Interrupted? Pick up where you left off' },
                { icon: Shield, label: 'SHA-256 verify', desc: 'End-to-end checksum on every file'      },
                { icon: Globe,  label: 'P2P first',     desc: 'WebRTC direct transfer when possible'   },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="glass-card rounded-2xl p-4 text-center space-y-2"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto">
                    <Icon size={18} className="text-indigo-400" />
                  </div>
                  <p className="text-sm font-medium text-zinc-200">{label}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}