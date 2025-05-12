
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { 
  User, LogIn, Menu, X 
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2);
  };

  return (
    <header className="bg-white dark:bg-black z-50 sticky top-0 left-0 right-0 px-3 py-2 border-b">
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          telepart
        </Link>

        {/* User Menu */}
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>
                    {currentUser.displayName
                      ? getInitials(currentUser.displayName)
                      : currentUser.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                Профиль
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/favorites')}>
                Избранное
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/chats')}>
                Чаты
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/shop')}>
                Магазин
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/warehouse')}>
                Склад
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/workshop')}>
                Мастерская
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link to="/login">
              <LogIn className="h-4 w-4 mr-1" />
              Войти
            </Link>
          </Button>
        )}

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden"
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        {/* Mobile Menu */}
        <div
          className={cn(
            "fixed inset-0 top-[53px] z-40 md:hidden bg-white dark:bg-black",
            isMenuOpen ? "flex flex-col" : "hidden"
          )}
        >
          <div className="flex flex-col p-4 space-y-2">
            {currentUser ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center justify-start"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Профиль
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center justify-start"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/favorites">
                    Избранное
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center justify-start"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/chats">
                    Чаты
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center justify-start"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/shop">
                    Магазин
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center justify-start"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/warehouse">
                    Склад
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center justify-start"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/workshop">
                    Мастерская
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center justify-start text-destructive"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center justify-start"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Войти
                  </Link>
                </Button>
                
                <Button 
                  size="sm" 
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/register">Зарегистрироваться</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
