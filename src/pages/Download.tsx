import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Download as DownloadIcon, Shield, File, Info, Zap, AlertTriangle, Box } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { shareApi } from '../services/shareApi';
import { useWebRTC } from '../hooks/useWebRTC';
import { formatBytes, cn } from '../lib/utils';
import { ShareInfo } from '../types/api';

export default function Download() {
  const { code } = useParams<{ code: string }>();
  const [info, setInfo] = useState<ShareInfo | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  // WebRTC logic (for receiver side)
  // We'll get the fileId from info after verification
  const { connectionStatus, transferProgress, startTransfer } = useWebRTC(info?.code || '', false);

  useEffect(() => {
    if (code) {
      handleVerify();
    }
  }, [code]);

  const handleVerify = async () => {
    if (!code) return;
    setIsVerifying(true);
    try {
      const data = await shareApi.validateCode(code, password || undefined);
      setInfo(data);
      setShowPasswordInput(false);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setShowPasswordInput(true);
      } else {
        setError('Invalid or expired share link');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleServerDownload = () => {
    if (code) {
      window.open(shareApi.getDownloadUrl(code), '_blank');
    }
  };

  if (isVerifying && !info) return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-indigo-500">
        <Zap size={48} />
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <main className="relative max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {showPasswordInput ? (
            <motion.div key="password" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Card className="max-w-md mx-auto p-12 text-center space-y-8">
                <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 mx-auto">
                  <Shield size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">Protected Link</h2>
                  <p className="text-zinc-400">Please enter the password to access this file.</p>
                </div>
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                  />
                  <Button className="w-full" onClick={handleVerify}>Unlock File</Button>
                </div>
              </Card>
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="p-12 text-center space-y-6">
                <div className="w-20 h-20 rounded-[2.5rem] bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
                  <AlertTriangle size={40} />
                </div>
                <h2 className="text-3xl font-bold text-white">{error}</h2>
                <Button variant="secondary" onClick={() => window.location.href = '/'}>Go Home</Button>
              </Card>
            </motion.div>
          ) : info && (
            <motion.div key="content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <Card className="p-8 md:p-12">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white glow-indigo shadow-xl relative">
                    <File size={48} />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -inset-2 rounded-[3rem] border border-indigo-500/30 -z-10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{info.fileName}</h1>
                    <div className="flex items-center gap-4 justify-center text-zinc-400">
                      <span className="flex items-center gap-1.5"><Box size={16} /> {formatBytes(info.fileSize)}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span className="flex items-center gap-1.5 uppercase tracking-wider text-xs font-semibold">{info.mimeType?.split('/')[1] || 'FILE'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-6 border-t border-white/5">
                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 group cursor-pointer hover:bg-indigo-500/10 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <Zap size={20} className="text-indigo-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">Recommended</span>
                      </div>
                      <h4 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                        P2P Transfer
                      </h4>
                      <p className="text-sm text-zinc-500 mt-1 mb-4">Direct high-speed browser sync.</p>
                      <Button className="w-full" variant="primary" onClick={startTransfer}>
                        Connect & Download
                      </Button>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-zinc-800/20 border border-white/5 group cursor-pointer hover:bg-zinc-800/40 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <DownloadIcon size={20} className="text-zinc-500" />
                      </div>
                      <h4 className="text-lg font-bold text-zinc-100 italic">
                        Server Fallback
                      </h4>
                      <p className="text-sm text-zinc-500 mt-1 mb-4">Standard secure download.</p>
                      <Button className="w-full" variant="secondary" onClick={handleServerDownload}>
                        Standard Download
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex items-center gap-3 justify-center text-zinc-500 bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
                <Info size={18} />
                <p className="text-sm">Secure end-to-end encrypted transfer. Your data never touches our storage in P2P mode.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
