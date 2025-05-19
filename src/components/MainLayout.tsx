<<<<<<< HEAD

=======
>>>>>>> 355bd4cb5ae7e1614833ed2d569801eb6be3e56d
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
  fullWidth = true, // Changed default to true to remove container
  plainBackground = false,
  showSidebar = false
}) => {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "min-h-screen flex flex-col bg-background",
      plainBackground && "bg-background"
    )}>
      <Header />
      
      <div className="flex flex-1">
        {currentUser && showSidebar && !isMobile && (
          <div className="w-64 border-r bg-background hidden md:block">
            <div className="p-4">
              <ProfileSidebar />
            </div>
          </div>
        )}
        
        <main className={cn(
          "flex-1 flex flex-col", // Base layout styling
          fullWidth ? "px-2 sm:px-4 md:px-6" : "container", // Minimal padding when fullWidth is true
          compact ? "py-1" : "py-2 md:py-4", // Vertical padding
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
