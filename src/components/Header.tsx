
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, Heart, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import ProfileSidebar from '@/components/ProfileSidebar';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="w-full border-b p-3">
      <div className="container flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center">
          {currentUser && isMobile && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80%] sm:w-[350px] p-0">
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="font-semibold text-lg">Личный кабинет</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    <ProfileSidebar onLinkClick={() => setIsOpen(false)} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
          
          <Link to="/" className="flex items-center text-xl font-bold text-primary">
            Telepart
          </Link>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/favorites')}>
                <Heart className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={() => navigate('/chats')}>
                <MessageCircle className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                className={cn(
                  "flex items-center gap-2",
                  isMobile && "px-2"
                )}
                onClick={() => navigate('/profile')}
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback>
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                {!isMobile && <span>Профиль</span>}
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate('/login')}>
                Войти
              </Button>
              <Button onClick={() => navigate('/register')}>
                Регистрация
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
