
import React from 'react';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  fullWidth?: boolean;
  plainBackground?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  className,
  compact = false,
  fullWidth = false,
  plainBackground = false
}) => {
  return (
    <div className={cn(
      "min-h-screen flex flex-col",
      plainBackground && "bg-white dark:bg-black"
    )}>
      <Header />
      <main className={cn(
        "flex-1", 
        fullWidth ? "" : "container", 
        compact ? "px-1 py-1" : "px-2 py-2", 
        className
      )}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
