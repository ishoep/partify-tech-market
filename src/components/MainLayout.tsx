import React from 'react';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import ProfileSidebar from '@/components/ProfileSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "min-h-screen flex flex-col bg-background overflow-hidden",
      plainBackground && "bg-background"
    )}>
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {currentUser && showSidebar && !isMobile && (
          <div className="w-64 border-r bg-background hidden md:block overflow-auto">
            <div className="p-4">
              <ProfileSidebar />
            </div>
          </div>
        )}
        
        <main className={cn(
          "flex-1 min-h-0 overflow-auto", // для корректной работы flex и скроллов
          fullWidth ? "" : "container",
          compact ? "px-1 py-1" : "px-2 py-2 md:px-4 md:py-4",
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
