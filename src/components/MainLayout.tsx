
import React from 'react';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import ProfileSidebar from '@/components/ProfileSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  fullWidth?: boolean;
  plainBackground?: boolean;
  showSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  className,
  compact = false,
  fullWidth = false,
  plainBackground = false,
  showSidebar = false
}) => {
  const { currentUser } = useAuth();
  
  return (
    <div className={cn(
      "min-h-screen flex flex-col",
      plainBackground && "bg-white dark:bg-black"
    )}>
      <Header />
      <div className="flex flex-1">
        {currentUser && showSidebar && (
          <div className="w-64 border-r bg-white dark:bg-black hidden md:block">
            <div className="p-4">
              <ProfileSidebar />
            </div>
          </div>
        )}
        <main className={cn(
          "flex-1", 
          fullWidth ? "" : "container", 
          compact ? "px-1 py-1" : "px-2 py-2", 
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
