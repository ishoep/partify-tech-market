
import React from 'react';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={cn("container px-4 py-4 flex-1", className)}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
