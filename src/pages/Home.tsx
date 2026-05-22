import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Link as LinkIcon, Shield, Clock, Download as DownloadIcon } from 'lucide-react';
import { Dropzone } from '../components/upload/Dropzone';
import { useUploader } from '../hooks/useUploader';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { shareApi } from '../services/shareApi';
import { useUploadStore } from '../store/uploadStore';

export default function Home() {
  const { uploadFile } = useUploader();
  const { progress, fileId, reset } = useUploadStore();
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileSelect = async (file: File) => {
    const id = await uploadFile(file);
    if (id) {
      handleGenerateShare(id);
    }
  };

  const handleGenerateShare = async (id: string) => {
    setIsGenerating(true);
    try {
      const info = await shareApi.createShare(id, { expiryHours: 24 });
      setShareInfo(info);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareUrl = shareInfo?.shareUrl || '';

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      {/* Immersive Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[100px]" />
      </div>

      <main className="relative max-w-5xl mx-auto space-y-16">
        {/* Navigation Indicator */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 shadow-[0_0_15px_rgba(45,212,191,0.1)]"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-[0.2em]">Node Active: Local-Nexus-01</span>
          </motion.div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter text-white leading-[1.05]"
          >
            Drop large <br />
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-teal-400 bg-clip-text text-transparent italic">
              files here.
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed"
          >
            Automatic WebRTC peer detection enabled. Large files are <br className="hidden md:block" /> 
            automatically chunked for maximum reliability.
          </motion.p>
        </div>

        {/* Action Area */}
        <div className="relative z-10">
          <Dropzone onFileSelect={handleFileSelect} />
          
          <div className="mt-8 flex justify-center gap-4">
            <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-indigo-400/80 border border-indigo-500/20 px-3 py-1 rounded-md backdrop-blur-sm">Up to 10GB</span>
            <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-teal-400/80 border border-teal-500/20 px-3 py-1 rounded-md backdrop-blur-sm">End-to-End Encrypted</span>
          </div>
        </div>

        {/* Share Section */}
        <AnimatePresence>
          {shareInfo && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <Card className="flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                      <Share2 size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Your Share Link</h3>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-black/40 border border-white/5">
                    <input
                      readOnly
                      value={shareUrl}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-300 text-sm overflow-hidden text-ellipsis"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigator.clipboard.writeText(shareUrl)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <Button className="mt-6" onClick={reset}>
                  Upload Another File
                </Button>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card hover={false} className="flex flex-col items-center justify-center text-center p-4">
                  <Shield size={24} className="text-zinc-500 mb-2" />
                  <span className="text-sm font-medium text-zinc-300">End-to-End P2P</span>
                  <span className="text-xs text-zinc-500 mt-1">Directly between browsers</span>
                </Card>
                <Card hover={false} className="flex flex-col items-center justify-center text-center p-4">
                  <Shield size={24} className="text-zinc-500 mb-2" />
                  <span className="text-sm font-medium text-zinc-300">Secure AES-GCM</span>
                  <span className="text-xs text-zinc-500 mt-1">Encrypted signaling data</span>
                </Card>
                <Card hover={false} className="flex flex-col items-center justify-center text-center p-4">
                  <Clock size={24} className="text-zinc-500 mb-2" />
                  <span className="text-sm font-medium text-zinc-300">24h Expiry</span>
                  <span className="text-xs text-zinc-500 mt-1">Self-destructing links</span>
                </Card>
                <Card hover={false} className="flex flex-col items-center justify-center text-center p-4">
                  <DownloadIcon size={24} className="text-zinc-500 mb-2" />
                  <span className="text-sm font-medium text-zinc-300">Auto Fallback</span>
                  <span className="text-xs text-zinc-500 mt-1">Server download if offline</span>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
