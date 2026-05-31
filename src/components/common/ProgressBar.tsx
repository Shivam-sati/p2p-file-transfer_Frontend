import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
  progress:   number;
  className?: string;
  label?:     string;
  size?:      'sm' | 'md' | 'lg';
  color?:     'indigo' | 'teal' | 'violet';
}

export const ProgressBar = ({
  progress,
  className,
  label,
  size  = 'md',
  color = 'indigo',
}: ProgressBarProps) => {
  const heights = {
    sm: 'h-1',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colors = {
    indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]',
    teal:   'bg-gradient-to-r from-teal-400 to-indigo-500 shadow-[0_0_8px_rgba(45,212,191,0.5)]',
    violet: 'bg-gradient-to-r from-violet-500 to-indigo-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]',
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      {label && (
        <div className="flex justify-between text-sm font-medium">
          <span className="text-zinc-400">{label}</span>
          <span className="text-zinc-200">{Math.round(progress)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-zinc-800/50 rounded-full overflow-hidden', heights[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, progress)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn('h-full', colors[color])}
        />
      </div>
    </div>
  );
};