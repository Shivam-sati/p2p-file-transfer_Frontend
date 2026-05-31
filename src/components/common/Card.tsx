import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children:  ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div className={cn('glass-card rounded-2xl', className)}>
      {children}
    </div>
  );
};