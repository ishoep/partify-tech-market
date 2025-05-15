
import React from 'react';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import ProfileSidebar from '@/components/ProfileSidebar';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      "min-h-screen flex flex-col",
      plainBackground && "bg-white dark:bg-black"
    )}>
      <Header />
      <div className="flex flex-1">
        {currentUser && showSidebar && (
          <>
            {isMobile ? (
              <div className="block md:hidden fixed bottom-4 left-4 z-50">
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button size="icon" variant="outline" className="rounded-full shadow-lg">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="h-[80vh]">
                    <div className="max-w-md mx-auto w-full p-6">
                      <ProfileSidebar />
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            ) : (
              <div className="w-64 border-r bg-white dark:bg-black hidden md:block">
                <div className="p-4">
                  <ProfileSidebar />
                </div>
              </div>
            )}
          </>
        )}
        
        <main className={cn(
          "flex-1", 
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
