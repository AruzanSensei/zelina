import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function Container({ children, className, as: Component = 'div' }: ContainerProps) {
  return (
    <Component className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12', className)}>
      {children}
    </Component>
  );
}
