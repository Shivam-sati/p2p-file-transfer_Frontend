import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, File, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn, formatBytes } from '../../lib/utils';
import { useUploadStore } from '../../store/uploadStore';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
}

export const Dropzone = ({ onFileSelect }: DropzoneProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const { phase, progress, fileName, fileSize, error, speedBps, etaSeconds, chunksUploaded, totalChunks } = useUploadStore();

  const isUploading = phase !== 'idle' && phase !== 'done' && phase !== 'error';

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0]);
  }, [onFileSelect]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
  }, [onFileSelect]);

  const phaseLabel = {
    hashing:   'Computing checksum…',
    uploading: `Uploading chunk ${chunksUploaded} of ${totalChunks}`,
    merging:   'Assembling on server…',
    sharing:   'Generating share code…',
  }[phase] ?? '';

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!isUploading ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              'relative group cursor-pointer border border-dashed rounded-[2.5rem] p-16 text-center transition-all duration-500 overflow-hidden',
              isDragActive
                ? 'border-indigo-500/60 bg-indigo-500/10 shadow-[0_0_80px_rgba(79,70,229,0.1)]'
                : 'border-indigo-500/30 bg-white/5 backdrop-blur-md hover:border-indigo-500/50 hover:bg-white/[0.08]'
            )}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleInput}
            />
            <div className="relative z-10 flex flex-col items-center gap-8">
              <motion.div
                animate={isDragActive ? { y: -10, scale: 1.1 } : { y: 0, scale: 1 }}
                className={cn(
                  'w-24 h-24 rounded-full border flex items-center justify-center transition-all duration-500 shadow-2xl',
                  isDragActive
                    ? 'bg-indigo-500 border-indigo-400 text-white shadow-indigo-500/20'
                    : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 group-hover:border-indigo-400/40'
                )}
              >
                <Upload size={40} strokeWidth={1.5} />
              </motion.div>
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-white tracking-tight">
                  {isDragActive ? 'Drop it here' : 'Drop files to transfer'}
                </h3>
                <p className="text-slate-400 max-w-sm mx-auto leading-relaxed text-sm">
                  Automatic WebRTC peer detection. Large files are chunked for maximum reliability.
                </p>
              </div>
              <Button variant="secondary" size="lg" className="rounded-full shadow-2xl">
                Select Files to Transfer
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-[2rem] p-8"
          >
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <File size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-zinc-100 truncate">{fileName}</h4>
                <p className="text-sm text-zinc-400">{formatBytes(fileSize)}</p>
              </div>
              {progress === 100 && <CheckCircle2 className="text-teal-400 shrink-0" size={24} />}
              {error && <AlertCircle className="text-red-400 shrink-0" size={24} />}
            </div>

            <ProgressBar
              progress={progress}
              label={error ? 'Upload Failed' : phaseLabel}
              color={error ? 'violet' : progress === 100 ? 'teal' : 'indigo'}
            />

            {error && (
              <p className="mt-4 text-sm text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                {error}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};