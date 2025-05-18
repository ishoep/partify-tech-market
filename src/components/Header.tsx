
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, Heart, Menu, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import ProfileSidebar from '@/components/ProfileSidebar';
import ThemeToggle from '@/components/ThemeToggle';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  return (
    <header className="w-full border-b sticky top-0 bg-background z-50">
      <div className="flex items-center justify-between gap-4 px-4 py-2">
        {/* Логотип */}
        <Link to="/" className="flex items-center text-xl font-bold text-primary">
          Teleparts
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Переключатель темы */}
          <ThemeToggle />

          {currentUser && isMobile && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[85%] sm:w-[350px] p-0">
                <SheetTitle className="sr-only">Меню</SheetTitle>
                <SheetDescription className="sr-only">
                  Навигационное меню пользователя
                </SheetDescription>
                <div className="h-full flex flex-col">
                  {/* Хедер сайдбара */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-semibold text-lg">Меню</h2>
                    <ThemeToggle />
                  </div>

                  {/* Контент */}
                  <div className="flex-1 overflow-auto">
                    {/* Быстрые действия */}
                    <div className="p-4 border-b">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3 mb-2"
                        onClick={() => {
                          navigate('/favorites');
                          setIsOpen(false);
                        }}
                      >
                        <Heart className="h-4 w-4" />
                        Избранное
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3"
                        onClick={() => {
                          navigate('/chats');
                          setIsOpen(false);
                        }}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Сообщения
                      </Button>
                    </div>

                    {/* Основное меню */}
                    <ProfileSidebar 
                      onLinkClick={() => setIsOpen(false)} 
                      excludeLinks={['/favorites', '/chats']} 
                    />
                  </div>

                  {/* Кнопка выхода */}
                  <div className="p-4 border-t">
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start gap-3"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Выйти
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* Десктоп: показываем фав/чат/профиль */}
          {currentUser && !isMobile && (
            <>
              <Button variant="ghost" size="icon" onClick={() => navigate('/favorites')}>
                <Heart className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" onClick={() => navigate('/chats')}>
                <MessageCircle className="h-5 w-5" />
              </Button>

              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/profile')}
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback>
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span>Профиль</span>
              </Button>
            </>
          )}

          {/* Гость */}
          {!currentUser && (
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
