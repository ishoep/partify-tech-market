
import React from 'react';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  className,
  compact = false
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={cn(
        "container flex-1", 
        compact ? "px-2 py-2" : "px-3 py-3", 
        className
      )}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
